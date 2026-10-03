import ICommande from "../../Interface/command.interfaces";
import IAction from "../../Interface/action.interface";
import React, { useCallback, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../helper/useAuth";
import { formatStatus } from "../../helper/locale";

interface IState {
  commandes: ICommande[] | [];
  status: string;
}

const initialState: IState = {
  commandes: [],
  status: "",
};

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, commandes: action.payload as ICommande[] };
    default:
      throw new Error("Invalid action");
  }
};

function Commande({ csrf }: { csrf: string }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const fetchCommand = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}command`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.status === 200)
        dispatch({ type: "FETCH_START", payload: result.data });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);
  const handleClick = useCallback(
    async (id: string) => {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}command/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            body: JSON.stringify({ status: "Canceled" }),
            credentials: "include",
          },
        );

        const result = await response.json();
        const { message, status } = result;
        if (
          response.ok &&
          (status as string).toLocaleLowerCase() === "success"
        ) {
          toast.success(message);
          fetchCommand();
        } else {
          toast.error(message);
        }
      }
    },
    [csrf, fetchCommand],
  );

  useEffect(() => {
    fetchCommand();
  }, [fetchCommand]);
  return (
    <section className="profile-orders">
      <header className="profile-orders-heading">
        <p className="profile-orders-eyebrow">Historique</p>
        <h2>
          {user?.userGroupMember_id.usergroup_id.name === "Client"
            ? "Listes de vos achats"
            : "Liste de vos commandes en attentes"}
        </h2>
      </header>
      <div className="profile-orders-table-wrap">
        <table>
          <thead>
            <tr>
              <th className="py-3 px-3 border">#</th>
              <th className="py-3 border">Produits</th>
              <th className="py-3 border">Prix</th>
              <th className="py-3 border">Quantité</th>
              <th className="py-3 border">Variantes</th>
              <th className="py-3 border">Statut</th>
              <th className="py-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {state.commandes.length > 0 &&
              state.commandes.map((element, index) => (
                <React.Fragment key={element._id + (index + 1)}>
                  {element.product_id && (
                    <tr className="hover:bg-gray-50" key={index + 1}>
                      <td className="py-3 px-3 border text-center">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 border text-center">
                        {element.product_id && element.product_id.name}
                      </td>
                      <td className="py-3 px-3 border text-center">
                        {element.product_id && element.product_id.price}
                      </td>
                      <td className="py-3 px-3 border text-center">
                        {element.quantity}
                      </td>
                      <td className="py-3 px-3 border text-center">
                        <ul>
                          {Object.entries(element.variants).map(
                            ([key, value]) => (
                              <li key={key + 1}>
                                {key} : {value}
                              </li>
                            ),
                          )}
                        </ul>
                      </td>
                      <td className="py-3 px-3 border text-center">
                        <span className="profile-order-status">
                          {formatStatus(element.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 border text-center">
                        {element.status === "Pending" ? (
                          <>
                            {" "}
                            <button
                              className="profile-order-cancel"
                              onClick={() => handleClick(element._id)}
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          "none"
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Commande;
