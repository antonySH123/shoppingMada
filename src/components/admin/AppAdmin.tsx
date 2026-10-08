import { useState, useEffect } from "react";
import Sidebar from "./sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import JodiProvider from "../../context/JodiProvider";
import { LiaBarsSolid, LiaMoonSolid, LiaSunSolid } from "react-icons/lia";
import { useLocation } from "react-router-dom";
import "./ui/tokens.css";
import { useLanguage } from "../../context/useLanguage";
import { useAuth } from "../../helper/useAuth";
import useCSRF from "../../helper/useCSRF";
import { toast } from "react-toastify";
import LanguageSelector from "../LanguageSelector";

function AppAdmin() {
  const { t } = useLanguage();
  const { user, setUserInfo } = useAuth();
  const csrf = useCSRF();
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
    dash: t("admin.dashboard"),
    products: t("admin.products"),
    commandes: t("admin.orders"),
    "marketplace-orders": t("admin.marketOrders"),
    "paiement-livraison": t("admin.deliveryPayment"),
    litiges: t("admin.disputes"),
    commande: t("admin.orders"),
    abonnements: t("admin.subscriptions"),
    "abonnements-paiement": t("admin.subscriptionPayments"),
    "upgrade-pro": t("admin.upgrade"),
    abonnementsDetails: t("admin.subscriptions"),
    boutiksInfo: t("admin.shopInfo"),
    shopaccounts: t("admin.accounts"),
    accountsSettings: t("admin.accountSettings"),
    addProduct: t("admin.addProduct"),
    "verification-vendeurs": t("admin.sellerVerification"),
    support: t("admin.support"),
    "journal-activite": t("admin.activityLog"),
    "categories-admin": t("admin.categories"),
    finances: t("admin.finance"),
    forfaits: t("admin.plansPermissions"),
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
        {(user as any)?.impersonation?.active && <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950"><span>{t("admin.impersonationActive")}</span><button className="rounded-lg bg-slate-950 px-3 py-1 text-white" onClick={async()=>{try{const r=await fetch(`${import.meta.env.REACT_API_URL}auth/impersonation`,{method:"DELETE",credentials:"include",headers:{"xsrf-token":csrf??""}});const j=await r.json();if(!r.ok)throw new Error(j.message);const me=await fetch(`${import.meta.env.REACT_API_URL}auth/me`,{credentials:"include"});const profile=await me.json();setUserInfo(profile.userInfo);toast.success(t("admin.impersonationStopped"));}catch(e){toast.error(e instanceof Error?e.message:t("admin.impersonationStopError"));}}}>{t("admin.stopImpersonation")}</button></div>}
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
              {t("admin.professionalSpace")}
            </h1>
          </div>
          <button
            type="button"
            className="admin-theme-toggle"
            aria-label={`Switch to ${adminTheme === "dark" ? t("admin.themeLight") : t("admin.themeDark")} theme`}
            title={`${adminTheme === "dark" ? t("admin.themeLight") : t("admin.themeDark")} theme`}
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
          <LanguageSelector compact className="admin-language-selector" />
          <span className="admin-mobile-page-badge ml-auto rounded-full px-3 py-1.5 text-xs font-semibold">
            {currentPageLabels[pageKey] || t("admin.professionalSpace")}
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
