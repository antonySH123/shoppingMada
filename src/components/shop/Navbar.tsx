import { FormEvent, useEffect, useState } from "react";
import { LiaSearchSolid, LiaStoreSolid, LiaUser } from "react-icons/lia";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../helper/useAuth";
import { useSidebar } from "../../context/useSidebar";
import CartHeaderLink from "../CartHeaderLink";
import LanguageSelector from "../LanguageSelector";
import { useLanguage } from "../../context/useLanguage";

function Navbar() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen: isMobileCategoryOpen, toggler: toggleMobileCategories } =
    useSidebar();
  const query = searchParams.get("q") ?? "";
  const location = searchParams.get("location");
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => setSearchTerm(query), [query]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchTerm.trim();
    navigate(nextQuery ? `/shop?q=${encodeURIComponent(nextQuery)}` : "/shop");
  };

  const locations = [
    "Antananarivo",
    "Tamatave",
    "Fianarantsoa",
    "Mahajanga",
    "Tuléar",
    "Diego",
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 shadow-[0_4px_18px_rgba(20,40,28,0.05)] backdrop-blur-xl">
      <div className="market-container flex h-[4.5rem] items-center gap-4 sm:gap-6">
        <Link
          to="/"
          aria-label="Accueil ShopInMada"
          className="flex shrink-0 items-center"
        >
          <img
            src="/logo.png"
            alt="ShopInMada"
            className="h-11 w-auto object-contain sm:h-12"
          />
          <span className="ml-1.5 text-xs font-extrabold tracking-tight text-[#173c27] sm:ml-2 sm:text-base">
            ShopInMada
          </span>
        </Link>
        <form
          className="relative mx-auto w-full max-w-2xl"
          onSubmit={handleSearch}
          role="search"
        >
          <LiaSearchSolid
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={19}
          />
          <input
            type="search"
            className="h-11 w-full rounded-full border border-gray-200 bg-[#f6f8f6] pl-11 pr-14 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
            placeholder="Rechercher un produit ou une boutique"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Rechercher dans la boutique"
          />
          <button
            type="submit"
            aria-label="Rechercher"
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-white transition hover:bg-emerald-950"
          >
            <LiaSearchSolid size={18} />
          </button>
        </form>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <LanguageSelector compact />
          <CartHeaderLink />
          <Link
            to={user ? "/profil" : "/login"}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
              <LiaUser size={19} />
            </span>
            <span className="hidden xl:block">
              {user ? t("nav.account") : t("nav.login")}
            </span>
          </Link>
          <Link
            to="/vendeur"
            className="hidden items-center gap-2 rounded-xl border border-emerald-800 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-50 lg:flex"
          >
            <LiaStoreSolid size={18} /> {t("nav.sell")}
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100">
        {query ? (
          <nav
            aria-label="Filtrer par ville"
            className="market-container flex gap-2 overflow-x-auto py-2"
          >
            <Link
              to={`/shop?q=${encodeURIComponent(query)}`}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${!location ? "bg-emerald-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {t("nav.allCities")}
            </Link>
            {locations.map((city) => (
              <Link
                key={city}
                to={`/shop?q=${encodeURIComponent(query)}&location=${encodeURIComponent(city)}`}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${location === city ? "bg-emerald-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {city}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="market-container flex items-center justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-expanded={isMobileCategoryOpen}
                aria-controls="shop-category-sidebar"
                onClick={toggleMobileCategories}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 md:hidden"
              >
                <span aria-hidden="true">☷</span> {t("nav.categories")}
              </button>
              <Link
                to="/shop"
                className="hidden text-xs font-semibold text-gray-600 transition hover:text-emerald-800 md:inline"
              >
                {t("nav.exploreProducts")}
              </Link>
            </div>
            <Link
              to="/vendeur"
              className="hidden text-xs font-semibold text-emerald-800 transition hover:text-emerald-950 md:inline-flex"
            >
              {t("nav.joinSellers")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
