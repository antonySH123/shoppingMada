import Navbar from "../shop/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../shop/Sidebar";
import ToggleSidebarContext from "../../context/ToggleSidebarContext";

function BaseShop() {
  return (
    <ToggleSidebarContext>
      <main className="flex min-h-screen flex-col gap-1 overflow-hidden bg-[#f8faf8]">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-1 gap-3">
          <Sidebar/>
          <Outlet />
        </div>
      </main>
    </ToggleSidebarContext>
  );
}

export default BaseShop;
