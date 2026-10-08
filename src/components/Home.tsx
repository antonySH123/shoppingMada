import { FormEvent, useEffect, useReducer, useState } from "react";
import {
  LiaArrowRightSolid,
  LiaCheckCircle,
  LiaSearchSolid,
} from "react-icons/lia";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaRegHeart, FaStore } from "react-icons/fa";
import Contact from "./Contact";
import ProductCard from "./product/ProductCard";
import IProduct from "../Interface/IProduct";
import SkeletonCard from "./product/SkeletonCard";
import { useLanguage } from "../context/useLanguage";

interface State {
  products: IProduct[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: State = { products: null, loading: false, error: null };
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: IProduct[] }
  | { type: "FETCH_ERROR"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { products: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error("Action inconnue");
  }
};

function Home() {
  const { t, language } = useLanguage();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [proPlan, setProPlan] = useState<{ monthlyPriceMGA: number; maxProducts: number; features: { advancedAnalytics: boolean; prioritySupport: boolean; customCategories: boolean } } | null>(null);
  const [planLoadFailed, setPlanLoadFailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}shop/product?page=1&limit=8&sort=newest`,
        );
        if (!response.ok)
          throw new Error(t("home.productLoadError"));
        const data = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data.data ?? [] });
      } catch (error) {
        dispatch({
          type: "FETCH_ERROR",
          payload: error instanceof Error ? error.message : t("home.productLoadError"),
        });
      }
    };

    fetchProducts();
    if (location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  }, [location, t]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${import.meta.env.REACT_API_URL}subscription/plans`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || t("home.planUnavailable"));
        const plan = Array.isArray(result.data) ? result.data.find((item: { key?: string }) => item?.key === "pro") : null;
        if (!plan || !Number.isFinite(Number(plan.monthlyPriceMGA)) || Number(plan.monthlyPriceMGA) < 0) throw new Error(t("home.planUnavailable"));
        setProPlan({
          monthlyPriceMGA: Number(plan.monthlyPriceMGA),
          maxProducts: Number.isFinite(Number(plan.maxProducts)) && Number(plan.maxProducts) >= 0 ? Number(plan.maxProducts) : 0,
          features: {
            advancedAnalytics: plan.features?.advancedAnalytics === true,
            prioritySupport: plan.features?.prioritySupport === true,
            customCategories: plan.features?.customCategories === true,
          },
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPlanLoadFailed(true);
        }
      });
    return () => controller.abort();
  }, [t]);

  return (
    <>
      <section className="banner text-lg">
        <div className="market-container relative z-10 grid min-h-[inherit] grid-cols-1 items-center gap-2 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="flex h-full flex-col items-center justify-center gap-5 py-12 text-center sm:items-start sm:py-0 sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> {t("home.kicker")}
            </span>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#183524] sm:text-5xl md:text-[4.15rem]">
              {t("home.title")}{" "}
              <span className="text-emerald-700">{t("home.titleAccent")}</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              {t("home.intro")}
            </p>
            <form
              className="relative mt-1 h-fit w-full max-w-xl"
              onSubmit={handleSearch}
              role="search"
            >
              <input
                type="search"
                className="market-input relative h-14 w-full rounded-2xl border-white bg-white pl-5 pr-16 text-sm shadow-[0_14px_38px_rgba(24,53,36,0.10)] sm:text-base"
                placeholder={t("home.search")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label={t("nav.searchDesktop")}
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-1.5 top-1.5 flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-white transition hover:bg-emerald-950"
              >
                <LiaSearchSolid size={24} />
                <span className="hidden text-sm font-semibold sm:block">
                  {t("nav.search")}
                </span>
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500 sm:justify-start">
              <span className="flex items-center gap-1.5">
                <LiaCheckCircle className="text-emerald-700" size={17} />{" "}
                {t("home.localShops")}
              </span>
              <span className="flex items-center gap-1.5">
                <LiaCheckCircle className="text-emerald-700" size={17} /> {t("home.productsForAll")}
              </span>
            </div>
          </div>
          <div className="banner-art">
            <img
              src="/marketplace-hero.svg"
              alt={t("home.heroAlt")}
              className="banner-art-image"
            />
            <div className="banner-product-tag banner-product-tag--top hidden items-center gap-3 sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                ✦
              </span>
              <span>
                <strong className="block text-sm">{t("home.localFinds")}</strong>
                <small className="text-gray-500">{t("home.curated")}</small>
              </span>
            </div>
            <div className="banner-product-tag banner-product-tag--bottom flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
                M
              </span>
              <span>
                <strong className="block text-sm">{t("home.buyLocal")}</strong>
                <small className="text-gray-500">
                  {t("home.growShops")}
                </small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-mobile-hero market-container" aria-label={t("home.kicker")}>
        <div className="home-mobile-hero-copy">
          <span className="home-mobile-kicker">
            <span aria-hidden="true" /> {t("home.kicker")}
          </span>
          <h1>
            {t("home.title")} <strong>{t("home.titleAccent")}</strong>
          </h1>
          <p>{t("home.intro")}</p>
        </div>
      </section>

      <section id="product" className="bg-[#f8faf8] py-16 text-lg">
        <div className="market-container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {t("home.selection")}
              </p>
              <h2 className="market-section-title">{t("home.popularProducts")}</h2>
            </div>
            <Link
              to="/shop"
              className="font-semibold text-emerald-800 transition hover:text-emerald-950"
            >
              {t("home.viewAll")} <LiaArrowRightSolid className="inline" />
            </Link>
          </div>
          {state.error && (
            <p
              role="status"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {state.error}
            </p>
          )}
          {!state.loading && !state.error && state.products?.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              {t("home.noProducts")}
            </p>
          )}
          <div className="home-product-grid grid grid-cols-1 gap-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
            {state.loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : state.products
                  ?.slice(0, 4)
                  .map((product) => (
                    <ProductCard product={product} key={product._id} />
                  ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="home-story-section overflow-hidden py-16 text-lg sm:py-20"
      >
        <div className="market-container grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-emerald-300">
              {t("home.storyKicker")}
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("home.storyTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/75">
              {t("home.storyText")}
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-white transition hover:text-emerald-200"
            >
              {t("home.storyLink")} <LiaArrowRightSolid />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="home-story-tile col-span-2 flex min-h-36 items-center gap-4 rounded-2xl p-5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <FaStore size={21} />
              </span>
              <div>
                <h3 className="font-bold text-white">
                  {t("home.localShopsTitle")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50/65">
                  {t("home.localShopsText")}
                </p>
              </div>
            </div>
            <div className="home-story-tile min-h-36 rounded-2xl p-5 sm:p-6">
              <FaMapMarkerAlt className="mb-4 text-xl text-emerald-300" />
              <h3 className="font-bold text-white">{t("home.everywhere")}</h3>
              <p className="mt-1 text-sm leading-6 text-emerald-50/65">
                {t("home.byCity")}
              </p>
            </div>
            <div className="home-story-tile min-h-36 rounded-2xl p-5 sm:p-6">
              <FaRegHeart className="mb-4 text-xl text-emerald-300" />
              <h3 className="font-bold text-white">{t("home.supportLocal")}</h3>
              <p className="mt-1 text-sm leading-6 text-emerald-50/65">
                {t("home.supportText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-lg sm:py-20">
        <div className="market-container">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              {t("home.simpleExperience")}
            </p>
            <h2 className="market-section-title">
              {t("home.discoveryTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-500">
              {t("home.discoveryText")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <LiaSearchSolid size={22} />,
                title: t("home.searchEasy"),
                text: t("home.searchEasyText"),
              },
              {
                icon: <FaMapMarkerAlt size={20} />,
                title: t("home.exploreRegions"),
                text: t("home.exploreRegionsText"),
              },
              {
                icon: <FaStore size={20} />,
                title: t("home.meetShops"),
                text: t("home.meetShopsText"),
              },
            ].map((feature, index) => (
              <article
                key={feature.title}
                className="home-feature-card rounded-2xl border border-gray-100 bg-[#fbfcfb] p-6 sm:p-7"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                  {feature.icon}
                </span>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                  0{index + 1}
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="abonnements" className="bg-[#f2f6f1] py-16 text-lg sm:py-20">
        <div className="market-container grid items-center gap-9 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              {t("home.forProfessionals")}
            </p>
            <h2 className="market-section-title max-w-xl text-3xl sm:text-4xl">
              {t("home.proTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-gray-600">
              {t("home.proText")}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {(proPlan ? [
                proPlan.maxProducts > 0 ? t("home.planMaxProducts").replace("{count}", String(proPlan.maxProducts)) : t("home.planUnlimited"),
                ...(proPlan.features.advancedAnalytics ? [t("home.planAdvancedAnalytics")] : []),
                ...(proPlan.features.prioritySupport ? [t("home.planPrioritySupport")] : []),
                ...(proPlan.features.customCategories ? [t("home.planCustomCategories")] : []),
              ] : []).map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <LiaCheckCircle
                    className="shrink-0 text-emerald-700"
                    size={19}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="home-pro-card rounded-3xl bg-[#133c29] p-6 text-white shadow-[0_25px_60px_rgba(19,60,41,0.18)] sm:p-8">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100">
              ShopInMada Pro
            </span>
            <h3 className="mt-6 text-2xl font-bold">
              {t("home.proSlogan")}
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/65">
              {t("home.proDescription")}
            </p>
            <p className="mt-7 border-t border-white/15 pt-5">
              <strong className="text-3xl font-bold">{proPlan ? new Intl.NumberFormat(language === "fr" ? "fr-MG" : "en-US", { style: "currency", currency: "MGA", maximumFractionDigits: 0 }).format(proPlan.monthlyPriceMGA) : t(planLoadFailed ? "home.planUnavailable" : "home.planLoading")}</strong>
              {proPlan && <span className="text-sm text-white/60"> {t("home.perMonth")}</span>}
            </p>
            <Link
              to="/vendeur"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50"
            >
              {t("home.startSelling")} <LiaArrowRightSolid />
            </Link>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}

export default Home;
