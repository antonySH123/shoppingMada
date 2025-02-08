import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LiaSearchSolid, LiaShoppingCartSolid } from "react-icons/lia";
import useScroll from "../../helper/useScroll";
import { FormEvent, useState } from "react";
function Navbar() {
  const scroll = useScroll();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q");
  const location = searchParams.get("location")
  const [searchTerm, setSearchTerm] = useState<string | null>();
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(searchTerm as string)}`);
  };
  return (
    <header
      className={`z-50 h-fit w-full  ${
        scroll ? "fixed  top-0 animate-translate-y" : ""
      }`}
    >
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
                onSubmit={handleSearch}
              >
                <input
                  type="text"
                  className="w-full rounded-full h-10 relative text-black pl-8"
                  placeholder="Rechercher votre produit"
                  value={searchTerm as string}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className=" hover:bg-gray-600/45 hover:text-white text-gray-500  h-10 w-10 rounded-full flex items-center justify-center absolute top-0 right-0 "
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
      {query && (
        <div className="w-full h-12 flex items-center  bg-green-950">
          <div className="mx-auto flex gap-3 text-white">
          <Link to={`/shop?q=${query}`} className={`${!location ? "bg-green-500  rounded":"" } px-3 py-2`}>
              Tout
            </Link>
            <Link to={`/shop?q=${query}&location=Antananarivo`} className={`${location === "Antananarivo" && "bg-green-500  rounded" } px-3 py-2`}>
              Antananarivo
            </Link>
            <Link to={`/shop?q=${query}&location=Tamatave`} className={`${location === "Tamatave" && "bg-green-500  rounded"} px-3 py-2`}>Tamatave</Link>
            <Link to={`/shop?q=${query}&location=Fianarantsoa`} className={`${location === "Fianarantsoa" && "bg-green-500  rounded"} px-3 py-2`}>Fianarantsoa</Link>
            <Link to={`/shop?q=${query}&location=Mahajanga` } className={`${location === "Mahajanga" && "bg-green-500  rounded"} px-3 py-2`}>Mahajanga</Link>
            <Link to={`/shop?q=${query}&location=Tuléar`} className={`${location === "Tuléar" && "bg-green-500  rounded"} px-3 py-2`}>Tuléar</Link>
            <Link to={`/shop?q=${query}&location=Diego`} className={`${location === "Diego" && "bg-green-500  rounded"} px-3 py-2`}>Diego</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
