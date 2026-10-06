import IProduct from "../Interface/IProduct";
import { FormEvent, useEffect, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import useFormatter from "../helper/useFormatter";
import parse from "html-react-parser";
import {
  LiaAtSolid,
  LiaBuildingSolid,
  LiaMapMarkedSolid,
  LiaPhoneSolid,
} from "react-icons/lia";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import Comment from "./comment/Comment";
import Preloader from "./loading/Preloader";
import { useCart } from "../context/useCart";
import { useLanguage } from "../context/useLanguage";

interface IState {
  product: ProductDetailsData | null;
  loading: boolean;
  error: string | null;
  counter: number;
  selectedVariant?: { [key: string]: string };
  totalPrice: number;
}

interface ProductVariantValue {
  value: string;
  additionalPrice?: number;
  stock?: number;
}

interface ProductVariant {
  _id: string;
  name: string;
  values: ProductVariantValue[];
}

interface ProductDetailsData extends Omit<IProduct, "variant"> {
  variant: ProductVariant[];
}

const initialState: IState = {
  product: null,
  loading: false,
  error: null,
  counter: 1,
  selectedVariant: {},
  totalPrice: 0,
};

const isSafeHttpUrl = (value?: string): value is string => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getAvailableStock = (
  product: ProductDetailsData,
  selectedVariant: Record<string, string> = {},
) => {
  const variantStocks = Object.entries(selectedVariant).map(([name, value]) =>
    product.variant
      .find((variant) => variant.name === name)
      ?.values.find((option) => option.value === value)?.stock,
  );
  const knownVariantStocks = variantStocks.filter(
    (stock): stock is number => typeof stock === "number",
  );
  if (knownVariantStocks.length) {
    const productStock = product.stock;
    return typeof productStock === "number"
      ? Math.min(productStock, ...knownVariantStocks)
      : Math.min(...knownVariantStocks);
  }
  return product.stock ?? Number.POSITIVE_INFINITY;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: ProductDetailsData }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "INCREMENT"; payload: number | undefined }
  | { type: "DECREMENT"; payload: number | undefined }
  | {
      type: "SELECT_VARIANT";
      payload: { name: string; value: string };
    }
  | {
      type: "INITIAL_VARIANT";
      payload: { [key: string]: string };
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
        totalPrice: action.payload.price * state.counter,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "INCREMENT":
      if (
        state.product &&
        state.counter >=
          getAvailableStock(state.product, state.selectedVariant)
      )
        return state;
      return {
        ...state,
        counter: state.counter + 1,
        totalPrice: state.totalPrice + state.totalPrice / state.counter,
      };
    case "DECREMENT":
      if (state.counter <= 1) return state;
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
            (v) => v.name === key,
          );
          const selectedValue = variantGroup?.values.find(
            (v) => v.value === updatedVariants[key],
          );
          return sum + (selectedValue?.additionalPrice || 0);
        },
        0,
      );
      return {
        ...state,
        selectedVariant: updatedVariants,
        totalPrice:
          ((state.product?.price || 0) + totalVariantPrice) * state.counter,
      };
    }
    case "INITIAL_VARIANT": {
      const totalVariantPrice = Object.entries(action.payload).reduce(
        (sum, [name, selected]) => {
          const variant = state.product?.variant.find(
            (item) => item.name === name,
          );
          return (
            sum +
            Number(
              variant?.values.find((value) => value.value === selected)
                ?.additionalPrice ?? 0,
            )
          );
        },
        0,
      );
      return {
        ...state,
        selectedVariant: action.payload,
        totalPrice:
          ((state.product?.price ?? 0) + totalVariantPrice) * state.counter,
      };
    }
    default:
      throw new Error("Action inconnue");
  }
};

