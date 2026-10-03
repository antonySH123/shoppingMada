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

interface IState {
  users: Iuser[] | [];
  isOpen: boolean;
  newUser: Iuser | null;
  loading: boolean;
}

type Action =
  | { type: "FETCH_SUCCESS"; payload: Iuser[] }
  | { type: "FETCH_START" }
  | { type: "TOGGLE_MODAL"; payload: boolean }
  | { type: "CREATE_USER"; payload: Iuser | null }
  | { type: "LOADING"; payload: boolean };

const reducer = (state: IState, action: Action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, users: action.payload };
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
};

function Compte() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const csrf = useCSRF();

  const fetchUsers = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}users`, {
        credentials: "include",
      });
      const payload = await response.json();
      dispatch({
        type: "FETCH_SUCCESS",
        payload: Array.isArray(payload.data) ? payload.data : [],
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return state.users;

    return state.users.filter((account) => {
      const username = account.username?.toLowerCase() ?? "";
      const email = account.email?.toLowerCase() ?? "";
      const phone = account.phonenumber?.toLowerCase() ?? "";
      const role =
        account.userGroupMember_id?.usergroup_id?.name?.toLowerCase() ?? "";

      return [username, email, phone, role].some((value) =>
        value.includes(query),
      );
    });
  }, [search, state.users]);

  const closeModal = () => dispatch({ type: "TOGGLE_MODAL", payload: false });

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
    [csrf, fetchUsers, state.newUser],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

          <div className="admin-quick-stats">
            <article className="admin-stat-card">
              <span className="admin-stat-label">Total</span>
              <strong className="admin-stat-value">{state.users.length}</strong>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">Boutiques</span>
              <strong className="admin-stat-value">
                {
                  state.users.filter(
                    (account) =>
                      account.userGroupMember_id?.usergroup_id?.name ===
                      "Boutiks",
                  ).length
                }
              </strong>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">Clients</span>
              <strong className="admin-stat-value">
                {
                  state.users.filter(
                    (account) =>
                      account.userGroupMember_id?.usergroup_id?.name ===
                      "Client",
                  ).length
                }
              </strong>
            </article>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Rôle</th>
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
                      <td>{account.phonenumber}</td>
                      <td>{account.email}</td>
                      <td>
                        <Link
                          to={`/espace_vendeur/accountsSettings/${account._id}`}
                          className="admin-table-action"
                        >
                          Voir plus
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="admin-empty-state">
                      Aucun compte ne correspond à cette recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
          />
          <input
            type="email"
            onChange={handleChange}
            name="email"
            placeholder="Adresse mail"
          />
          <input
            type="text"
            onChange={handleChange}
            name="phonenumber"
            placeholder="Téléphone"
          />
          <input
            type="password"
            onChange={handleChange}
            name="password"
            placeholder="Mot de passe"
          />
          <button className="admin-action-primary" type="submit">
            {state.loading ? "Veuillez patienter..." : "Enregistrer"}
          </button>
        </form>
      </UserInfo>
    </>
  );
}

export default Compte;
