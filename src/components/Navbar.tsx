import React, { useEffect, useState } from "react";
import {
  LiaBarsSolid,
  LiaSignOutAltSolid,
  LiaTimesSolid,
  LiaUser,
  LiaUserLockSolid,
  LiaUserPlusSolid,
} from "react-icons/lia";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../helper/useAuth";
import useScroll from "../helper/useScroll";

const Navbar = () => {
  const { user } = useAuth();
  const [auth, setAuth] = useState(false);
  const scroll = useScroll();
  const location = useLocation();
  const segment = location.pathname.slice(1).split("/");
  useEffect(() => {
    if (user) {
      setAuth(true);
    }
  }, [user]);
  const [open, setOpen] = useState(false);
  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className={`w-full ${(segment && segment[0].toLowerCase() === "product" || segment[0].toLowerCase() ==="profil" ) && "bg-green-500"} ${scroll ?"bg-green-500 animate-translate-y shadow shadow-gray-500":""} font-semibold fixed top-0 left-0 z-30 transition-all ease-in duration-300`}>
      <div className="mx-auto px-4 sm:px-6 lg-px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center text-white">
            <Link to="/">ShopInMada</Link>
          </div>
          {/* menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-white">
                Accueil
              </Link>
              <Link to="/#about" className="text-white">
                A propos
              </Link>
              <Link to="/#product" className="text-white">
                Shop
              </Link>
              <Link to="/#abonnements" className="text-white">
                Abonnements
              </Link>
              <Link to="/#contact" className="text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <>
              {auth ? (
                <React.Fragment>
                  <Link to="/profil" className="text-white flex items-center">
                    <span className="flex px-3 py-3 items-center justify-center bg-white rounded-full text-gray-500">
                      <LiaUser />
                    </span>
                  </Link>
                  {user?.userGroupMember_id && user?.userGroupMember_id.usergroup_id.name !== "Client" && (
                    <Link
                      to="/espace_vendeur/dash"
                      className="text-white flex items-center"
                    >
                      <span className="flex px-3 py-3 items-center justify-center border rounded-full">
                        <LiaUserLockSolid />
                      </span>
                    </Link>
                  )}
                  <Link to="/logout" className="text-white flex items-center">
                    <span className="flex px-3 py-3 items-center justify-center border rounded-full">
                      <LiaSignOutAltSolid />
                    </span>
                  </Link>
                </React.Fragment>
              ) : (
                <>
                  <Link to="/login" className="text-white flex items-center">
                    <span className="flex px-3 py-3 items-center justify-center bg-white rounded-full text-gray-500">
                      <LiaUser />
                    </span>
                  </Link>
                  <Link to="/register" className="text-white flex items-center">
                    <span className="flex px-3 py-3 items-center justify-center border rounded-full">
                      <LiaUserPlusSolid />
                    </span>
                  </Link>
                </>
              )}
            </>
          </div>
          <div className="mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-500 focus:ring-white"
            >
              <span className="sr-only"></span>
              {open == true ? <LiaTimesSolid /> : <LiaBarsSolid />}
            </button>
          </div>
        </div>
      </div>
      {open ? (
        <div className="md:hidden">
          <div className="ox-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white hover:bg-white block px-3 py-2 rounded-md"
            >
              Accueil
            </Link>
            <Link
              to="/#about"
              className="text-white hover:bg-white block px-3 py-2 rounded-md"
            >
              A propos
            </Link>
            <Link
              to="/#product"
              className="text-white hover:bg-white block px-3 py-2 rounded-md"
            >
              Shop
            </Link>
            <Link
              to="/"
              className="text-white hover:bg-white block px-3 py-2 rounded-md"
            >
              Abonnements
            </Link>
            <Link
              to="/contact"
              className="text-white hover:bg-white block px-3 py-2 rounded-md"
            >
              Contact
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Navbar;
