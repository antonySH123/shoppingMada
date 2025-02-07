import { useState, useEffect } from "react";
import Sidebar from "./sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import JodiProvider from "../../context/JodiProvider";

function AppAdmin() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`transition-all duration-300 flex-1 bg-gray-50 px-10 py-5 overflow-y-auto`}
      >
        <JodiProvider>
          <Outlet />
        </JodiProvider>
        
      </div>
    </div>
  );
}

export default AppAdmin;
