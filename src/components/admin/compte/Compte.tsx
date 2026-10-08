import { Link, Navigate } from "react-router-dom";
import Iuser from "../../../Interface/UserInterface";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useAuth } from "../../../helper/useAuth";
import UserInfo from "../../modals/UserInfo";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import Skeleton from "react-loading-skeleton";
import Preloader from "../../loading/Preloader";
import { requestAdminStepUp } from "../../../helper/adminStepUp";

interface IState {
  users: Iuser[] | [];
  isOpen: boolean;
  newUser: Iuser | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; pages: number; total: number };
  stats: { total: number; sellers: number; clients: number; admins: number; disabled: number; active: number };
}

type Action =
  | { type: "FETCH_SUCCESS"; payload: { users: Iuser[]; pagination?: IState["pagination"]; stats?: IState["stats"] } }
  | { type: "FETCH_START" }
  | { type: "TOGGLE_MODAL"; payload: boolean }
  | { type: "CREATE_USER"; payload: Iuser | null }
  | { type: "LOADING"; payload: boolean }
  | { type: "FETCH_ERROR"; payload: string };

const reducer = (state: IState, action: Action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: null, users: action.payload.users, pagination: action.payload.pagination ?? state.pagination, stats: action.payload.stats ?? state.stats };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload };
    case "CREATE_USER":
      return { ...state, newUser: action.payload };
    case "LOADING":
      return { ...state, loading: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

const initialState: IState = {
  users: [],
  isOpen: false,
  newUser: null,
  loading: false,
  error: null,
  pagination: { page: 1, pages: 1, total: 0 },
  stats: { total: 0, sellers: 0, clients: 0, admins: 0, disabled: 0, active: 0 },
};

function Compte() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const csrf = useCSRF();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (role === "Boutiks") setRoleFilter("Boutiks");
  }, []);

  const fetchUsers = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", q: search, role: roleFilter, status: statusFilter });
      const response = await fetch(`${import.meta.env.REACT_API_URL}users?${params}`, {
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.message || "Impossible de charger les comptes.");
      dispatch({
        type: "FETCH_SUCCESS",
        payload: { users: Array.isArray(payload.data) ? payload.data : [], pagination: payload.pagination, stats: payload.stats },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les comptes.";
      dispatch({ type: "FETCH_ERROR", payload: message });
      toast.error(message);
    }
  }, [page, roleFilter, search, statusFilter]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.users.filter((account) => {
      const username = account.username?.toLowerCase() ?? "";
      const email = account.email?.toLowerCase() ?? "";
      const phone = account.phonenumber?.toLowerCase() ?? "";
      const shopName = account.boutiks_id?.name?.toLowerCase() ?? "";
      const role =
        account.userGroupMember_id?.usergroup_id?.name?.toLowerCase() ?? "";

      const roleMatches = roleFilter === "all" || role === roleFilter.toLowerCase() || (roleFilter === "disabled" && !role);
      const statusMatches = statusFilter === "all" || (statusFilter === "active" ? Boolean(account.userGroupMember_id) : !account.userGroupMember_id);
      const searchMatches = !query || [username, email, phone, shopName, role].some((value) => value.includes(query));
      return roleMatches && statusMatches && searchMatches;
    });
  }, [state.users, search, roleFilter, statusFilter]);
  const activeCount = state.stats.active;
  const sellerCount = state.stats.sellers;
  const clientCount = state.stats.clients;
  const roleSegments = [
    { id: "all", label: "Tous les comptes", count: state.stats.total },
    { id: "Boutiks", label: "Boutiques", count: sellerCount },
    { id: "Client", label: "Clients", count: clientCount },
    { id: "Super Admin", label: "Administrateurs", count: state.stats.admins },
    { id: "disabled", label: "Sans rôle actif", count: state.stats.disabled },
  ];

  const closeModal = () => dispatch({ type: "TOGGLE_MODAL", payload: false });

  const impersonate = async (account: Iuser) => {
    const reason = window.prompt(`Motif obligatoire pour accéder temporairement au compte vendeur ${account.username} (8 caractères minimum) :`);
    if (!reason?.trim() || reason.trim().length < 8 || !csrf) return;
    try {
      const stepUp = await requestAdminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/impersonation/${account._id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp }, body: JSON.stringify({ reason }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Assistance impossible.");
      await fetch(`${import.meta.env.REACT_API_URL}auth/refresh`, { method: "POST", credentials: "include", headers: { "xsrf-token": csrf } });
      window.location.assign("/espace_vendeur/dash");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Assistance impossible."); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: "CREATE_USER",
      payload: { ...(state.newUser ?? {}), [name]: value } as Iuser,
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (state.loading) return;
      dispatch({ type: "LOADING", payload: true });
      try {
        if (csrf) {
          const response = await fetch(
            `${import.meta.env.REACT_API_URL}auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xsrf-token": csrf,
              },
              body: JSON.stringify(state.newUser),
              credentials: "include",
            },
          );

          if (response.ok) {
            const result = await response.json();
            toast.success(result.message);
            dispatch({ type: "TOGGLE_MODAL", payload: false });
            fetchUsers();
          } else {
            const result = await response.json().catch(() => null);
            toast.error(result?.message || "Impossible de créer le compte.");
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        dispatch({ type: "LOADING", payload: false });
      }
    },
    [csrf, fetchUsers, state.loading, state.newUser],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  if (user?.userGroupMember_id.usergroup_id.name !== "Super Admin") {
    return <Navigate to="/espace_vendeur/dash" />;
  }

  return !csrf ? (
    <Preloader />
  ) : (
    <>
      <div className="flex flex-col gap-5">
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-panel-kicker">Administration</p>
              <h1 className="admin-panel-title">Gestion des comptes</h1>
              <p className="admin-panel-subtitle">
                Suivez les comptes, les boutiques et les profils du réseau.
              </p>
            </div>
            <div className="admin-panel-actions">
              <label className="admin-search">
                <span className="sr-only">Rechercher un compte</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher ..."
                />
              </label>
              <select aria-label="Filtrer par état du compte" className="admin-search-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Tous les états</option>
                <option value="active">Actifs</option>
                <option value="inactive">Désactivés</option>
              </select>
              <button
                className="admin-action-primary"
                onClick={() =>
                  dispatch({ type: "TOGGLE_MODAL", payload: true })
                }
                type="button"
              >
                Nouveau compte
              </button>
            </div>
          </div>

          <nav className="accounts-role-tabs" aria-label="Filtrer les comptes par rôle">
            {roleSegments.map((segment) => (
              <button
                key={segment.id}
                type="button"
                className={`accounts-role-tab ${roleFilter === segment.id ? "is-active" : ""}`}
                aria-pressed={roleFilter === segment.id}
                onClick={() => setRoleFilter(segment.id)}
              >
                <span>{segment.label}</span>
                <strong>{segment.count}</strong>
              </button>
            ))}
          </nav>

          <div className="admin-quick-stats">
            <article className="admin-stat-card">
              <span className="admin-stat-label">Total</span>
                <strong className="admin-stat-value">{state.stats.total}</strong>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">Boutiques</span>
              <strong className="admin-stat-value">
                {sellerCount}
              </strong>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">Clients</span>
              <strong className="admin-stat-value">
                {clientCount}
              </strong>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">Comptes actifs</span>
              <strong className="admin-stat-value">{activeCount}</strong>
            </article>
          </div>
          <div className="flex items-center justify-between gap-3 border-t p-4 text-sm text-[var(--admin-muted)]"><span>{state.pagination.total} compte(s) · page {state.pagination.page} / {Math.max(1,state.pagination.pages)}</span><div className="flex gap-2"><button className="admin-button admin-button--secondary admin-button--sm" disabled={page<=1||state.loading} onClick={()=>setPage(page-1)}>Précédent</button><button className="admin-button admin-button--secondary admin-button--sm" disabled={page>=state.pagination.pages||state.loading} onClick={()=>setPage(page+1)}>Suivant</button></div></div>

          {state.error && (
            <div className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              <p>{state.error}</p>
              <button type="button" className="mt-2 font-semibold underline" onClick={() => void fetchUsers()}>
                Réessayer
              </button>
            </div>
          )}

          <div className="accounts-desktop-table hidden md:block overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Boutique</th>
                  <th>Statut</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state.loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td>
                        <Skeleton width={40} />
                      </td>
                      <td>
                        <Skeleton width={120} />
                      </td>
                      <td>
                        <Skeleton width={90} />
                      </td>
                      <td>
                        <Skeleton width={100} />
                      </td>
                      <td>
                        <Skeleton width={180} />
                      </td>
                      <td>
                        <Skeleton width={80} />
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((account, index) => (
                    <tr key={account._id || index}>
                      <td className="font-mono text-xs">{index + 1}</td>
                      <td className="font-semibold text-[var(--admin-text)]">
                        {account.username}
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${account.userGroupMember_id?.usergroup_id?.name === "Boutiks" ? "admin-status-badge-primary" : "admin-status-badge-neutral"}`}
                        >
                          {account.userGroupMember_id?.usergroup_id?.name ||
                            "Compte"}
                        </span>
                      </td>
                      <td>{account.boutiks_id?.name ?? "—"}</td>
                      <td>
                        <span
                          className={`admin-status-badge admin-status-badge--${account.userGroupMember_id ? "success" : "neutral"}`}
                        >
                          {account.userGroupMember_id ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td>{account.phonenumber}</td>
                      <td>{account.email}</td>
                      <td>
                        <Link
                          to={`/espace_vendeur/accountsSettings/${account._id}`}
                          className="admin-table-action"
                        >
                          Voir plus
                        </Link>
                        {account.userGroupMember_id?.usergroup_id?.name === "Boutiks" && <button type="button" className="admin-table-action ml-2" onClick={() => void impersonate(account)}>Assister</button>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="admin-empty-state">
                      {state.error ? "Les comptes n’ont pas pu être chargés." : "Aucun compte ne correspond à cette recherche."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="accounts-mobile-list md:hidden">
            {state.loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <article className="accounts-mobile-card" key={`account-loading-${index}`}>
                  <Skeleton height={18} width="55%" />
                  <Skeleton height={14} width="85%" />
                  <Skeleton height={38} />
                </article>
              ))
            ) : filteredUsers.length ? (
              filteredUsers.map((account) => {
                const accountRole = account.userGroupMember_id?.usergroup_id?.name;
                const isShop = accountRole === "Boutiks";
                const shop = account.boutiks_id;
                const subscription = shop?.subscription_id;
                return (
                  <article className="accounts-mobile-card" key={account._id}>
                    <div className="accounts-mobile-card-heading">
                      <span className="accounts-avatar" aria-hidden="true">
                        {(shop?.name || account.username || "?").slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate">{shop?.name || account.username}</strong>
                        <span className="block truncate text-xs text-[var(--admin-muted)]">{account.username}</span>
                      </div>
                      <span className={`accounts-role-badge ${isShop ? "is-shop" : ""}`}>
                        {accountRole || "Sans rôle"}
                      </span>
                    </div>
                    <div className="accounts-mobile-card-details">
                      <span>{account.email || "E-mail non renseigné"}</span>
                      <span>{account.phonenumber || "Téléphone non renseigné"}</span>
                      {isShop && <span>Forfait {subscription?.plan || shop?.plan || "Gratuit"}{subscription?.endDate ? ` · fin ${new Date(subscription.endDate).toLocaleDateString("fr-FR")}` : ""}</span>}
                      <span className={account.userGroupMember_id ? "is-active" : "is-disabled"}>
                        {account.userGroupMember_id ? "Compte actif" : "Compte désactivé"}
                      </span>
                    </div>
                    <div className="accounts-mobile-card-actions">
                      <Link to={`/espace_vendeur/accountsSettings/${account._id}`} className="admin-table-action">Voir le compte</Link>
                      {isShop && <button type="button" className="admin-table-action" onClick={() => void impersonate(account)}>Assister</button>}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="admin-empty-state">Aucun compte ne correspond à cette recherche.</div>
            )}
          </div>
        </div>
      </div>

      <UserInfo isOpen={state.isOpen} onClose={closeModal}>
        <div className="admin-modal-header">
          <div>
            <p className="admin-panel-kicker">Création</p>
            <h2>Nouveau compte</h2>
          </div>
        </div>
        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={handleChange}
            name="username"
            placeholder="Nom d'utilisateur"
            autoComplete="username"
            required
            minLength={3}
            maxLength={50}
          />
          <input
            type="email"
            onChange={handleChange}
            name="email"
            placeholder="Adresse mail"
            autoComplete="email"
            required
          />
          <input
            type="text"
            onChange={handleChange}
            name="phonenumber"
            placeholder="Téléphone"
            autoComplete="tel"
            required
            maxLength={40}
          />
          <input
            type="password"
            onChange={handleChange}
            name="password"
            placeholder="Mot de passe"
            autoComplete="new-password"
            required
            minLength={8}
          />
            <button className="admin-action-primary" type="submit" disabled={state.loading}>
            {state.loading ? "Veuillez patienter..." : "Enregistrer"}
          </button>
        </form>
      </UserInfo>
    </>
  );
}

export default Compte;
