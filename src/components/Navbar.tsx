import { FormEvent, useEffect, useState } from "react";
import {
  LiaBarsSolid,
  LiaSearchSolid,
  LiaSignOutAltSolid,
  LiaTimesSolid,
  LiaUser,
  LiaUserLockSolid,
  LiaUserPlusSolid,
} from "react-icons/lia";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../helper/useAuth";

const menu = [
  { href: "/shop", label: "Découvrir" },
  { href: "/vendeur", label: "Devenir vendeur" },
  { href: "/#about", label: "À propos" },
  { href: "/#abonnements", label: "Offre Pro" },
];

const Navbar = () => {
  const { user } = useAuth();
  const isSeller = user?.userGroupMember_id?.usergroup_id?.name === "Boutiks";
  const visibleMenu = menu.filter(
    (item) => item.href !== "/vendeur" || !isSeller,
  );
  const secondaryMobileMenu = visibleMenu.filter(
    (item) => item.href !== "/shop" && item.href !== "/vendeur",
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const closeMenu = () => setOpen(false);

  useEffect(() => setSearchTerm(searchParams.get("q") ?? ""), [searchParams]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    closeMenu();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  const accountLinks = user ? (
    <>
      <Link
        to="/profil"
        onClick={closeMenu}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        aria-label="Mon profil"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
          <LiaUser size={18} />
        </span>
        <span className="hidden xl:inline">Mon compte</span>
      </Link>
      {user.userGroupMember_id &&
        user.userGroupMember_id.usergroup_id.name !== "Client" && (
          <Link
            to="/espace_vendeur/dash"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            aria-label="Espace vendeur"
          >
            <LiaUserLockSolid size={18} /> Mon espace
          </Link>
        )}
      <Link
        to="/logout"
        onClick={closeMenu}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Se déconnecter"
        title="Se déconnecter"
      >
        <LiaSignOutAltSolid size={20} />
      </Link>
    </>
  ) : (
    <>
      <Link
        to="/login"
        onClick={closeMenu}
        className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
      >
        Connexion
      </Link>
      <Link
        to="/register"
        onClick={closeMenu}
        className="market-button-primary !rounded-xl !px-4 !py-2.5 text-sm"
      >
        <LiaUserPlusSolid size={17} />{" "}
        <span className="hidden xl:inline">Créer un compte</span>
        <span className="xl:hidden">Inscription</span>
      </Link>
    </>
  );

  const mobileSessionActions = user ? (
    <Link
      to="/logout"
      onClick={closeMenu}
      className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700"
    >
      <LiaSignOutAltSolid size={19} /> Déconnexion
    </Link>
  ) : (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        to="/login"
        onClick={closeMenu}
        className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
      >
        Connexion
      </Link>
      <Link
        to="/register"
        onClick={closeMenu}
        className="market-button-primary !rounded-xl !px-4 !py-2.5 text-sm"
      >
        <LiaUserPlusSolid size={17} /> Inscription
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 shadow-[0_4px_18px_rgba(20,40,28,0.05)] backdrop-blur-xl">
      <div className="market-container flex h-[4.5rem] items-center gap-3 sm:gap-5">
        <Link
          to="/"
          aria-label="ShopInMada, accueil"
          className="flex shrink-0 items-center"
        >
          <img
            src="/logo.png"
            alt="ShopInMada"
            className="h-11 w-auto object-contain sm:h-12"
          />
          <span className="ml-2 text-sm font-extrabold tracking-tight text-[#173c27] sm:text-lg">
            ShopInMada
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          role="search"
          className="relative mx-auto hidden w-full max-w-[600px] md:block"
        >
          <LiaSearchSolid
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="search"
            aria-label="Rechercher un produit ou une boutique"
            placeholder="Que recherchez-vous aujourd’hui ?"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 w-full rounded-full border border-gray-200 bg-[#f6f8f6] pl-12 pr-24 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 flex h-9 items-center gap-1.5 rounded-full bg-emerald-800 px-4 text-xs font-bold text-white transition hover:bg-emerald-950"
          >
            Rechercher
          </button>
        </form>

        <div className="ml-auto hidden shrink-0 items-center gap-1 md:flex">
          {accountLinks}
        </div>
        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-50 md:hidden"
        >
          {open ? <LiaTimesSolid size={22} /> : <LiaBarsSolid size={22} />}
        </button>
      </div>

      <div className="market-container hidden items-center justify-between border-t border-gray-100 py-1.5 md:flex">
        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-1"
        >
          {visibleMenu.map((item) => {
            const active =
              item.href === "/shop" && location.pathname.startsWith("/shop");
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition ${active ? "bg-emerald-50 text-emerald-800" : "text-gray-500 hover:bg-gray-50 hover:text-emerald-800"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/#contact"
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-emerald-800"
          >
            Contact
          </Link>
        </nav>
        <span className="text-xs font-medium text-gray-400">
          Des boutiques locales, partout à Madagascar
        </span>
      </div>

      <div className="market-container pb-3 md:hidden">
        <form onSubmit={handleSearch} role="search" className="relative">
          <LiaSearchSolid
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={19}
          />
          <input
            type="search"
            aria-label="Rechercher un produit ou une boutique"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 w-full rounded-full border border-gray-200 bg-[#f6f8f6] pl-11 pr-16 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
          />
          <button
            type="submit"
            aria-label="Lancer la recherche"
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-white"
          >
            <LiaSearchSolid size={18} />
          </button>
        </form>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden">
          <nav
            aria-label="Navigation mobile"
            className="market-container flex flex-col gap-1"
          >
            {[...secondaryMobileMenu, { href: "/#contact", label: "Contact" }].map(
              (item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mt-2 border-t border-gray-100 pt-4">
              {mobileSessionActions}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
