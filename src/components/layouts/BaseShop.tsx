import Navbar from "../shop/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../shop/Sidebar";
import ToggleSidebarContext from "../../context/ToggleSidebarContext";

function BaseShop() {
  return (
    <ToggleSidebarContext>
      <main className="flex flex-col h-full gap-1 overflow-hidden ">
        <Navbar />
        <div className="flex gap-3 w-full  h-[inherit]">
          <Sidebar/>
          <Outlet />
        </div>
      </main>
    </ToggleSidebarContext>
  );
}

export default BaseShop;
