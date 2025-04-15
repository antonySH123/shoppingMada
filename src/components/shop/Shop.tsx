import { useEffect, useReducer, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../product/ProductCard";
import IProduct from "../../Interface/IProduct";
import SkeletonCard from "../product/SkeletonCard";

interface IState {
  allProducts: IProduct[] | null; // Tous les produits récupérés
  loading: boolean;
  error: string | null;
}

const initialState: IState = {
  allProducts: null,
  loading: false,
  error: null,
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: IProduct[] }
  | { type: "FETCH_ERROR"; payload: string };

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { allProducts: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

function Shop() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const query = searchParams.get("q");
  const location = searchParams.get("location");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    dispatch({ type: "FETCH_START" });

    const fetchProducts = async () => {
      try {
        const url = slug ? `shop/${slug}/product` : query ? `product/search?q=${encodeURIComponent(query)}${location ? `&location=${location && encodeURIComponent(location as string)}`:""}` : "shop/product";
        const response = await fetch(`${import.meta.env.REACT_API_URL}${url}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          toast.error("Une erreur est survenue");
          return;
        }

        const result = await response.json();
        console.log(result.data);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });

      } catch (error: unknown) {
        if (error instanceof Error) {
          dispatch({ type: "FETCH_ERROR", payload: error.message });
        } else {
          dispatch({ type: "FETCH_ERROR", payload: "Erreur inconnue" });
        }
      }
    };

    fetchProducts();
  }, [location, query, slug]);

  const totalProducts = state.allProducts ? state.allProducts.length : 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const displayedProducts = state.allProducts
    ? state.allProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  return (
    <div className="overflow-y-auto w-[inherit]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-10 md:px-2">
          {state.loading
            ? Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)
            : displayedProducts.map((product, index) => (
                <ProductCard product={product} key={index} />
              ))}
        </div>

        {/* Pagination */}
        <div className="mx-auto min-w-full py-5 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`border-2 px-5 py-2 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "border-green-500 hover:bg-green-500 hover:text-white"}`}
          >
            Précédent
          </button>
          <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`border-2 px-5 py-2 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "border-green-500 hover:bg-green-500 hover:text-white"}`}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

export default Shop;