function ProductDetails() {
  const { t } = useLanguage();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activePhoto, setActivePhoto] = useState(0);
  const { id } = useParams();
  const { priceInArriary } = useFormatter();
  const csrf = useCSRF();
  const { addItem } = useCart();
  const shop = state.product?.boutiks_id;
  const shopLinks = [
    { label: "Site web", href: shop?.websiteUrl },
    { label: "Facebook", href: shop?.facebookUrl },
    { label: "Instagram", href: shop?.instagramUrl },
    { label: "TikTok", href: shop?.tiktokUrl },
    { label: "YouTube", href: shop?.youtubeUrl },
  ].filter((link) => isSafeHttpUrl(link.href));
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.product || !id || !state.product.boutiks_id?._id) return;
    const unitPrice =
      state.product.price +
      Object.entries(state.selectedVariant ?? {}).reduce(
        (total, [name, selected]) => {
          const variant = state.product?.variant.find(
            (item) => item.name === name,
          );
          const option = variant?.values.find(
            (value) => value.value === selected,
          );
          return total + Number(option?.additionalPrice ?? 0);
        },
        0,
      );
    const added = addItem({
      productId: id,
      name: state.product.name,
      unitPrice,
      quantity: state.counter,
      image: state.product.photos?.[0],
      shopId: state.product.boutiks_id._id,
      shopName: state.product.boutiks_id.name,
      variants: state.selectedVariant ?? {},
      stock: getAvailableStock(state.product, state.selectedVariant),
    });
    if (added) {
      toast.success("Article ajouté au panier.");
    } else {
      toast.error("La quantité dépasse le stock disponible.");
    }
  };

  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}shop/product/${id}`,
        );
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          dispatch({
            type: "FETCH_ERROR",
            payload: payload?.message || "Produit introuvable.",
          });
          return;
        }
        const data = await response.json();
        if (!data?.data) {
          dispatch({ type: "FETCH_ERROR", payload: "Produit introuvable." });
          return;
        }

        const initialSelectedVariant: { [key: string]: string } = {};
        if (data.data.variant) {
          data.data.variant.forEach(
            (variant: { name: string; values: [{ value: string }] }) => {
              if (variant.values.length > 0) {
                initialSelectedVariant[variant.name] = variant.values[0].value;
              }
            },
          );
        }
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
        dispatch({ type: "INITIAL_VARIANT", payload: initialSelectedVariant });
      } catch (error) {
        if (error instanceof Error) {
          dispatch({ type: "FETCH_ERROR", payload: error.message });
        } else {
          dispatch({ type: "FETCH_ERROR", payload: "Une erreur est survenue" });
        }
      }
    };
    void fetchProduct();
  }, [id]);
  if (state.loading) return <Preloader />;
  if (state.error || !state.product)
    return (
      <main className="market-container py-16 text-center" role="alert">
        <h1 className="text-2xl font-bold text-gray-900">{t("product.unavailable")}</h1>
        <p className="mt-2 text-gray-600">{state.error || t("product.notFound")}</p>
      </main>
    );
  return !csrf ? (
    <Preloader />
  ) : (
    <>
      <div className="product-detail-layout market-container grid grid-cols-1 gap-5 py-7 sm:gap-7 md:py-10">
        <article className="product-main-card market-card min-w-0">
          <div className="product-gallery">
            <div className="product-gallery-stage">
              {state.product?.photos?.length ? (
                <img
                  src={`${import.meta.env.REACT_API_URL}uploads/${state.product.photos[activePhoto] || state.product.photos[0]}`}
                  alt={state.product.name}
                  className="product-gallery-active"
                />
              ) : (
                <div className="product-gallery-empty">Image indisponible</div>
              )}
            </div>
            {(state.product?.photos?.length || 0) > 1 && (
              <div
                className="product-gallery-thumbnails"
                aria-label="Galerie photos du produit"
              >
                {state.product?.photos?.map((photo, index) => (
                  <button
                    type="button"
                    key={`${photo}-${index}`}
                    className={`product-gallery-thumbnail ${activePhoto === index ? "is-active" : ""}`}
                    onClick={() => setActivePhoto(index)}
                    aria-label={`Afficher la photo ${index + 1}`}
                    aria-pressed={activePhoto === index}
                  >
                    <img
                      src={`${import.meta.env.REACT_API_URL}uploads/${photo}`}
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="product-details-copy flex min-w-0 flex-col gap-5 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Détails du produit
            </p>
            <div className="product-price-row flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
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
            <p className="capitalize leading-7 text-gray-600">
              {state.product &&
                state.product.description &&
                parse(state.product.description)}
            </p>
            <div className="product-description text-sm leading-7 text-gray-600">
              {state.product &&
                state.product.details &&
                parse(state.product.details)}
            </div>
            {(state.product?.variant?.some(
              (variant) => variant.values.length > 0,
            ) ??
              false) && (
              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-sm font-bold text-gray-900">
                  Choisir une option
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
                              type="button"
                              key={idx + 1}
                              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                state.selectedVariant &&
                                state.selectedVariant[variant.name] === v.value
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"
                              }`}
                              onClick={() => {
                                dispatch({
                                  type: "SELECT_VARIANT",
                                  payload: {
                                    name: variant.name,
                                    value: v.value,
                                  },
                                });
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
            )}
          </div>
        </article>
        <form
          method="post"
          action=""
          className="product-purchase-form"
          onSubmit={handleSubmit}
        >
          <div className="product-purchase-card market-card sticky top-24 flex flex-col gap-6 p-5 sm:p-6">
            <div className="px-5">
              <h4 className="mb-3 text-sm font-bold text-gray-900">
                <strong>Vendu par</strong>
              </h4>
              <ul>
                <li className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  {" "}
                  <LiaBuildingSolid size={15} />{" "}
                  {state.product && state.product.boutiks_id.name}
                </li>
                <li className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  {" "}
                  <LiaPhoneSolid size={15} />{" "}
                  {state.product && (
                    <a href={`tel:${state.product.boutiks_id.phoneNumber}`}>
                      {state.product.boutiks_id.phoneNumber}
                    </a>
                  )}
                </li>
                <li className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  {" "}
                  <LiaMapMarkedSolid size={15} />{" "}
                  {state.product && state.product.boutiks_id.adresse}
                </li>
                {state.product?.boutiks_id.email && (
                  <li className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                    <LiaAtSolid size={15} />
                    <a href={`mailto:${state.product.boutiks_id.email}`}>
                      {state.product.boutiks_id.email}
                    </a>
                  </li>
                )}
              </ul>
              {state.product?.boutiks_id.description && (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {state.product.boutiks_id.description}
                </p>
              )}
              {shopLinks.length > 0 && (
                <nav
                  className="product-shop-links"
                  aria-label="Site web et réseaux sociaux de la boutique"
                >
                  {shopLinks.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              )}
            </div>
            <div className="px-5">
              <p className="mb-2 text-sm font-bold text-gray-900">
                <strong>Quantités</strong>
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="quantity-stepper rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-lg font-bold"
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
                  className="quantity-input w-full rounded-lg border border-gray-200 py-2 px-3 text-center font-semibold"
                  defaultValue={1}
                  value={state.counter}
                  readOnly
                />
                <button
                  className="quantity-stepper rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-lg font-bold"
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
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                <span className="text-gray-500">Total estimé</span>
                <strong className="text-lg text-gray-900">
                  {priceInArriary(state.totalPrice)}
                </strong>
              </div>
            </div>
            <div className="w-full px-5">
              <button
                type="submit"
                className="market-button-primary w-full uppercase"
                disabled={state.product.stock === 0 || !csrf}
              >
                {state.product.stock === 0 ? t("product.outOfStock") : t("product.addToCart")}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="product-comments-container market-container pb-10 sm:pb-14">
        <Comment product_id={id as string} csrf={csrf as string} />
      </div>
    </>
  );
}

export default ProductDetails;
