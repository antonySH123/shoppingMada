import React from "react";
import { FaChevronLeft, FaChevronRight, FaHome, FaRegSun, FaShoppingBag, FaTachometerAlt, FaWrench } from "react-icons/fa";
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
        <div className={`flex items-center gap-4 py-3 ${isCollapsed ? "justify-center":"justify-normal"}`}>
          <FaTachometerAlt color="white" />
          {!isCollapsed && <p className="text-white text-[16px]">Tableau de bord</p>}
        </div>
        <div className="pt-5 border-b-[1px] border-white">
          <p className={`text-[14px] font-extrabold leading-[16px] text-white ${isCollapsed && "hidden"}`}>Menu</p>
          <div className="flex flex-col gap-4 py-5">
            <div className={`flex items-center gap-4 ${isCollapsed ? "justify-center":"justify-normal"}`} >
              <FaHome color="white" />
              {!isCollapsed && (
                <Link to="/espace_vendeur/dash" className="text-[14px] leading-[20px] text-white">
                  Accueil
                </Link>
              )}
            </div>
            <div className={`flex items-center gap-4 ${isCollapsed ? "justify-center":"justify-normal"}`}>
              <FaShoppingBag color="white" />
              {!isCollapsed && (
                <Link to="/espace_vendeur/products" className="text-[14px] leading-[20px] text-white">
                  Produits
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="pt-5 border-b-[1px] border-white">
        <p className={`text-[14px] font-extrabold leading-[16px] text-white ${isCollapsed && "hidden"}`}>Paramètres</p>
        <div className="flex flex-col gap-4 py-5">
          <div className={`flex items-center gap-4 ${isCollapsed ? "justify-center":"justify-normal"}`}>
            <FaRegSun color="white" />
            {!isCollapsed && <p className="text-[14px] leading-[20px] text-white">Utilisateurs</p>}
          </div>
          <div className={`flex items-center gap-4 ${isCollapsed ? "justify-center":"justify-normal"}`}>
            <FaWrench color="white" />
            {!isCollapsed && (
              <Link to="/logout" className="text-[14px] leading-[20px] text-white">
                Déconnexion
              </Link>
            )}
          </div>
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
