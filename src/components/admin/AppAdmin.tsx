import { useState, useEffect } from "react";
import Sidebar from "./sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import JodiProvider from "../../context/JodiProvider";
import { LiaBarsSolid } from "react-icons/lia";

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
        className={`transition-all duration-300 flex-1 bg-gray-50  overflow-y-auto`}
      >
        <div className="h-20 bg-green-500 flex items-center">
          <button className="border p-5  cursor-pointer" onClick={toggleSidebar}>
            <LiaBarsSolid/>
          </button>
        </div>
        <div className="px-5 py-3">
          <JodiProvider>
            <Outlet />
          </JodiProvider>
        </div>
      </div>
    </div>
  );
}

export default AppAdmin;
