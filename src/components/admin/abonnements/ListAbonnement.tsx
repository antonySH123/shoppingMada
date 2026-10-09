import Isubscription from "../../../Interface/subscription.interface";
import IAction from "../../../Interface/action.interface";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { formatStatus } from "../../../helper/locale";

interface IState {
  subscription: Isubscription[] | [];
  selectedId: string | null;
  subscribeinfo: Isubscription | null;
  rejected: boolean;
  motif: string | null;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  error: string | null;
  detailError: string | null;
}

const initialState: IState = {
  subscription: [],
  selectedId: null,
  subscribeinfo: null,
  rejected: false,
  motif: null,
  loading: true,
  detailLoading: false,
  saving: false,
  error: null,
  detailError: null,
};

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        subscription: action.payload as Isubscription[],
        loading: false,
        error: null,
      };
    case "SELECT_ID":
      return { ...state, selectedId: action.payload as string, subscribeinfo: null, detailLoading: true, detailError: null, rejected: false, motif: null };
    case "CLEAR_DETAILS":
      return { ...state, rejected: false, selectedId: null, subscribeinfo: null, detailLoading: false, detailError: null, motif: null };
    case "GET_INFO":
      return { ...state, subscribeinfo: action.payload as Isubscription, detailLoading: false, detailError: null };
    case "REJECTED":
      return { ...state, rejected: action.payload as boolean };
    case "HANDLE_MOTIF":
      return { ...state, motif: action.payload as string | null };
    case "LOADING":
      return { ...state, loading: action.payload as boolean };
    case "DETAIL_ERROR":
      return { ...state, detailLoading: false, detailError: action.payload as string | null };
    case "LIST_ERROR":
      return { ...state, loading: false, error: action.payload as string | null };
    case "SAVING":
      return { ...state, saving: action.payload as boolean };
    default:
      throw new Error("Action inconnue!");
  }
};

