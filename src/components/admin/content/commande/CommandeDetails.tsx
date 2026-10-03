import { useCallback, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import IProduct from "../../../../Interface/IProduct";
import Iuser from "../../../../Interface/UserInterface";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";
import UserInfo from "../../../modals/UserInfo";
import Preloader from "../../../loading/Preloader";
import { formatFrenchDateTime, formatStatus } from "../../../../helper/locale";
import { DataTable, PageHeader, StatusBadge } from "../../ui";

interface ICommande {
  _id: string;
  product_id: IProduct;
  owner_id: Iuser;
  variants: { [key: string]: string };
  total: number;
  quantity: number;
  status: string;
  createdAt: string;
}

type Action =
  | { type: "FETCH_START"; payload: ICommande }
  | { type: "HANDLE_MOTIF"; payload: string | null }
  | { type: "TOGGLE_MODAL"; payload: boolean };

interface IState {
  commandes: ICommande | null;
  status: string | null;
  isOpen: boolean;
  motif: string | null;
}

const initialState: IState = {
  commandes: null,
  status: null,
  isOpen: false,
  motif: null,
};

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        commandes: action.payload,
        status: action.payload.status,
      };
    case "HANDLE_MOTIF":
      return { ...state, motif: action.payload };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

function CommandeDetails() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { id } = useParams();
  const csrf = useCSRF();
  const close = () => dispatch({ type: "TOGGLE_MODAL", payload: false });

  const handleStatusChange = useCallback(
    async (status: string, motif?: string | null) => {
      if (!csrf || !id) return;
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}command/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          body: JSON.stringify({ status, motif }),
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(
          result.message || "Impossible de mettre à jour la commande.",
        );
        return;
      }
      toast.success(result.message);
      dispatch({ type: "HANDLE_MOTIF", payload: null });
      dispatch({ type: "TOGGLE_MODAL", payload: false });
      dispatch({ type: "FETCH_START", payload: result.data });
    },
    [csrf, id],
  );

  useEffect(() => {
    const getCommand = async () => {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}command/${id}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const result = await response.json();
      if (response.ok && response.status === 200) {
        const { data } = result;
        dispatch({ type: "FETCH_START", payload: data });
      }
    };

    getCommand();
  }, [id]);

  const columns = [
    {
      id: "product",
      header: "Produit",
      render: (row: ICommande) => row.product_id?.name ?? "—",
      sortValue: (row: ICommande) => row.product_id?.name ?? "",
    },
    {
      id: "price",
      header: "Prix",
      render: (row: ICommande) => row.product_id?.price ?? 0,
      sortValue: (row: ICommande) => Number(row.product_id?.price ?? 0),
    },
    {
      id: "quantity",
      header: "Quantité",
      render: (row: ICommande) => row.quantity,
      sortValue: (row: ICommande) => row.quantity,
    },
    {
      id: "variants",
      header: "Variantes",
      render: (row: ICommande) => (
        <ul className="space-y-1">
          {Object.entries(row.variants ?? {}).map(([key, value]) => (
            <li key={key} className="text-xs text-[var(--admin-muted)]">
              {key} : {value}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Commandes"
        title="Détails de la commande"
        description="Suivez le client, la date, le montant et l’état de la commande."
      />

      <section className="admin-panel p-5">
        <div className="grid gap-4 border-b border-[var(--admin-border)] pb-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="admin-field">
            <label>Client</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.commandes?.owner_id.username ?? ""}
              readOnly
            />
          </div>
          <div className="admin-field">
            <label>Date</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={formatFrenchDateTime(state.commandes?.createdAt) ?? ""}
              readOnly
            />
          </div>
          <div className="admin-field">
            <label>Total</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.commandes?.total ?? ""}
              readOnly
            />
          </div>
          <div className="admin-field">
            <label>Statut</label>
            <div className="pt-1">
              <StatusBadge
                status={state.commandes?.status ?? ""}
                label={formatStatus(state.commandes?.status)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <DataTable
            columns={columns}
            rows={state.commandes ? [state.commandes] : []}
            getRowKey={(row) => row._id}
            pageSize={10}
            emptyTitle="Commande introuvable"
            emptyDescription="Cette commande n’existe plus ou est inaccessible."
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          {state.commandes && state.commandes.status === "Pending" && (
            <>
              <button
                type="button"
                className="admin-button admin-button--primary admin-button--md"
                onClick={() => handleStatusChange("Accepted")}
              >
                Valider
              </button>
              <button
                type="button"
                className="admin-button admin-button--danger admin-button--md"
                onClick={() =>
                  dispatch({ type: "TOGGLE_MODAL", payload: true })
                }
              >
                Rejeter
              </button>
            </>
          )}
        </div>
      </section>

      <UserInfo isOpen={state.isOpen} onClose={close}>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-[var(--admin-text)]">
            Confirmation
          </h1>
          <p className="text-[var(--admin-muted)]">
            Vous êtes sûr de vouloir rejeter cette commande ?
          </p>
          <input
            type="text"
            name="motif"
            placeholder="Veuillez entrer le motif*"
            className="admin-field__control w-full"
            onChange={(e) =>
              dispatch({ type: "HANDLE_MOTIF", payload: e.target.value })
            }
          />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="admin-button admin-button--primary admin-button--sm"
              onClick={() => handleStatusChange("Rejected", state.motif)}
            >
              OUI
            </button>
            <button
              type="button"
              className="admin-button admin-button--secondary admin-button--sm"
              onClick={close}
            >
              NON
            </button>
          </div>
        </div>
      </UserInfo>
    </div>
  );
}

export default CommandeDetails;
