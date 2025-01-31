import React from "react";
import { FaChevronLeft, FaChevronRight, FaHome, FaRegCreditCard, FaShoppingBag, FaShoppingBasket, FaSignOutAlt, FaTachometerAlt, FaUserCog, FaWrench } from "react-icons/fa";
import { Link } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <div className={`bg-green-500 h-full ${isCollapsed ? "w-18" : "w-64"} transition-all duration-300 px-5 overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-center py-5 border-b-[1px] border-white ${isCollapsed && "hidden"}`}>
        <h1 className="text-white text-center">Administrateur</h1>
      </div>

      {/* Navigation Items */}
      <div className="pt-5">
        <div className={`flex items-center gap-4 py-3 ${isCollapsed ? "justify-center" : "justify-normal"}`}>
          <Link to="/espace_vendeur/dash" className="flex items-center gap-4 text-white">
            <FaTachometerAlt />
            {!isCollapsed && <p className="text-[16px]">Tableau de bord</p>}
          </Link>
        </div>
        <div className="pt-5 border-b-[1px] border-white">
          <p className={`text-[14px] font-extrabold leading-[16px] text-white ${isCollapsed && "hidden"}`}>Menu</p>
          <div className={`flex flex-col gap-4 py-5 ${isCollapsed ? "items-center" : "items-start"}`}>
            <Link to="/espace_vendeur/dash" className="flex items-center gap-4 text-white">
              <FaHome />
              {!isCollapsed && <span className="text-[14px] leading-[20px]">Accueil</span>}
            </Link>
            <Link to="/espace_vendeur/products" className="flex items-center gap-4 text-white">
              <FaShoppingBag />
              {!isCollapsed && <span className="text-[14px] leading-[20px]">Produits</span>}
            </Link>
            <Link to="/espace_vendeur/commandes" className="flex items-center gap-4 text-white">
              <FaShoppingBasket />
              {!isCollapsed && <span className="text-[14px] leading-[20px]">Commandes</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="pt-5 border-b-[1px] border-white">
        <p className={`text-[14px] font-extrabold leading-[16px] text-white ${isCollapsed && "hidden"}`}>Paramètres</p>
        <div className={`flex flex-col gap-4 py-5 ${isCollapsed ? "items-center" : "items-start"}`}>
          <Link to="/espace_vendeur/boutiksInfo" className="flex items-center gap-4 text-white">
            <FaUserCog />
            {!isCollapsed && <span className="text-[14px] leading-[20px]">Informations boutique</span>}
          </Link>
          <Link to="/espace_vendeur/abonnements" className="flex items-center gap-4 text-white">
            <FaRegCreditCard />
            {!isCollapsed && <span className="text-[14px] leading-[20px]">Abonnements</span>}
          </Link>
          <Link to="/espace_vendeur/shopaccounts" className="flex items-center gap-4 text-white">
            <FaWrench />
            {!isCollapsed && <span className="text-[14px] leading-[20px]">Gestion de compte</span>}
          </Link>
          <Link to="/logout" className="flex items-center gap-4 text-white">
            <FaSignOutAlt />
            {!isCollapsed && <span className="text-[14px] leading-[20px]">Déconnexion</span>}
          </Link>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex items-center justify-center pt-5">
        <div
          className="h-10 w-10 bg-green-900 rounded-full flex justify-center items-center cursor-pointer"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <FaChevronRight color="white" /> : <FaChevronLeft color="white" />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