function ListAbonnement() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const csrf = useCSRF();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const status = new URLSearchParams(location.search).get("status");
    if (status && ["Pending", "Completed", "Rejected", "Canceled"].includes(status)) {
      setStatusFilter(status);
    }
  }, [location.search]);

  const fetchData = useCallback(async () => {
    dispatch({ type: "LOADING", payload: true });
    dispatch({ type: "DETAIL_ERROR", payload: null });
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscription?page=${page}&limit=20&q=${encodeURIComponent(searchTerm)}${statusFilter === "All" ? "" : `&status=${statusFilter}`}`,
        {
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Impossible de charger les abonnements.");
      dispatch({ type: "FETCH_START", payload: Array.isArray(result.data) ? result.data : [] });
      setPages(result.pagination?.pages ?? 1); setTotal(result.pagination?.total ?? 0);
      setStatusCounts(result.stats ?? {});
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les abonnements.";
      dispatch({ type: "LIST_ERROR", payload: message });
      toast.error(message);
    }
  }, [page, searchTerm, statusFilter]);

  const getData = useCallback(async () => {
    if (!state.selectedId) return;
    try {
    const response = await fetch(
      `${import.meta.env.REACT_API_URL}subscription/${state.selectedId}`,
      {
        credentials: "include",
      },
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Impossible de charger cette demande.");
    dispatch({ type: "GET_INFO", payload: result.data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger cette demande.";
      dispatch({ type: "DETAIL_ERROR", payload: message });
      toast.error(message);
    }
  }, [state.selectedId]);

  const filteredSubscriptions = useMemo(() => state.subscription.filter((item) => {
    const boutique = item.owner_id?.boutiks_id?.name ?? "";
    const ref = item.refTransaction ?? "";
    const plan = item.plan ?? "";
    const searchValue = `${boutique} ${ref} ${plan}`.toLowerCase();
    return searchValue.includes(searchTerm.trim().toLowerCase()) && (statusFilter === "All" || item.payementStatus === statusFilter);
  }), [searchTerm, state.subscription, statusFilter]);

  const metrics = [
    {
      label: "À valider",
      value: statusCounts.Pending ?? 0,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      label: "Acceptées",
      value: statusCounts.Completed ?? 0,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Rejetées",
      value: statusCounts.Rejected ?? 0,
      tone: "text-rose-700 bg-rose-50",
    },
    {
      label: "Annulées",
      value: statusCounts.Canceled ?? 0,
      tone: "text-slate-700 bg-slate-100",
    },
  ];

  const updateData = useCallback(
    async (status: "Completed" | "Rejected" | "Canceled") => {
      let data;
      if (status === "Canceled" && user?.userGroupMember_id?.usergroup_id?.name === "Boutiks") {
        data = {
          payementStatus: "Canceled",
        };
      } else {
        if (status === "Completed") {
          data = {
            payementStatus: "Completed",
            startDate: Date.now(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          };
        } else if (status === "Rejected") {
          data = {
            payementStatus: "Rejected",
            motif: state.motif,
          };
        }
      }

        if (data && csrf && !state.saving && state.subscribeinfo?.payementStatus === "Pending") {
          dispatch({ type: "SAVING", payload: true });
          try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}subscribe/${state.selectedId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify(data),
          },
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result.message);
          dispatch({ type: "CLEAR_DETAILS" });
          fetchData();
        } else {
          const result = await response.json().catch(() => null);
          toast.error(
            result?.message || "Impossible de mettre à jour l'abonnement.",
          );
        }
          dispatch({ type: "HANDLE_MOTIF", payload: null });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Impossible de mettre à jour l’abonnement.");
          } finally {
            dispatch({ type: "SAVING", payload: false });
          }
      }
    },
    [csrf, fetchData, state.motif, state.saving, state.selectedId, state.subscribeinfo?.payementStatus, user],
  );

  const cancelRenewal = async () => {
    const id = state.subscribeinfo?._id;
    if (!id || !csrf || state.saving) return;
    dispatch({ type: "SAVING", payload: true });
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}subscription/${id}/cancel`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf }, body: JSON.stringify({}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Résiliation impossible.");
      toast.success(result.message); dispatch({ type: "CLEAR_DETAILS" }); void fetchData();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Résiliation impossible."); }
    finally { dispatch({ type: "SAVING", payload: false }); }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (state.selectedId) getData();
  }, [getData, state.selectedId]);

  return (
    <div className="flex flex-col gap-5">
      <header className="admin-toolbar">
        <div>
          <p className="admin-kicker">Paiements & abonnements</p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--admin-text)]">
            Abonnements marketplace
          </h1>
          {user?.userGroupMember_id?.usergroup_id?.name === "Boutiks" && <p className="mt-1 text-xs text-[var(--admin-muted)]">Les renouvellements et remboursements sont traités manuellement; aucun débit automatique n’est déclenché.</p>}
        </div>
        <div className="admin-toolbar-actions">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une boutique"
            className="admin-search-input"
          />
          <select
            aria-label="Filtrer par statut"
            className="admin-search-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">Tous les statuts</option>
            <option value="Pending">À valider</option>
            <option value="Completed">Acceptées</option>
            <option value="Rejected">Rejetées</option>
            <option value="Canceled">Annulées</option>
          </select>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="admin-metric-card">
            <span className={`admin-metric-icon ${metric.tone}`}>
              {metric.value ?? 0}
            </span>
            <span className="mt-4 text-2xl font-bold tabular-nums text-[var(--admin-text)]">
              {metric.value ?? 0}
            </span>
            <span className="mt-1 text-sm text-[var(--admin-muted)]">
              {metric.label}
            </span>
          </article>
        ))}
      </section>

      <div className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Demandes d’abonnement</h2>
            <p>Validation des plans, paiements et références de transaction.</p>
          </div>
        </div>

        {state.error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            {state.error}
            <button type="button" className="ml-3 font-semibold underline" onClick={() => void fetchData()}>Réessayer</button>
          </div>
        )}

        <div className="overflow-x-auto">
          {state.loading ? <div className="p-8 text-center text-[var(--admin-muted)]">Chargement des abonnements…</div> : filteredSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSubscriptions.map((item) => {
                const isSelected = state.selectedId === item._id;
                const shopName = item.owner_id?.boutiks_id?.name || item.owner_id?.username || "Boutique inconnue";
                return <article key={item._id} className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Boutique</p><h3 className="mt-1 truncate text-lg font-bold text-[var(--admin-text)]">{shopName}</h3><p className="mt-1 truncate text-xs text-[var(--admin-muted)]">{item.owner_id?.email ?? "Coordonnées indisponibles"}</p></div><span className={`admin-status-badge shrink-0 ${item.payementStatus === "Completed" ? "admin-status-success" : item.payementStatus === "Rejected" ? "admin-status-danger" : item.payementStatus === "Canceled" ? "admin-status-neutral" : "admin-status-info"}`}>{formatStatus(item.payementStatus)}</span></div>
                    <div className="grid grid-cols-2 gap-3 border-y border-[var(--admin-border)] py-3 text-sm"><div><span className="block text-xs text-[var(--admin-muted)]">Forfait</span><strong className="text-[var(--admin-text)]">{item.plan}</strong></div><div><span className="block text-xs text-[var(--admin-muted)]">Montant</span><strong className="text-[var(--admin-text)]">{item.priceMGA?.toLocaleString("fr-FR") ?? "—"} MGA</strong></div><div className="col-span-2 min-w-0"><span className="block text-xs text-[var(--admin-muted)]">Référence de paiement</span><strong className="block break-all font-mono text-xs text-[var(--admin-text)]">{item.refTransaction || "—"}</strong></div></div>
                    <button type="button" className="admin-button admin-button--secondary admin-button--sm w-full justify-center" aria-expanded={isSelected} onClick={() => { if (isSelected) dispatch({ type: "CLEAR_DETAILS" }); else dispatch({ type: "SELECT_ID", payload: item._id }); }}>{isSelected ? "Masquer les détails" : "Voir les détails et gérer"}</button>
                  </div>
                  {isSelected && <div className="space-y-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-5" aria-label={`Détails ${shopName}`}>
                    {state.detailLoading ? <p role="status" className="text-sm text-[var(--admin-muted)]">Chargement des détails…</p> : state.detailError ? <div className="text-sm text-rose-600">{state.detailError}<button type="button" className="ml-2 underline" onClick={() => void getData()}>Réessayer</button></div> : state.subscribeinfo && <>
                      <div className="space-y-2 text-sm text-[var(--admin-muted)]"><p><strong className="text-[var(--admin-text)]">Téléphone payeur :</strong> {state.subscribeinfo.transactionPhoneNumber || "—"}</p><p><strong className="text-[var(--admin-text)]">Moyen :</strong> {state.subscribeinfo.paymentMethodName ?? "—"}</p><p><strong className="text-[var(--admin-text)]">Compte destinataire :</strong> {state.subscribeinfo.paymentAccountName ?? "—"} · {state.subscribeinfo.paymentAccountNumber ?? state.subscribeinfo.selectedPhoneNumber ?? "—"}</p>{state.subscribeinfo.paymentInstructions && <p><strong className="text-[var(--admin-text)]">Instructions :</strong> {state.subscribeinfo.paymentInstructions}</p>}{state.subscribeinfo.lifecycleStatus && <p><strong className="text-[var(--admin-text)]">Cycle :</strong> {state.subscribeinfo.lifecycleStatus === "active" ? "Actif" : state.subscribeinfo.lifecycleStatus === "grace" ? `Période de grâce jusqu’au ${new Date(state.subscribeinfo.graceUntil ?? "").toLocaleDateString("fr-FR")}` : state.subscribeinfo.lifecycleStatus === "canceled" ? "Résiliation effectuée" : "Expiré"}</p>}{state.subscribeinfo.endDate && <p><strong className="text-[var(--admin-text)]">Fin de période :</strong> {new Date(state.subscribeinfo.endDate).toLocaleDateString("fr-FR")}{state.subscribeinfo.cancelAtPeriodEnd ? " · résiliation programmée" : ""}</p>}</div>
                      {state.subscribeinfo.payementStatus === "Pending" && user?.userGroupMember_id?.usergroup_id?.name !== "Boutiks" && <div className="space-y-3 border-t border-[var(--admin-border)] pt-4">{state.rejected && <div><label htmlFor={`reject-${item._id}`} className="mb-1 block text-xs font-semibold text-[var(--admin-muted)]">Motif du rejet</label><input id={`reject-${item._id}`} className="admin-field__control w-full" value={state.motif ?? ""} maxLength={500} onChange={(event) => dispatch({ type: "HANDLE_MOTIF", payload: event.target.value })} placeholder="Expliquez la raison du rejet" /></div>}<div className="flex flex-wrap gap-2">{state.rejected ? <><button className="admin-button-danger admin-button--sm" disabled={state.saving || !state.motif?.trim()} onClick={() => void updateData("Rejected")}>Confirmer le rejet</button><button className="admin-button admin-button--secondary admin-button--sm" onClick={() => dispatch({ type: "REJECTED", payload: false })}>Retour</button></> : <><button className="admin-button-primary admin-button--sm" disabled={state.saving} onClick={() => void updateData("Completed")}>Valider l’abonnement</button><button className="admin-button-danger admin-button--sm" disabled={state.saving} onClick={() => dispatch({ type: "REJECTED", payload: true })}>Rejeter</button></>}</div></div>}
                      {user?.userGroupMember_id?.usergroup_id?.name === "Boutiks" && state.subscribeinfo.payementStatus === "Pending" && <button className="admin-button-danger admin-button--sm" disabled={state.saving} onClick={() => void updateData("Canceled")}>Annuler la demande</button>}
                      {user?.userGroupMember_id?.usergroup_id?.name === "Boutiks" && state.subscribeinfo.payementStatus === "Completed" && !state.subscribeinfo.cancelAtPeriodEnd && <button className="admin-button-danger admin-button--sm" disabled={state.saving} onClick={() => void cancelRenewal()}>Résilier à la fin de la période</button>}
                    </>}
                  </div>}
                </article>;
              })}
            </div>
          ) : <p className="p-8 text-center text-sm text-[var(--admin-muted)]">Aucun abonnement ne correspond à ces filtres.</p>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t p-4 text-sm text-[var(--admin-muted)]"><span>{total} demande(s) · page {page} / {Math.max(1,pages)}</span><div className="flex gap-2"><button className="admin-button admin-button--secondary admin-button--sm" disabled={page<=1||state.loading} onClick={()=>setPage(page-1)}>Précédent</button><button className="admin-button admin-button--secondary admin-button--sm" disabled={page>=pages||state.loading} onClick={()=>setPage(page+1)}>Suivant</button></div></div>
      </div>

    </div>
  );
}

export default ListAbonnement;
