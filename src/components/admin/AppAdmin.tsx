import { useState, useEffect } from "react";
import Sidebar from "./sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import JodiProvider from "../../context/JodiProvider";
import { LiaBarsSolid, LiaMoonSolid, LiaSunSolid } from "react-icons/lia";
import { useLocation } from "react-router-dom";
import "./ui/tokens.css";

function AppAdmin() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [adminTheme, setAdminTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("shopinmada.admin-theme") === "light"
      ? "light"
      : "dark";
  });
  const currentPageLabels: Record<string, string> = {
    dash: "Tableau de bord",
    products: "Produits",
    commandes: "Commandes",
    "marketplace-orders": "Commandes marketplace",
    "paiement-livraison": "Paiement et livraison",
    litiges: "Litiges marketplace",
    commande: "Détail de la commande",
    abonnements: "Abonnements",
    "upgrade-pro": "Passer à ShopInMada Pro",
    abonnementsDetails: "Détail de l’abonnement",
    boutiksInfo: "Informations de la boutique",
    shopaccounts: "Gestion des comptes",
    accountsSettings: "Paramètres du compte",
    addProduct: "Ajouter un produit",
  };
  const pageKey = location.pathname.split("/").filter(Boolean).pop() || "dash";

  const toggleSidebar = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("shopinmada.admin-theme", adminTheme);
  }, [adminTheme]);

  return (
    <div className="admin-shell flex h-screen" data-admin-theme={adminTheme}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <div className="admin-shell-main min-w-0 flex-1 overflow-y-auto">
        <header className="admin-page-header sticky top-0 z-20 flex h-[4.5rem] items-center gap-3 border-b px-4 shadow-sm sm:px-6">
          <button
            aria-label="Afficher/masquer le menu"
            aria-expanded={!isCollapsed}
            className="admin-mobile-menu-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-50"
            onClick={toggleSidebar}
          >
            <LiaBarsSolid size={20} />
          </button>
          <div>
            <p className="admin-brand-label text-xs font-semibold uppercase tracking-[0.14em]">
              ShopInMada
            </p>
            <h1 className="text-sm font-semibold sm:text-base">
              Espace professionnel
            </h1>
          </div>
          <button
            type="button"
            className="admin-theme-toggle"
            aria-label={`Activer le thème ${adminTheme === "dark" ? "clair" : "sombre"}`}
            title={`Thème ${adminTheme === "dark" ? "clair" : "sombre"}`}
            onClick={() =>
              setAdminTheme((theme) => (theme === "dark" ? "light" : "dark"))
            }
          >
            {adminTheme === "dark" ? (
              <LiaSunSolid size={18} />
            ) : (
              <LiaMoonSolid size={18} />
            )}
          </button>
          <span className="admin-mobile-page-badge ml-auto rounded-full px-3 py-1.5 text-xs font-semibold">
            {currentPageLabels[pageKey] || "Espace professionnel"}
          </span>
        </header>
        <div className="admin-content-gutter py-5 sm:py-8">
          <div className="admin-page page-container">
            <JodiProvider>
              <Outlet />
            </JodiProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppAdmin;
