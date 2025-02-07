import { Link } from "react-router-dom";
import { IProduct } from "../product/Add";
import Iuser from "../../../../Interface/UserInterface";
import { useEffect, useReducer } from "react";

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

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-5 p-4">
      {/* Liste des commandes */}
      <div className="w-full lg:w-2/3 flex-grow">
        <h1 className="text-center text-3xl font-bold mb-6">
          Listes des commandes
        </h1>
        <div className="shadow-md border rounded-lg overflow-auto">
          <table className="w-full border-collapse text-sm lg:text-base">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-3 border">#</th>
                <th className="py-3 border">Produits</th>
                <th className="py-3 border">Prix</th>
                <th className="py-3 border">Quantité</th>
                <th className="py-3 border">Variant</th>
                <th className="py-3 border">Status</th>
                <th className="py-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {state.commandes.length > 0 &&
                state.commandes.map((element, index) => (
                  <>
                    {element.product_id && (
                      <tr className="hover:bg-gray-50" key={element._id + 1}>
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
                              )
                            )}
                          </ul>
                        </td>
                        <td className="py-3 px-3 border text-center text-yellow-500">
                          {element.status}
                        </td>
                        <td className="py-3 px-3 border text-center">
                          <Link
                            title="Valider"
                            className="w-10 h-10 flex items-center justify-center text-green-500"
                            to={`/espace_vendeur/commande/${element._id}`}
                          >
                            Détails
                          </Link>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  );
}

export default List;
