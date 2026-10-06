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
  const [state, dispatch] = useReducer(reducer, initialState);
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
          `${import.meta.env.REACT_API_URL}shop/product`,
        );
        if (!response.ok)
          throw new Error("Impossible de charger les produits.");
        const data = await response.json();
        const shuffledProducts: IProduct[] = [...(data.data ?? [])];
        for (let index = shuffledProducts.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [shuffledProducts[index], shuffledProducts[randomIndex]] = [
            shuffledProducts[randomIndex],
            shuffledProducts[index],
          ];
        }
        dispatch({ type: "FETCH_SUCCESS", payload: shuffledProducts });
      } catch (error) {
        dispatch({
          type: "FETCH_ERROR",
          payload: error instanceof Error ? error.message : "Erreur inconnue",
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
  }, [location]);

  return (
    <>
      <section className="banner text-lg">
        <div className="market-container relative z-10 grid min-h-[inherit] grid-cols-1 items-center gap-2 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="flex h-full flex-col items-center justify-center gap-5 py-12 text-center sm:items-start sm:py-0 sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Le
              commerce malgache, à portée de clic
            </span>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#183524] sm:text-5xl md:text-[4.15rem]">
              Les trouvailles locales{" "}
              <span className="text-emerald-700">qui font la différence.</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              Explorez des produits uniques et soutenez les boutiques de
              Madagascar. Votre prochaine belle découverte est ici.
            </p>
            <form
              className="relative mt-1 h-fit w-full max-w-xl"
              onSubmit={handleSearch}
              role="search"
            >
              <input
                type="search"
                className="market-input relative h-14 w-full rounded-2xl border-white bg-white pl-5 pr-16 text-sm shadow-[0_14px_38px_rgba(24,53,36,0.10)] sm:text-base"
                placeholder="Un produit, une boutique, une idée..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Rechercher un produit ou une boutique"
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-1.5 top-1.5 flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-white transition hover:bg-emerald-950"
              >
                <LiaSearchSolid size={24} />
                <span className="hidden text-sm font-semibold sm:block">
                  Chercher
                </span>
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500 sm:justify-start">
              <span className="flex items-center gap-1.5">
                <LiaCheckCircle className="text-emerald-700" size={17} />{" "}
                Boutiques locales
              </span>
              <span className="flex items-center gap-1.5">
                <LiaCheckCircle className="text-emerald-700" size={17} /> Des
                produits pour tous
              </span>
            </div>
          </div>
          <div className="banner-art">
            <img
              src="/marketplace-hero.svg"
              alt="Illustration d'un sac de shopping ShopInMada entouré de produits"
              className="banner-art-image"
            />
            <div className="banner-product-tag banner-product-tag--top hidden items-center gap-3 sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                ✦
              </span>
              <span>
                <strong className="block text-sm">Les pépites du pays</strong>
                <small className="text-gray-500">Sélectionnées pour vous</small>
              </span>
            </div>
            <div className="banner-product-tag banner-product-tag--bottom flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
                M
              </span>
              <span>
                <strong className="block text-sm">Achetez local</strong>
                <small className="text-gray-500">
                  Faites grandir nos boutiques
                </small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="bg-[#f8faf8] py-16 text-lg">
        <div className="market-container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Sélection du moment
              </p>
              <h2 className="market-section-title">Nos produits populaires</h2>
            </div>
            <Link
              to="/shop"
              className="font-semibold text-emerald-800 transition hover:text-emerald-950"
            >
              Voir toute la boutique <LiaArrowRightSolid className="inline" />
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
              Les produits arrivent bientôt.
            </p>
          )}
          <div className="grid grid-cols-1 gap-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
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
              Une marketplace d’ici
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Le savoir-faire local mérite une vitrine sans frontières.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/75">
              ShopInMada rapproche les boutiques malgaches et les personnes qui
              recherchent des produits uniques. Découvrez, échangez avec les
              vendeurs et faites vivre le commerce local.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-white transition hover:text-emerald-200"
            >
              Découvrir la marketplace <LiaArrowRightSolid />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="home-story-tile col-span-2 flex min-h-36 items-center gap-4 rounded-2xl p-5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <FaStore size={21} />
              </span>
              <div>
                <h3 className="font-bold text-white">
                  Des boutiques malgaches
                </h3>
                <p className="mt-1 text-sm leading-6 text-emerald-50/65">
                  Une place pour les petites entreprises et les marques locales.
                </p>
              </div>
            </div>
            <div className="home-story-tile min-h-36 rounded-2xl p-5 sm:p-6">
              <FaMapMarkerAlt className="mb-4 text-xl text-emerald-300" />
              <h3 className="font-bold text-white">Partout au pays</h3>
              <p className="mt-1 text-sm leading-6 text-emerald-50/65">
                Explorez les offres par ville et par boutique.
              </p>
            </div>
            <div className="home-story-tile min-h-36 rounded-2xl p-5 sm:p-6">
              <FaRegHeart className="mb-4 text-xl text-emerald-300" />
              <h3 className="font-bold text-white">Un achat qui soutient</h3>
              <p className="mt-1 text-sm leading-6 text-emerald-50/65">
                Chaque découverte fait rayonner le talent local.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-lg sm:py-20">
        <div className="market-container">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Une expérience simple
            </p>
            <h2 className="market-section-title">
              Tout commence par une belle découverte.
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-500">
              Trouvez ce qu’il vous faut et entrez directement en contact avec
              les boutiques.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <LiaSearchSolid size={22} />,
                title: "Recherchez facilement",
                text: "Parcourez le catalogue ou recherchez un article précis en quelques secondes.",
              },
              {
                icon: <FaMapMarkerAlt size={20} />,
                title: "Explorez par région",
                text: "Affinez votre recherche avec les villes disponibles dans la marketplace.",
              },
              {
                icon: <FaStore size={20} />,
                title: "Rencontrez les boutiques",
                text: "Consultez les produits et les informations partagées par chaque vendeur.",
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
              Pour les professionnels
            </p>
            <h2 className="market-section-title max-w-xl text-3xl sm:text-4xl">
              Donnez plus de visibilité à votre boutique.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-gray-600">
              Développez votre présence en ligne et présentez vos produits à de
              nouveaux clients sur ShopInMada.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Annonces illimitées",
                "Mise en avant dans les recherches",
                "Statistiques avancées",
                "Support prioritaire",
                "Page boutique personnalisée",
                "Promotions exclusives",
              ].map((feature) => (
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
              Votre boutique, en première ligne.
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/65">
              Des outils pour mettre en valeur votre catalogue et gérer votre
              activité.
            </p>
            <p className="mt-7 border-t border-white/15 pt-5">
              <strong className="text-3xl font-bold">30 000 Ar</strong>
              <span className="text-sm text-white/60"> / mois</span>
            </p>
            <Link
              to="/espace_vendeur/dash"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50"
            >
              Commencer maintenant <LiaArrowRightSolid />
            </Link>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}

export default Home;
