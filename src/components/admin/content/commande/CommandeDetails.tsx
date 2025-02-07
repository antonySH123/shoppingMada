import { useCallback, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import IProduct from "../../../../Interface/IProduct";
import Iuser from "../../../../Interface/UserInterface";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";
import UserInfo from "../../../modals/UserInfo";

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
  | { type: "ACCEPTED"; payload: string }
  | { type: "HANDLE_MOTIF"; payload: string | null}
  | { type: "REJECTED"; payload: string; text:string }
  | { type: "TOGGLE_MODAL"; payload: boolean };

interface IState {
  commandes: ICommande | null;
  status: string | null;
  isOpen:boolean;
  motif:string | null
}
const initialState: IState = {
  commandes: null,
  status: null,
  isOpen:false,
  motif : null
};
const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        commandes: action.payload,
        status: action.payload.status,
      };
    case "ACCEPTED":
      return { ...state, status: action.payload };
    case "HANDLE_MOTIF":
      return { ...state, motif: action.payload };
    case "REJECTED":
      return { ...state, status: action.payload, motif:action.text, isOpen:false };
    case "TOGGLE_MODAL":
      return {...state,isOpen:action.payload}
    default:
      throw new Error("Action inconnue");
  }
};
function CommandeDetails() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { id } = useParams();
  const csrf = useCSRF();
  const close = ()=> dispatch({type:"TOGGLE_MODAL",payload:false})

  const handleClick = useCallback(async () => {
    console.log(state.status);
    if (csrf) {
      if (state.status != state.commandes?.status) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}command/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            body: JSON.stringify({ status: state.status, motif:state.motif }),
            credentials: "include",
          }
        );

        const result = await response.json();
        const { message, status } = result;
        if ((status as string).toLocaleLowerCase() === "success") {
          toast.success(message);
          
        } else {
          toast.error(message);
        }
        dispatch({type:"HANDLE_MOTIF",payload:null})
      }
    }
  }, [csrf, id, state.commandes?.status, state.motif, state.status]);
  useEffect(() => {
    const update = async () => {
      await handleClick();
    };
    update();
  }, [handleClick]);

  useEffect(() => {
    const getCommand = async () => {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}command/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok && response.status === 200) {
        const { data } = result;
        dispatch({ type: "FETCH_START", payload: data });
      }
    };
    getCommand();
  }, [id, state.commandes?.status, state.status]);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Détails de la commande
        </h2>
        <p className="text-gray-600">
          <strong>Client:</strong> {state.commandes?.owner_id.username}
        </p>
        <p className="text-gray-600">
          <strong>Date:</strong>{" "}
          {new Date(state.commandes?.createdAt as string).toLocaleString()}
        </p>
        <p className="text-gray-600">
          <strong>Total:</strong> {state.commandes?.total}
        </p>
        <p className="text-gray-600">
          <strong>Status:</strong> {state.commandes?.status}
        </p>
        <h3 className="text-xl font-semibold text-gray-700 mt-4">Articles</h3>
        <table className="w-full border-collapse text-sm lg:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 border">Produits</th>
              <th className="py-3 border">Prix</th>
              <th className="py-3 border">Quantité</th>
              <th className="py-3 border">Variant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-3 border text-center">
                {state.commandes?.product_id.name}
              </td>
              <td className="py-3 px-3 border text-center">
                {state.commandes?.product_id.price}
              </td>
              <td className="py-3 px-3 border text-center">
                {state.commandes?.quantity}
              </td>
              <td className="py-3 px-3 border text-center">
                <ul>
                  {state.commandes &&
                    Object.entries(state.commandes.variants).map(
                      ([key, value]) => (
                        <li key={key + 1}>
                          {key} : {value}
                        </li>
                      )
                    )}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end gap-3">
          {state.commandes && state.commandes.status === "Pending" && (
            <>
              <button
                className="border  px-3 text-sm py-2 bg-green-500 uppercase font-semibold text-white rounded"
                onClick={() =>
                  dispatch({ type: "ACCEPTED", payload: "Accepted" })
                }
              >
                Valider
              </button>
              <button
                onClick={() =>
                  dispatch({ type:"TOGGLE_MODAL", payload: true })
                }
                className="border  px-3 text-sm py-2 border-red-500  uppercase font-semibold text-red-500 hover:bg-red-500 hover:text-white transition-all ease-in-out rounded"
              >
                Rejeter
              </button>
            </>
          )}
        </div>
      </div>
      <UserInfo isOpen={state.isOpen} onClose={close}>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold">Confirmation</h1>
          <p>Vous êtes sûr de vouloir rejeter cette commande?</p>
          <input type="text" name="motif" placeholder="veuillez entrer le motif*" className="px-3 py-2 border w-full" onChange={(e)=> dispatch({type:"HANDLE_MOTIF",payload:e.target.value})}  />
          <div className="flex items-center gap-3 justify-end">
            <button className="px-3 py-2 rounded bg-green-500 text-white" onClick={()=>dispatch({type:"REJECTED",payload:"Rejected", text:state.motif as string})}>OUI</button>
            <button className="px-3 py-2 rounded bg-red-500 text-white">NON</button>
          </div>
        </div>
      </UserInfo>
    </div>
  );
}

export default CommandeDetails;
