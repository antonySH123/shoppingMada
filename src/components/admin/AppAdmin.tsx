import { useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function AppAdmin() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Contenu principal */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-0" : "ml-0"
        } flex-1 bg-gray-50 px-10 py-5 overflow-y-auto`}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default AppAdmin;
