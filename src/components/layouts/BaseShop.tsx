import Navbar from "../shop/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../shop/Sidebar";
import ToggleSidebarContext from "../../context/ToggleSidebarContext";
import MobileCustomerNav from "../MobileCustomerNav";

function BaseShop() {
  return (
    <div className="customer-app">
      <ToggleSidebarContext>
        <main className="flex h-screen min-h-0 flex-col gap-1 overflow-hidden bg-[var(--background)] text-[var(--foreground)] [height:100dvh]">
          <Navbar />
          <div className="flex min-h-0 w-full flex-1 gap-3">
            <Sidebar />
            <Outlet />
          </div>
        </main>
      </ToggleSidebarContext>
      <MobileCustomerNav />
    </div>
  );
}

export default BaseShop;
