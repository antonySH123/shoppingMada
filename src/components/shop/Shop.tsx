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

  useEffect(() => setCurrentPage(1), [location, query, slug]);

  useEffect(() => {
    dispatch({ type: "FETCH_START" });

    const fetchProducts = async () => {
      try {
        const url = slug ? `shop/${slug}/product` : query ? `product/search?q=${encodeURIComponent(query)}${location ? `&location=${location && encodeURIComponent(location as string)}`:""}` : "shop/product";
        const response = await fetch(`${import.meta.env.REACT_API_URL}${url}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Impossible de charger les produits.");

        const result = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });

      } catch (error: unknown) {
        if (error instanceof Error) {
          dispatch({ type: "FETCH_ERROR", payload: error.message });
          toast.error(error.message);
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
    <main className="min-h-[calc(100vh-4.5rem)] w-full flex-1 overflow-y-auto bg-[#f8faf8] py-8 md:py-10">
      <div className="market-container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">ShopInMada</p>
            <h1 className="market-section-title">{slug ? "Explorez cette boutique" : query ? `Résultats pour « ${query} »` : "Tous les produits"}</h1>
          </div>
          {state.allProducts && <p className="text-sm text-gray-500">{totalProducts} produit{totalProducts > 1 ? "s" : ""}</p>}
        </div>
        {!state.loading && !state.error && state.allProducts?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Aucun produit trouvé</h2>
            <p className="mt-2 text-sm text-gray-500">Essayez une autre recherche ou explorez toutes les catégories.</p>
          </div>
        )}
        {state.error && <p role="status" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>}
        <div className="shop-product-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {state.loading
            ? Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)
            : displayedProducts.map((product, index) => (
                <ProductCard product={product} key={index} />
              ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && <nav aria-label="Pagination des produits" className="mx-auto flex min-w-full items-center justify-center gap-3 py-8">
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
        </nav>}
      </div>
    </main>
  );
}

export default Shop;
