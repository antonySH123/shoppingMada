import IProduct from "../Interface/IProduct";
import { FormEvent, useEffect, useReducer } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useFormatter from "../helper/useFormatter";
import parse from "html-react-parser";
import {
  LiaBuildingSolid,
  LiaMapMarkedSolid,
  LiaPhoneSolid,
} from "react-icons/lia";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import Comment from "./comment/Comment";

interface IState {
  product: IProduct | null;
  loading: boolean;
  error: string | null;
  counter: number;
  selectedVariant?: { [key: string]: string };
  totalPrice: number;
}

const initialState: IState = {
  product: null,
  loading: false,
  error: null,
  counter: 1,
  selectedVariant: {},
  totalPrice: 0,
};
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: IProduct }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "INCREMENT"; payload: number | undefined }
  | { type: "DECREMENT"; payload: number | undefined }
  | {
      type: "SELECT_VARIANT";
      payload: { name: string; value: string };
    }
  | {
      type: "INITIAL_VARIANT";
      payload: { [key:string]:string };
    };

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        product: action.payload,
        loading: false,
        error: null,
        totalPrice: state.product?.price as number,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "INCREMENT":
      return {
        ...state,
        counter: state.counter + 1,
        totalPrice: state.totalPrice + state.totalPrice / state.counter,
      };
    case "DECREMENT":
      return {
        ...state,
        counter: Math.max(1, state.counter - 1),
        totalPrice: state.totalPrice - state.totalPrice / state.counter,
      };
    case "SELECT_VARIANT": {
      const updatedVariants = {
        ...state.selectedVariant,
        [action.payload.name]: action.payload.value,
      };
      const totalVariantPrice = Object.keys(updatedVariants).reduce(
        (sum, key) => {
          const variantGroup = state.product?.variant.find(
            (v) => v.name === key
          );
          const selectedValue = variantGroup?.values.find(
            (v) => v.value === updatedVariants[key]
          );
          return sum + (selectedValue?.additionalPrice || 0);
        },
        0
      );
      return {
        ...state,
        selectedVariant: updatedVariants,
        totalPrice: (state.product?.price || 0) + totalVariantPrice,
      };
    }
    case "INITIAL_VARIANT":
      return {...state, selectedVariant:action.payload}
    default:
      throw new Error("Action inconnue");
  }
};

