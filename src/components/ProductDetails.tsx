import { LiaShoppingBagSolid } from "react-icons/lia";
import IProduct from "../Interface/IProduct";
import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import useFormatter from "../helper/useFormatter";
import parse from "html-react-parser";

interface IState {
  product: IProduct | null;
  loading: boolean;
  error: string | null;
}

const initialState: IState = {
  product: null,
  loading: false,
  error: null,
};
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: IProduct }
  | { type: "FETCH_ERROR"; payload: string };

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { product: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

function ProductDetails() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { id } = useParams();
  const {priceInArriary} = useFormatter()
  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}shop/product/${id}`
        );
        if (!response.ok) {
          dispatch({ type: "FETCH_ERROR", payload: "Une erreur est survenue" });
        }

        const data = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
      } catch (error) {
        if (error instanceof Error) {
          dispatch({ type: "FETCH_ERROR", payload: error.message });
        } else {
          dispatch({ type: "FETCH_ERROR", payload: "Une erreur est survenue" });
        }
      }
    };
    fetchProduct();
  }, [id]);
  return (
    <div className="px-10 py-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5">
      <div className="py-10">
        <img
          src={`${import.meta.env.REACT_API_URL}uploads/${
            state.product && state.product.photos && state.product.photos[0]
          }`}
          alt=""
          className="w-full mt-10 rounded-md"
        />
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4">
          {state.product &&
            state.product.photos &&
            state.product.photos.map((photo, index) => {
              if (index != 0) {
                return (
                  <img
                    src={`${import.meta.env.REACT_API_URL}uploads/${
                      photo
                    }`}
                    alt=""
                    className="w-full mt-10 rounded-md"
                  />
                );
              }
            })}
        </div>
      </div>
      <div className="py-10">
        <div className="py-10 flex flex-col gap-5">
          <h1 className="text-3xl">Informations sur le produit</h1>
          <p>
            <strong>
              {state.product &&
                state.product.name &&
                state.product.name.toUpperCase()}
            </strong>
          </p>
          <p>
            {state.product &&
              state.product.price &&
              priceInArriary(state.product.price)}
          </p>
          <p>
            {state.product && state.product.details && parse(state.product.details)}
          </p>
          <p>
            <strong>Variant</strong>
          </p>
          <p>
            <strong>Quantité</strong>
          </p>
          <p>
            <input type="number" name="" id="" value={1} />
          </p>
          <div className="w-1/4">
            <a
              href=""
              className="rounded-md  border border-green-500 px-5 py-3 flex gap-3 hover:bg-green-500 hover:text-white"
            >
              <LiaShoppingBagSolid size={30} />
              commander
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
