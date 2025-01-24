import { useEffect, useReducer } from "react";
import { LiaArrowRightSolid, LiaSearchSolid } from "react-icons/lia";
import { FaSmile, FaKey, FaFolder, FaCheckCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Contact from "./Contact";
import { ImPriceTags } from "react-icons/im";
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
  const location = useLocation();
  useEffect(() => {

    dispatch({type:"FETCH_START"});
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    const fetchProduct = async()=>{
      try {
        const response = await fetch(`${import.meta.env.REACT_API_URL}shop/product`);
        const data = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
      } catch(error){
        if(error instanceof Error){
          dispatch({ type: "FETCH_ERROR", payload: error.message });
        }else{
          dispatch({ type: "FETCH_ERROR", payload: "Erreur inconnue" });
        }
      }
    }
    fetchProduct();
  }, [location]);
  return (
    <>
      <div className="banner">
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
            >
              <input
                type="search"
                className="w-full rounded-full h-16 relative text-black px-5"
                placeholder="Rechercher votre produit (tee-shirt, pantalon, etc)"
              />
              <button
                type="submit"
                className=" hover:bg-gray-600/45 text-gray-500 h-16 w-16 rounded-full flex items-center justify-center absolute top-0 right-0 "
              >
                <LiaSearchSolid size={30} />
              </button>
            </form>
          </div>
          <div></div>
        </div>
      </div>
      {/* SECTION TOP PRODUIT */}
      <section id="product">
        <div className="shopping py-14">
          <h1 className="text-center text-4xl font-thin mt-4 mb-6">
            Nos top produits
          </h1>
          <div className="container px-10 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-5">
              {state.loading ? Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} /> ): 
              state.products && state.products.length > 0 &&
              state.products.slice(0, 4).map((product, index) => (
                <ProductCard
                product={product}
                key={index + 1}
              />
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
      <section id="about" className="h-96 relative z-0">
        <div className="absolute top-0 left-0 bg-green-400/25  h-full w-full z-10"></div>
        <div className="py-5 px-14 w-full relative  z-20 h-80 flex flex-col justify-center">
          <h1 className="text-4xl text-center text-white font-thin">
            Qui nous sommes ?
          </h1>
          <p className="mt-4 text-white text-center">
            ShoppingMada est une plateforme innovante de vente en ligne, dédiée
            à fournir une large gamme de produits de qualité allant des
            équipements essentiels aux médicaments spécialisés, pour répondre
            aux besoins variés de nos clients à Madagascar. Nous nous engageons
            à offrir une expérience d'achat fluide et sécurisée, avec une
            interface conviviale, des transactions rapides, et une livraison
            fiable. Notre mission est de rendre le shopping en ligne accessible
            à tous, en alliant commodité et confiance, tout en soutenant les
            entreprises locales pour contribuer à l'économie du pays.
            Rejoignez-nous pour découvrir une nouvelle façon de faire vos achats
            en toute simplicité!.
          </p>
        </div>
      </section>

      <section className="h-auto w-full px-10 py-20">
        <h1 className="text-4xl text-center font-thin">
          Pourquoi nous choisir ?
        </h1>
        <p className="text-center px-20">
          Choisir ShoppingMada, c'est opter pour une plateforme locale qui
          combine fiabilité, diversité de produits et une expérience d'achat
          fluide, tout en soutenant l'économie malgache à travers des
          transactions sécurisées et un service client dévoué
        </p>
        <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-4 mt-10">
          <div className="card border-none shadow-lg  h-full rounded-md py-4 px-4 hover:bg-green-500  hover:text-white   hover:ease-in-out">
            <div className="flex justify-center">
              <FaSmile className="text-5xl" />
            </div>
            <h2 className="text-center font-thin text-3xl">
              Facilité d'utilisation
            </h2>
            <p className="text-center ">
              Une plateforme doit offrir une interface intuitive, tant pour les
              vendeurs que pour les acheteurs, avec des outils simples pour
              gérer les produits, les commandes, et les paiements.
            </p>
          </div>
          <div className="card border-none shadow-lg h-full rounded-md py-4 px-4 hover:bg-green-500  hover:text-white hover:ease-in-out">
            <div className="flex justify-center">
              <FaKey className="text-5xl" />
            </div>
            <h2 className="text-center font-thin text-3xl">
              Sécurité des transactions
            </h2>
            <p className="text-center ">
              La protection des données personnelles et des informations
              financières des clients est primordiale. Une plateforme doit
              garantir des transactions sécurisées, avec des systèmes de
              cryptage et de protection contre les fraudes
            </p>
          </div>
          <div className="card border-none shadow-lg h-full rounded-md py-4 px-4 hover:bg-green-500  hover:text-white hover:ease-in-out">
            <div className="flex justify-center">
              <FaFolder className="text-5xl" />
            </div>
            <h2 className="text-center font-thin text-3xl">
              Options de personnalisation et de gestion
            </h2>
            <p className="text-center ">
              La plateforme doit permettre de personnaliser les boutiques en
              ligne selon les besoins spécifiques des vendeurs, avec des
              fonctionnalités telles que la gestion des stocks, le suivi des
              livraisons, et l'intégration de différents modes de paiement
            </p>
          </div>
        </div>
      </section>

      <section id="abonnements" className="px-10">
        <h1 className="text-center text-4xl font-thin my-8">
          Nos plans d'abonnements
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 gap-4 mt-5">
          <div>
            <h3 className="text-center text-3xl font-semibold">
              Nos différents plans d'abonnements
            </h3>
            <h4 className="text-2xl font-semibold text-green-500">
              Plan Free :
            </h4>
            <ul className="list-disc pl-9">
              <li className="leading-9">
                "Découvrez notre plateforme gratuitement avec des
                fonctionnalités essentielles pour démarrer."
              </li>
              <li className="leading-9">
                "Idéal pour les débutants : accédez aux outils de base sans
                engagement."
              </li>
              <li className="leading-9">
                "Une solution gratuite pour explorer nos services et tester nos
                fonctionnalités principales."
              </li>
            </ul>
            <h4 className="text-2xl font-semibold text-green-500">
              Plan Pro :
            </h4>
            <ul className="list-disc pl-9">
              <li className="leading-9">
                "Passez au niveau supérieur avec le plan Pro et bénéficiez de
                fonctionnalités avancées."
              </li>
              <li className="leading-9">
                "Conçu pour les professionnels exigeants : performances
                optimales et support prioritaire."
              </li>
              <li className="leading-9">
                "Accédez à des outils exclusifs, une personnalisation complète
                et un accompagnement dédié."
              </li>
            </ul>
          </div>
          <div className="border-none shadow-lg h-full rounded-md bg-gradient-to-r from-green-500 to-green-300">
            <div className="w-full h-40 flex justify-center items-center">
              <ImPriceTags className="w-20 h-20 text-white" />
            </div>
            <div className="flex flex-col justify-center items-center px-10">
              <p className="text-center text-white">
                L'abonnement gratuit sur ShopInMada offre un accès basique aux
                produits.
              </p>
              <h3 className="text-3xl font-bold uppercase text-white mt-3">
                Free
              </h3>
              <h3 className="text-2xl font-semibold text-white my-3">
                Gratuit pendant 3 Mois
              </h3>
            </div>
            <div className="flex px-20 py-3">
              <ul className="text-white flex flex-col gap-2">
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Accès aux produits disponibles</li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Détails des articles accessibles</li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Pas de promotions exclusives</li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Accès retardé aux nouveautés </li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Fonctionnalités premium absentes </li>
                </div>
              </ul>
            </div>
            <div className="flex justify-center items-center px-20 py-3">
              <a
                href=""
                className="border px-10 py-3 rounded-md text-white hover:bg-white hover:text-green-500"
              >
                S'ABONNER
              </a>
            </div>
          </div>

          {/* <div className="border-none shadow-lg h-full rounded-md bg-gradient-to-r from-blue-500 to-blue-300">
                <div className="w-full h-40 flex justify-center items-center">
                  <ImPriceTags className="w-20 h-20 text-white" />
                </div>
                <div className="flex flex-col justify-center items-center px-10">
                  <p className="text-justify text-white">L'abonnement gratuit sur ShopInMada offre un accès basique aux produits.</p>
                  <h3 className="text-3xl font-bold uppercase text-white">silver</h3>
                </div>
                <div className="flex px-20 py-3">
                <ul className="text-white flex flex-col gap-2">
                      <div className="flex  items-center gap-2"><FaCheckCircle/><li>Accès aux produits disponibles</li></div>
                      <div className="flex  items-center gap-2"><FaCheckCircle/><li>Détails des articles accessibles</li></div>
                      <div className="flex  items-center gap-2"><FaCheckCircle/><li>Pas de promotions exclusives</li></div>
                      <div className="flex  items-center gap-2"><FaCheckCircle/><li>Accès retardé aux nouveautés </li></div>
                      <div className="flex  items-center gap-2"><FaCheckCircle/><li>Fonctionnalités premium absentes </li></div>
                  </ul>
                </div>
                <div className="flex justify-center items-center px-20 py-3">
                  <a href="" className="border px-10 py-3 rounded-md text-white hover:bg-white hover:text-blue-500">S'ABONNER</a>
                </div>
            </div> */}
          <div className="border-none shadow-lg h-full rounded-md bg-gradient-to-r from-orange-400 to-yellow-300">
            <div className="w-full h-40 flex justify-center items-center">
              <ImPriceTags className="w-20 h-20 text-white" />
            </div>
            <div className="flex flex-col justify-center items-center px-10">
              <p className="text-justify text-white">
                L'abonnement gratuit sur ShoppingMada offre un accès basique aux
                produits.
              </p>
              <h3 className="text-3xl font-bold uppercase text-white">pro</h3>
              <h3 className="text-2xl font-semibold text-white my-3">
                30 000 <span className="font-bold">MGA</span> / mois
              </h3>
            </div>

            <div className="flex px-20 py-3">
              <ul className="text-white flex flex-col gap-2">
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Accès aux produits disponibles</li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Détails des articles accessibles</li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Pas de promotions exclusives</li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Accès retardé aux nouveautés </li>
                </div>
                <div className="flex  items-center gap-2">
                  <FaCheckCircle />
                  <li>Fonctionnalités premium absentes </li>
                </div>
              </ul>
            </div>
            <div className="flex justify-center items-center px-20 py-3">
              <a
                href=""
                className="border px-10 py-3 rounded-md text-white hover:bg-white hover:text-orange-400"
              >
                S'ABONNER
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FIN SECTION ABOUT */}
      {/* SECTION CONTACT */}
      <Contact />

      {/* FIN SECTION CONTACT */}
    </>
  );
}

export default Home;