function ProductDetails() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { id } = useParams();
  const { priceInArriary } = useFormatter();
  const csrf = useCSRF();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "FETCH_START" });
    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}command`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            body: JSON.stringify({
              quantity: state.counter || 1,
              product_id: id,
              variants: state.selectedVariant,
              total: state.totalPrice,
            }),
          }
        );

        const result = await response.json();
        if (response.status == 401) {
          toast.error("Vous devez vous connecté tout d'abord");
          navigate("/login", { state: { from: location.pathname } });
        } else {
          toast.success(result.message);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatch({ type: "FETCH_ERROR", payload: error.message });
      }
    }
  };

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

        const initialSelectedVariant : {[key:string]:string} = {};
        if(data.data.variant){
          data.data.variant.forEach((variant:{name:string, values:[{value:string}]})=>{
            if(variant.values.length > 0){
              initialSelectedVariant[variant.name]=variant.values[0].value
            }
          })
        }
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
        dispatch({type:"INITIAL_VARIANT",payload:initialSelectedVariant})
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
    <>
      <div className="px-10 py-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-5 gap-5">
        <div className="py-10 col-span-2">
          <img
            src={`${import.meta.env.REACT_API_URL}uploads/${
              state.product && state.product.photos && state.product.photos[0]
            }`}
            alt=""
            className="w-full mt-10 rounded-md"
          />
          <div className="grid grid-cols-4 gap-3">
            {state.product &&
              state.product.photos &&
              state.product.photos.map((photo, index) => {
                if (index != 0) {
                  return (
                    <div
                      className="w-full mt-10 rounded-md h-32"
                      key={index + 1}
                    >
                      <img
                        src={`${import.meta.env.REACT_API_URL}uploads/${photo}`}
                        alt=""
                        className="w-full h-full object-contain"
                        key={index + 1}
                      />
                    </div>
                  );
                }
              })}
          </div>
        </div>
        <div className="py-10 col-span-2">
          <div className="py-10 flex flex-col gap-5">
            <h1 className="text-3xl">Informations sur le produit</h1>
            <div className="bg-lime-100 flex justify-between p-5">
              <p>
                <strong>
                  {state.product &&
                    state.product.name &&
                    state.product.name.toUpperCase()}
                </strong>
              </p>
              <p>
                <strong>
                  {state.product &&
                    state.product.price &&
                    priceInArriary(state.product.price)}
                </strong>
              </p>
            </div>
            <p className="capitalize">
              {state.product &&
                state.product.description &&
                parse(state.product.description)}
            </p>
            <hr />
            <div className="text-sm text-justify">
              {state.product &&
                state.product.details &&
                parse(state.product.details)}
            </div>
            <hr />
            <div>
              <p>
                <strong>Variant</strong>
              </p>
              <div>
                {state.product &&
                  state.product.variant &&
                  state.product.variant.map((variant) => (
                    <div key={variant._id}>
                      <p className="font-bold">{variant.name}</p>
                      <div className="flex gap-2">
                        {variant.values.map((v, idx) => (
                          <button
                            key={idx + 1}
                            className={`px-4 py-2 rounded ${
                              state.selectedVariant &&
                              state.selectedVariant[variant.name] === v.value
                                ? "bg-green-500 text-white"
                                : "bg-gray-100"
                            }`}
                            onClick={() => {
                              dispatch({
                                type: "SELECT_VARIANT",
                                payload: {
                                  name: variant.name,
                                  value: v.value
                                },
                              });

                              console.log(state.totalPrice);
                              console.log(state.counter);
                            }}
                          >
                            {v.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <form
          method="post"
          action=""
          className="py-20  "
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col col-span-1 gap-10 border border-gray-50  shadow h-auto py-5">
            <div className="px-5">
              <h4 className="mb-2">
                <strong>Vendu par</strong>
              </h4>
              <ul>
                <li className="text-sm mb-1 flex items-center gap-2">
                  {" "}
                  <LiaBuildingSolid size={15} />{" "}
                  {state.product && state.product.boutiks_id.name}
                </li>
                <li className="text-sm mb-1 flex items-center gap-2">
                  {" "}
                  <LiaPhoneSolid size={15} />{" "}
                  {state.product && state.product.boutiks_id.phoneNumber}
                </li>
                <li className="text-sm mb-1 flex items-center gap-2">
                  {" "}
                  <LiaMapMarkedSolid size={15} />{" "}
                  {state.product && state.product.boutiks_id.adresse}
                </li>
              </ul>
            </div>
            <div className="px-5">
              <p className="mb-2">
                <strong>Quantités</strong>
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="px-3 py-2 bg-gray-100 text-lg font-bold"
                  type="button"
                  onClick={() =>
                    dispatch({ type: "DECREMENT", payload: undefined })
                  }
                >
                  -
                </button>
                <input
                  type="text"
                  name="quantity"
                  className="py-2 px-3 border border-gray-200 w-full"
                  defaultValue={1}
                  value={state.counter}
                  readOnly
                />
                <button
                  className="px-3 py-2 bg-gray-100 text-lg font-bold"
                  type="button"
                  onClick={() =>
                    dispatch({ type: "INCREMENT", payload: undefined })
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div className="px-5">
              <strong>Total d'achat: {priceInArriary(state.totalPrice)}</strong>
            </div>
            <div className="w-full px-5">
              <button
                type="submit"
                className="border border-green-500 bg-green-500 px-5 py-3 gap-3 text-white  rounded uppercase flex justify-center font-bold w-full"
              >
                commander
              </button>
            </div>
          </div>
        </form>
      </div>

      <Comment product_id={id as string} csrf={csrf as string} />
    </>
  );
}

export default ProductDetails;
