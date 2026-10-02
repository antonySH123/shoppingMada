import React, { useEffect, useRef } from "react";
import {
  FaHome,
  FaRegCreditCard,
  FaShoppingBag,
  FaShoppingBasket,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserCog,
  FaWrench,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../helper/useAuth";
import { LiaTimesSolid, LiaUser } from "react-icons/lia";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar : ()=> void
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const navClass = (path: string) => `admin-nav-link ${location.pathname === path ? "admin-nav-link-active" : ""}`;

  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    if (window.innerWidth < 768) toggleSidebar();
  }, [location.pathname, toggleSidebar]);

  return (
    <>
    {!isCollapsed && <button type="button" aria-label="Fermer le menu" onClick={toggleSidebar} className="fixed inset-0 z-30 bg-gray-950/40 md:hidden" />}
    <div
      className={`admin-sidebar fixed inset-y-0 left-0 z-40 h-screen w-72 overflow-x-hidden overflow-y-auto bg-[#10271b] px-5 transition-transform duration-300 md:relative md:z-auto md:h-full md:w-64 md:translate-x-0 ${isCollapsed ? "-translate-x-full md:hidden" : "translate-x-0"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b border-white/15 py-5 ${
          isCollapsed && "hidden"
        }`}
      >
        <h1 className="w-full text-white">
          <span className="flex items-center gap-2 text-left font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><LiaUser /></span> <>{user && user.username}</>
          </span>
          <span className="mt-3 flex w-full items-center justify-between gap-2 text-white/65">
            <strong className="text-xs font-medium">
              {user?.boutiks_id && user?.boutiks_id.plan}
            </strong>
            {user?.boutiks_id && user?.boutiks_id.subscription_id && (
              <strong className="text-right text-[10px] font-medium">
                Expire le {" "}
                {new Date(
                  user.boutiks_id.subscription_id.endDate
                ).toLocaleDateString("fr-FR")}
              </strong>
            )}
          </span>
        </h1>
        <button onClick={toggleSidebar} aria-label="Fermer le menu" className="block rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden">
          <LiaTimesSolid  size={20} />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="pt-5">
        <div
          className={`flex items-center gap-4 py-3 ${
            isCollapsed ? "justify-center" : "justify-normal"
          }`}
        ></div>
        <div className="border-b border-white/15 pb-3">
          <p
            className={`text-[14px] font-extrabold leading-[16px] text-white ${
              isCollapsed && "hidden"
            }`}
          >
            Menu
          </p>
          <div
            className={`flex flex-col gap-4 py-5 ${
              isCollapsed ? "items-center" : "items-start"
            }`}
          >
            <Link
              to="/espace_vendeur/dash"
              className={navClass("/espace_vendeur/dash")}
            >
              <FaTachometerAlt />
              {!isCollapsed && (
                <span className="text-[14px] leading-[20px]">
                  Tableau de bord
                </span>
              )}
            </Link>
            {user &&
              user?.userGroupMember_id.usergroup_id.name === "Boutiks" && (
                <>
                  <Link
                    to="/espace_vendeur/products"
                    className={navClass("/espace_vendeur/products")}
                  >
                    <FaShoppingBag />
                    {!isCollapsed && (
                      <span className="text-[14px] leading-[20px]">
                        Produits
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/espace_vendeur/commandes"
                    className={navClass("/espace_vendeur/commandes")}
                  >
                    <FaShoppingBasket />
                    {!isCollapsed && (
                      <span className="text-[14px] leading-[20px]">
                        Commandes
                      </span>
                    )}
                  </Link>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Section paramètres */}
      <div className="border-b border-white/15 pt-5 pb-3">
        <p
          className={`text-[14px] font-extrabold leading-[16px] text-white ${
            isCollapsed && "hidden"
          }`}
        >
          ParamÃ¨tres
        </p>
        <div
          className={`flex flex-col gap-4 py-5 ${
            isCollapsed ? "items-center" : "items-start"
          }`}
        >
          {user && user?.userGroupMember_id.usergroup_id.name === "Boutiks" && (
            <Link
              to="/espace_vendeur/boutiksInfo"
              className={navClass("/espace_vendeur/boutiksInfo")}
            >
              <FaUserCog />
              {!isCollapsed && (
                <span className="text-[14px] leading-[20px]">
                  Informations boutique
                </span>
              )}
            </Link>
          )}
          <Link
            to="/espace_vendeur/abonnements"
            className={navClass("/espace_vendeur/abonnements")}
          >
            <FaRegCreditCard />
            {!isCollapsed && (
              <span className="text-[14px] leading-[20px]">Abonnements</span>
            )}
          </Link>
          {user?.userGroupMember_id.usergroup_id.name === "Super Admin" && (
            <>
              <Link
                to="/espace_vendeur/shopaccounts"
                className={navClass("/espace_vendeur/shopaccounts")}
              >
                <FaWrench />
                {!isCollapsed && (
                  <span className="text-[14px] leading-[20px]">
                    Gestion de compte
                  </span>
                )}
              </Link>
            </>
          )}
          <Link to="/" className={navClass("/")}>
            <FaHome />
            {!isCollapsed && (
              <span className="text-[14px] leading-[20px]">Accueil</span>
            )}
          </Link>
          <Link to="/logout" className="admin-nav-link">
            <FaSignOutAlt />
            {!isCollapsed && (
              <span className="text-[14px] leading-[20px]">DÃ©connexion</span>
            )}
          </Link>
        </div>
      </div>

      {/* Toggle Button */}

      {user?.boutiks_id && !user?.boutiks_id.subscription_id && (
        <Link to="/espace_vendeur/upgrade-pro" className="mt-5 flex w-full items-center justify-center rounded-xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500/20 to-cyan-400/10 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:border-emerald-200/40 hover:from-emerald-500/30">
          Découvrir ShopInMada Pro
        </Link>
      )}
    </div>
    </>
  );
};

export default Sidebar;
