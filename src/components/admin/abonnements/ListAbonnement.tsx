import Isubscription from "../../../Interface/subscription.interface";
import IAction from "../../../Interface/action.interface";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import { LiaEye } from "react-icons/lia";
import UserInfo from "../../modals/UserInfo";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { formatStatus } from "../../../helper/locale";

interface IState {
  subscription: Isubscription[] | [];
  isOpen: boolean;
  selectedId: string | null;
  subscribeinfo: Isubscription | null;
  rejected: boolean;
  motif: string | null;
}

const initialState: IState = {
  subscription: [],
  isOpen: false,
  selectedId: null,
  subscribeinfo: null,
  rejected: false,
  motif: null,
};

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        subscription: action.payload as Isubscription[],
        selectedId: null,
      };
    case "SELECT_ID":
      return { ...state, selectedId: action.payload as string };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload as boolean, rejected: false };
    case "GET_INFO":
      return { ...state, subscribeinfo: action.payload as Isubscription };
    case "REJECTED":
      return { ...state, rejected: action.payload as boolean };
    case "HANDLE_MOTIF":
      return { ...state, motif: action.payload as string | null };
    default:
      throw new Error("Action inconnue!");
  }
};

function ListAbonnement() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const csrf = useCSRF();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscription`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const result = await response.json();
        dispatch({ type: "FETCH_START", payload: result.data ?? [] });
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }, []);

  const getData = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.REACT_API_URL}subscription/${state.selectedId}`,
      {
        credentials: "include",
      },
    );

    if (response.ok) {
      const result = await response.json();
      dispatch({ type: "GET_INFO", payload: result.data });
    }
  }, [state.selectedId]);

  const filteredSubscriptions = state.subscription.filter((item) => {
    const boutique = item.owner_id?.boutiks_id?.name ?? "";
    const ref = item.refTransaction ?? "";
    const plan = item.plan ?? "";
    const searchValue = `${boutique} ${ref} ${plan}`.toLowerCase();
    return searchValue.includes(searchTerm.trim().toLowerCase());
  });

  const metrics = [
    {
      label: "À valider",
      value: state.subscription.filter(
        (item) => item.payementStatus === "Pending",
      ).length,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      label: "Acceptées",
      value: state.subscription.filter(
        (item) => item.payementStatus === "Completed",
      ).length,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Rejetées",
      value: state.subscription.filter(
        (item) => item.payementStatus === "Rejected",
      ).length,
      tone: "text-rose-700 bg-rose-50",
    },
    {
      label: "Annulées",
      value: state.subscription.filter(
        (item) => item.payementStatus === "Canceled",
      ).length,
      tone: "text-slate-700 bg-slate-100",
    },
  ];

  const updateData = useCallback(
    async (status: string) => {
      let data;
      if (user && user.userGroupMember_id.usergroup_id.name === "Boutiks") {
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

      if (data && csrf) {
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
          dispatch({ type: "TOGGLE_MODAL", payload: false });
          fetchData();
        } else {
          const result = await response.json().catch(() => null);
          toast.error(
            result?.message || "Impossible de mettre à jour l'abonnement.",
          );
        }
        dispatch({ type: "HANDLE_MOTIF", payload: null });
      }
    },
    [csrf, fetchData, state.motif, state.selectedId, user],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        </div>
        <div className="admin-toolbar-actions">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une boutique"
            className="admin-search-input"
          />
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

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Boutique</th>
                <th>Plan</th>
                <th>Référence</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="font-semibold text-[var(--admin-text)]">
                      {item.owner_id?.boutiks_id?.name || "Boutique inconnue"}
                    </td>
                    <td>{item.plan}</td>
                    <td className="font-mono text-xs">{item.refTransaction}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${item.payementStatus === "Completed" ? "admin-status-success" : item.payementStatus === "Rejected" ? "admin-status-danger" : item.payementStatus === "Canceled" ? "admin-status-neutral" : "admin-status-info"}`}
                      >
                        {formatStatus(item.payementStatus)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-link-button"
                        onClick={() => {
                          dispatch({ type: "SELECT_ID", payload: item._id });
                          dispatch({ type: "TOGGLE_MODAL", payload: true });
                        }}
                      >
                        <LiaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="admin-empty-state">
                    Aucune demande d’abonnement ne correspond à la recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserInfo
        isOpen={state.isOpen}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", payload: false })}
      >
        <h1 className="text-xl font-bold mb-4">Détails de l’abonnement</h1>
        <hr />
        <div className="px-2 py-3 rounded w-full border border-emerald-200 bg-emerald-50/70">
          {!state.rejected ? (
            <>
              <h2 className="mb-3 text-lg font-bold text-[var(--admin-text)]">
                {state.subscribeinfo?.owner_id?.boutiks_id?.name || "Boutique"}
              </h2>
              <div className="flex flex-col gap-2 text-sm text-[var(--admin-muted)]">
                <strong>Plan : {state.subscribeinfo?.plan}</strong>
                <strong>
                  Statut : {formatStatus(state.subscribeinfo?.payementStatus)}
                </strong>
                <strong>
                  Référence : {state.subscribeinfo?.refTransaction}
                </strong>
                <strong>
                  Téléphone : {state.subscribeinfo?.transactionPhoneNumber}
                </strong>
                <strong>
                  Moyen : {state.subscribeinfo?.paymentMethodName ?? "—"}
                </strong>
                <strong>
                  Compte destinataire :{" "}
                  {state.subscribeinfo?.paymentAccountName ?? "—"} ·{" "}
                  {state.subscribeinfo?.paymentAccountNumber ??
                    state.subscribeinfo?.selectedPhoneNumber ??
                    "—"}
                </strong>
                <strong>
                  Montant attendu :{" "}
                  {state.subscribeinfo?.priceMGA?.toLocaleString("fr-FR") ??
                    "—"}{" "}
                  MGA
                </strong>
                {state.subscribeinfo?.paymentInstructions && (
                  <span>
                    Instructions : {state.subscribeinfo.paymentInstructions}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--admin-text)]">
                Confirmez-vous le rejet de cette demande ?
              </h2>
              <input
                type="text"
                name="motif"
                className="admin-field__control w-full"
                placeholder="Motif du rejet"
                value={state.motif ?? ""}
                onChange={(e) =>
                  dispatch({ type: "HANDLE_MOTIF", payload: e.target.value })
                }
              />
            </div>
          )}
        </div>
        <hr />
        <div className="flex gap-3 py-3 justify-end">
          {user && user.userGroupMember_id.usergroup_id.name != "Boutiks" && (
            <>
              {!state.rejected ? (
                <>
                  <button
                    className="admin-button-primary"
                    onClick={() => updateData("Completed")}
                  >
                    Accepter
                  </button>
                  <button
                    className="admin-button-danger"
                    onClick={() =>
                      dispatch({ type: "REJECTED", payload: true })
                    }
                  >
                    Rejeter
                  </button>
                </>
              ) : (
                <button
                  className="admin-button-primary"
                  onClick={() => updateData("Rejected")}
                >
                  Envoyer
                </button>
              )}
            </>
          )}

          {user &&
            user.userGroupMember_id.usergroup_id.name === "Boutiks" &&
            state.subscribeinfo?.payementStatus === "Pending" && (
              <button
                className="admin-button-danger"
                onClick={() => updateData("Canceled")}
              >
                Annuler
              </button>
            )}
        </div>
      </UserInfo>
    </div>
  );
}

export default ListAbonnement;
