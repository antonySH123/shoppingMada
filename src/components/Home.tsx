import React, { FormEvent, useEffect, useReducer, useState } from "react";
import {
  LiaArrowRightSolid,
  LiaCheckCircle,
  LiaSearchSolid,
} from "react-icons/lia";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Contact from "./Contact";
import ProductCard from "./product/ProductCard";
import IProduct from "../Interface/IProduct";
import SkeletonCard from "./product/SkeletonCard";

interface State {
  products: IProduct[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  products: null,
  loading: false,
  error: null,
};

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
  const [searchTerm, setSearchTerm] = useState<string | null>();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(searchTerm as string)}`);
  };
  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}shop/product`
        );
        const data = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
      } catch (error) {
        if (error instanceof Error) {
          dispatch({ type: "FETCH_ERROR", payload: error.message });
        } else {
          dispatch({ type: "FETCH_ERROR", payload: "Erreur inconnue" });
        }
      }
    };
    fetchProduct();
  }, [location]);
  return (
    <React.Fragment>
      <div className="banner text-lg">
        <div className="container mx-auto px-4 sm:px-10 grid grid-cols-1 sm:grid-cols-2 h-full">
          <div className="text-white px-10 h-full flex flex-col justify-center items-center sm:items-start gap-3">
            <h1 className="text-7xl text-center sm:text-start ">
              Bienvenue sur <span className="font-bold">ShoppingMada</span>
            </h1>
            <p className="text-base text-center sm:text-start">
              ShoppingMada vous offre une expérience de shopping en ligne
              unique, alliant produits de qualité, service client réactif, et
              livraison rapide partout à Madagascar.
            </p>
            <form
              action=""
              method="post"
              className="relative p-0 h-fit mt-3 w-full"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                className="w-full rounded-full h-16 relative text-black px-5"
                placeholder="Rechercher votre produit (tee-shirt, pantalon, etc)"
                value={searchTerm as string}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className=" hover:bg-gray-600/45 hover:text-white text-gray-500 h-16 w-16 rounded-full flex items-center justify-center absolute top-0 right-0 "
              >
                <LiaSearchSolid size={30} />
              </button>
            </form>
          </div>
          <div></div>
        </div>
      </div>
      {/* SECTION TOP PRODUIT */}
      <section id="product" className="text-lg">
        <div className="shopping py-14">
          <h1 className="text-center text-4xl font-thin mt-4 mb-6">
            Nos top produits
          </h1>
          <div className="container px-10 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-5">
              {state.loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))
                : state.products &&
                  state.products.length > 0 &&
                  state.products
                    .slice(0, 4)
                    .map((product, index) => (
                      <ProductCard product={product} key={index + 1} />
                    ))}
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/shop"
                className="rounded-md px-5 py-2  flex items-center gap-3 hover:bg-green-500 hover:text-white"
              >
                Tous les produits
                <LiaArrowRightSolid />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* FIN SECTION TOP PRODUIT */}
      {/* SECTION ABOUT */}
      <section id="about" className="h-96 relative z-0 text-lg">
        <div className="absolute top-0 left-0 bg-green-400/25  h-full w-full z-10"></div>
        <div className="py-5 px-14 w-full relative  z-20 h-80 flex flex-col justify-center">
          <h1 className="text-4xl text-center text-white font-thin">
            Qui nous sommes ?
          </h1>
          <p className="mt-4 text-white text-center">
            Nous somme des groupes des jeunes avec différents capacités
            professionnel et personnel. On a un spécialiste en science économie,
            un ingénieur en informatique et spécialiste en gestion et commerce.
          </p>
        </div>
      </section>

      <section className="h-auto w-full px-10 py-20 text-lg">
        <h1 className="text-4xl text-center font-thin mb-2">
          Pourquoi nous choisir ?
        </h1>
        <p className="text-center px-20 mb-3">
          Notre projet c&apos;est de promouvoir la visibilité des entreprises,
          des startupers, centre commercial et magasin pour vendre leur biens et
          service en ligne. Les visiteurs de notre plateforme « ShopInMada »
          peuvent facilement obtenir des informations sur l&apos;article poster
          sur notre plateforme en quelque second en mode recherche. La
          plateforme sera disponible pour toutes les régions de Madagascar.
          Notre vision : promouvoir la technologie à Madagascar et aider les
          entreprises d&apos;augmenter leur marcher. Notre Mission : Création de
          marche en ligne et faciliter la communication entre l&apos;entreprise
          et leur
        </p>
      </section>

      <section id="abonnements" className="px-10 bg-gray-100 py-10 text-lg">
        <div className="container mx-auto">
          <h1 className="text-center text-4xl font-thin my-8">
            Abonnements PRO
          </h1>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">
              Boostez Votre Visibilité en Ligne
            </h2>
            <p>
              Passez à un niveau supérieur et développez votre activité avec
              notre Plan Pro. Profitez de fonctionnalités exclusives pour
              attirer plus de clients et maximiser vos ventes.
            </p>
            <ul className="">
              <li className="flex items-center gap-3">
                <LiaCheckCircle color={'green'} />
                Annonces illimitées : Publiez autant de produits que vous le
                souhaitez
              </li>
              <li className="flex items-center gap-3">
                <LiaCheckCircle color={'green'} />
                Mise en avant premium: Vos produits apparaissent en priorité
                dans les recherches{" "}
              </li>
              <li className="flex items-center gap-3">
                <LiaCheckCircle color={'green'} />
                Statistiques avancées: Analysez les performances de vos ventes{" "}
              </li>
              <li className="flex items-center gap-3">
                <LiaCheckCircle color={'green'} />
                Support prioritaire: Assistance rapide et dédiée{" "}
              </li>
              <li className="flex items-center gap-3">
                <LiaCheckCircle color={'green'} />
                Page boutique personnalisée: Ajoutez votre logo, description et
                promotions{" "}
              </li>
              <li className="flex items-center gap-3">
                <LiaCheckCircle color={'green'} />
                Promotions & Réductions exclusives{" "}
              </li>
            </ul>
            <p>
              Passez au plan Pro et augmentez vos ventes dès aujourd&apos;hui !
            </p>
            <p className="">
              <span>Seulement</span>&nbsp;<strong className="text-4xl font-bold">30 000 Ar</strong>/
              <sub>mois</sub>
            </p>

            <Link to={"/espace_vendeur/dash"} className="bg-green-500 px-4 py-3 mt-3 ml-auto text-white rounded">
              Commencer dès maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* FIN SECTION ABOUT */}
      {/* SECTION CONTACT */}
      <Contact />

      {/* FIN SECTION CONTACT */}
    </React.Fragment>
  );
}

export default Home;
