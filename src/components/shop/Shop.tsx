import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../product/ProductCard";
import IProduct from "../../Interface/IProduct";
import SkeletonCard from "../product/SkeletonCard";
import { useLanguage } from "../../context/useLanguage";

interface IState {
  allProducts: IProduct[] | null; // Tous les produits récupérés
  loading: boolean;
  error: string | null;
  total: number;
  pages: number;
}

const initialState: IState = {
  allProducts: null,
  total: 0,
  pages: 1,
  loading: false,
  error: null,
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { data: IProduct[]; total: number; pages: number } }
  | { type: "FETCH_ERROR"; payload: string };

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { allProducts: action.payload.data, total: action.payload.total, pages: action.payload.pages, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

function Shop() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "newest";
  const [filters, setFilters] = useState({ location: location ?? "", minPrice: minPrice ?? "", maxPrice: maxPrice ?? "", sort });
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const controller = new AbortController();
    const loadCategoryLabels = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_API_CATEGORY_URL}all/category`, { signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json();
        const labels: Record<string, string> = {};
        const visit = (items: Array<{ _id?: string; name?: string; children?: unknown[] }>) => {
          items.forEach((item) => {
            if (item._id && item.name) labels[item._id] = item.name;
            if (Array.isArray(item.children)) visit(item.children as typeof items);
          });
        };
        if (Array.isArray(result.category)) visit(result.category);
        setCategoryLabels(labels);
      } catch {
        // Product grouping still works when CategoryAPI is temporarily unavailable.
      } finally {
        if (!controller.signal.aborted) setCategoriesLoaded(true);
      }
    };
    void loadCategoryLabels();
    return () => controller.abort();
  }, []);

  useEffect(() => setCurrentPage(1), [category, location, maxPrice, minPrice, query, slug, sort]);
  useEffect(() => setFilters({ location: location ?? "", minPrice: minPrice ?? "", maxPrice: maxPrice ?? "", sort }), [location, maxPrice, minPrice, sort]);

  useEffect(() => {
    dispatch({ type: "FETCH_START" });

    const fetchProducts = async () => {
      try {
        const url = slug
          ? `shop/${slug}/product?page=${currentPage}&limit=${itemsPerPage}`
          : `shop/product?page=${currentPage}&limit=${itemsPerPage}`;
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        if (location) params.set("location", location);
        if (sort) params.set("sort", sort);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        const requestUrl = `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;
        const response = await fetch(`${import.meta.env.REACT_API_URL}${requestUrl}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok)
          throw new Error(t("shop.loadError"));

        const result = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: { data: result.data ?? [], total: result.pagination?.total ?? result.data?.length ?? 0, pages: result.pagination?.pages ?? 1 } });
      } catch (error: unknown) {
        if (error instanceof Error) {
          dispatch({ type: "FETCH_ERROR", payload: error.message });
          toast.error(error.message);
        } else {
          dispatch({ type: "FETCH_ERROR", payload: t("shop.loadError") });
        }
      }
    };

    fetchProducts();
  }, [category, location, maxPrice, minPrice, query, slug, sort, currentPage, t]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setCurrentPage(1);
    setSearchParams(next);
  };

  const totalProducts = state.total;
  const totalPages = state.pages;
  const productGroups = useMemo(() => {
    const displayedProducts = state.allProducts ?? [];
    const groups = new Map<string, IProduct[]>();
    displayedProducts.forEach((product) => {
      const categoryId = product.category?.trim() || "__other__";
      const key = categoryLabels[categoryId] || !categoriesLoaded ? categoryId : "__other__";
      groups.set(key, [...(groups.get(key) ?? []), product]);
    });
    return Array.from(groups, ([key, products]) => ({
      key,
      label: categoryLabels[key] ?? t("shop.otherProducts"),
      products,
    }));
  }, [categoriesLoaded, categoryLabels, state.allProducts, t]);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] w-full flex-1 overflow-y-auto bg-[#f8faf8] py-8 md:py-10">
      <div className="market-container">
        <div className="shop-results-heading mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
              ShopInMada
            </p>
            <h1 className="market-section-title">
              {slug
                ? t("shop.storeTitle")
                : category
                    ? t("shop.categoryTitle")
                : query
                    ? `${t("shop.resultsFor")} « ${query} »`
                    : t("shop.title")}
            </h1>
          </div>
          {state.allProducts && (
            <p className="text-sm text-gray-500">
              {t("shop.productCount").replace("{count}", String(totalProducts))}
            </p>
          )}
        </div>
        <form aria-label={t("shop.applyFilters")} onSubmit={applyFilters} className="mb-[1.1rem] min-w-0 max-md:-mx-2.5 max-md:mb-3 max-md:w-[calc(100%+1.25rem)]">
          <div className="shop-filter-scroll flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain px-0.5 py-[0.35rem] pb-[0.55rem] [scrollbar-width:none] max-md:gap-[0.45rem] max-md:px-[0.65rem]">
            <label className="grid w-[10.5rem] min-w-0 flex-none gap-[0.18rem] rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-[0.7rem] py-[0.45rem] pb-2 shadow-[0_5px_14px_rgb(27_49_37_/_4%)] max-md:min-h-[3.45rem] max-md:rounded-[0.85rem] max-md:px-[0.6rem] max-md:py-[0.4rem]">
              <span className="text-[0.6rem] font-bold leading-tight text-[var(--muted)]">{t("shop.city")}</span>
              <input className="h-[1.55rem] w-full min-w-0 border-0 !bg-transparent text-[0.75rem] font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:outline-none max-md:h-6 max-md:text-[0.72rem]" value={filters.location} maxLength={100} placeholder={t("shop.allCities")} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} />
            </label>
            <label className="grid w-32 min-w-0 flex-none gap-[0.18rem] rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-[0.7rem] py-[0.45rem] pb-2 shadow-[0_5px_14px_rgb(27_49_37_/_4%)] max-md:min-h-[3.45rem] max-md:rounded-[0.85rem] max-md:px-[0.6rem] max-md:py-[0.4rem]">
              <span className="text-[0.6rem] font-bold leading-tight text-[var(--muted)]">{t("shop.minimumPrice")}</span>
              <input className="h-[1.55rem] w-full min-w-0 border-0 !bg-transparent text-[0.75rem] font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:outline-none max-md:h-6 max-md:text-[0.72rem]" type="number" min="0" value={filters.minPrice} placeholder={t("shop.noMinimum")} onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))} />
            </label>
            <label className="grid w-32 min-w-0 flex-none gap-[0.18rem] rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-[0.7rem] py-[0.45rem] pb-2 shadow-[0_5px_14px_rgb(27_49_37_/_4%)] max-md:min-h-[3.45rem] max-md:rounded-[0.85rem] max-md:px-[0.6rem] max-md:py-[0.4rem]">
              <span className="text-[0.6rem] font-bold leading-tight text-[var(--muted)]">{t("shop.maximumPrice")}</span>
              <input className="h-[1.55rem] w-full min-w-0 border-0 !bg-transparent text-[0.75rem] font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:outline-none max-md:h-6 max-md:text-[0.72rem]" type="number" min="0" value={filters.maxPrice} placeholder={t("shop.noMaximum")} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))} />
            </label>
            <label className="grid w-[10.5rem] min-w-0 flex-none gap-[0.18rem] rounded-[0.95rem] border border-[var(--border)] bg-[var(--card)] px-[0.7rem] py-[0.45rem] pb-2 shadow-[0_5px_14px_rgb(27_49_37_/_4%)] max-md:min-h-[3.45rem] max-md:rounded-[0.85rem] max-md:px-[0.6rem] max-md:py-[0.4rem]">
              <span className="text-[0.6rem] font-bold leading-tight text-[var(--muted)]">{t("shop.sortBy")}</span>
              <select className="h-[1.55rem] w-full min-w-0 border-0 !bg-transparent text-[0.75rem] font-bold text-[var(--foreground)] outline-none focus:outline-none [color-scheme:light] dark:[color-scheme:dark] dark:[&>option]:bg-[#172326] dark:[&>option]:text-[#eef6f3] max-md:h-6 max-md:text-[0.72rem]" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
                <option value="newest">{t("shop.newest")}</option>
                <option value="oldest">{t("shop.oldest")}</option>
                <option value="price_asc">{t("shop.priceAscending")}</option>
                <option value="price_desc">{t("shop.priceDescending")}</option>
              </select>
            </label>
            <button type="submit" className="min-h-[3.25rem] flex-none rounded-[0.95rem] bg-[linear-gradient(110deg,#147b49,#0f6845)] px-4 text-xs font-extrabold text-white shadow-[0_8px_18px_rgb(22_131_75_/_17%)] transition hover:-translate-y-px hover:shadow-[0_11px_22px_rgb(22_131_75_/_22%)] max-md:min-h-[3.45rem] max-md:rounded-[0.85rem] max-md:px-[0.85rem]">{t("shop.applyFilters")}</button>
          </div>
        </form>
        {!state.loading && !state.error && state.allProducts?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("shop.noResultsHint")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("shop.noResults")}
            </p>
          </div>
        )}
        {state.error && (
          <p
            role="status"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}
        {state.loading ? (
          <div className="shop-product-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        ) : (
          <div className="shop-category-sections grid gap-6 max-md:gap-[1.1rem]">
            {productGroups.map((group) => (
              <section className="shop-category-section min-w-0 max-md:rounded-[1.15rem] max-md:border max-md:border-[var(--border)] max-md:bg-[linear-gradient(150deg,var(--card),var(--muted-surface))] max-md:p-3 max-md:shadow-[0_8px_22px_rgb(27_49_37_/_4%)]" key={group.key} aria-labelledby={`category-${group.key}`}>
                <header className="mb-[0.7rem] flex min-w-0 items-center justify-between gap-4 px-0.5 max-md:mb-[0.55rem]">
                  <div className="min-w-0">
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[var(--primary)]">{t("shop.categoryLabel")}</span>
                    <h2 className="mt-[0.15rem] overflow-hidden text-ellipsis whitespace-nowrap text-[1.2rem] font-extrabold tracking-[-0.035em] text-[var(--foreground)] max-md:text-base" id={`category-${group.key}`}>{group.label}</h2>
                  </div>
                  <span className="flex-none rounded-full border border-[var(--border)] bg-[var(--muted-surface)] px-[0.65rem] py-[0.35rem] text-[0.68rem] font-bold text-[var(--foreground)] max-md:px-[0.55rem] max-md:py-[0.3rem] max-md:text-[0.62rem]">
                    {t("shop.pageProductCount").replace("{count}", String(group.products.length))}
                  </span>
                </header>
                <div className="shop-product-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-md:gap-[0.55rem]">
                  {group.products.map((product) => <ProductCard product={product} key={product._id} />)}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label={t("shop.pagination")}
            className="mx-auto flex min-w-full items-center justify-center gap-3 py-8"
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`border-2 px-5 py-2 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "border-green-500 hover:bg-green-500 hover:text-white"}`}
            >
              {t("shop.previous")}
            </button>
            <span className="text-lg font-semibold">
              {t("shop.pageOf")} {currentPage} {t("shop.of")} {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`border-2 px-5 py-2 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "border-green-500 hover:bg-green-500 hover:text-white"}`}
            >
              {t("shop.next")}
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}

export default Shop;
