import { Link } from "react-router-dom";
import { LiaSearchSolid, LiaShoppingCartSolid } from "react-icons/lia";
import { useSidebar } from "../../context/ToggleSidebarContext";
import useScroll from "../../helper/useScroll";
function Navbar() {
  const {toggler} = useSidebar();
  const scroll = useScroll();
  return (
    <header className={`z-50 h-32 w-full  ${scroll ? "fixed  top-0 animate-translate-y" : ""}`}>
      <div className="w-full bg-green-500 h-[4.5rem] ">
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-center items-center gap-7 h-full">
            <div className="flex items-center text-white">
              <Link to="/">ShopInMada</Link>
            </div>
            <div className="h-full w-full">
              <form
                action=""
                method="post"
                className="relative p-0 h-full mt-4 w-full"
              >
                <input
                  type="search"
                  className="w-full rounded-full h-10 relative text-black pl-8"
                  placeholder="Rechercher votre produit"
                />
                <button
                  type="submit"
                  className=" hover:bg-gray-600/45 text-gray-500 h-16 w-16 rounded-full flex items-center justify-center absolute -top-2 right-0 "
                >
                  <LiaSearchSolid size={30} />
                </button>
              </form>
            </div>
            <div>
              <Link to="" className="flex items-center">
                <span className="text-white flex items-center px-3 py-3 text-lg">
                  <LiaShoppingCartSolid />
                  Panier
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-12 flex items-center  bg-green-950">
        <div className="mx-auto flex gap-3 text-white">
          <Link to="#" onClick={toggler}>
            Toutes
          </Link>
          <Link to="">Reconditionné</Link>
          <Link to="">Promo</Link>
          <Link to="">Nouveauté</Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
