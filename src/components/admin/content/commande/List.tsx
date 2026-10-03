import { Link } from "react-router-dom";
import { IProduct } from "../product/Add";
import Iuser from "../../../../Interface/UserInterface";
import { useEffect, useReducer } from "react";
import { formatStatus } from "../../../../helper/locale";
import { DataTable, PageHeader, StatusBadge } from "../../ui";

interface ICommande {
  _id: string;
  product_id: IProduct;
  owner_id: Iuser;
  variants: { [key: string]: string };
  total: number;
  quantity: number;
  status: string;
}

type Action = { type: "FETCH_START"; payload: ICommande[] };

interface IState {
  commandes: ICommande[] | [];
}
const initialState: IState = {
  commandes: [],
};

const reducer = (state: IState, action: Action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, commandes: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

function List() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${import.meta.env.REACT_API_URL}command`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && response.status === 200) {
        const { data } = result;
        dispatch({ type: "FETCH_START", payload: data });
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      id: "index",
      header: "#",
      render: (_row: ICommande, index: number) => (
        <span className="font-medium">{index + 1}</span>
      ),
    },
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
    {
      id: "status",
      header: "Statut",
      render: (row: ICommande) => (
        <StatusBadge status={row.status} label={formatStatus(row.status)} />
      ),
      sortValue: (row: ICommande) => row.status,
    },
    {
      id: "action",
      header: "Action",
      render: (row: ICommande) => (
        <Link
          to={`/espace_vendeur/commande/${row._id}`}
          className="admin-button admin-button--outline admin-button--sm"
        >
          Détails
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Commandes"
        title="Listes des commandes"
        description="Suivez les commandes et ouvrez le détail de chaque transaction."
      />

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Commandes enregistrées</h2>
            <p>Historique et détails des achats liés à votre boutique.</p>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          {state.commandes.length > 0 ? (
            <DataTable
              columns={columns}
              rows={state.commandes.filter(Boolean)}
              getRowKey={(row) => row._id}
              pageSize={8}
              emptyTitle="Aucune commande"
              emptyDescription="Les commandes de votre boutique apparaîtront ici."
            />
          ) : (
            <div className="admin-empty-state">
              <h2>Aucune commande</h2>
              <p>Les commandes de votre boutique apparaîtront ici.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default List;
