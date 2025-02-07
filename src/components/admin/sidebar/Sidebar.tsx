import React, { useState } from "react";
import number from "./../../../data/number.json";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCrown,
  FaHome,
  FaRegCreditCard,
  FaShoppingBag,
  FaShoppingBasket,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserCog,
  FaWrench,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../../helper/useAuth";
import { LiaCheckSolid, LiaUser } from "react-icons/lia";
import UserInfo from "../../modals/UserInfo";
import useFormatter from "../../../helper/useFormatter";
import useCSRF from "../../../helper/useCSRF";
import { toast } from "react-toastify";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const closeModal = () => setIsModalOpen(false);
  const { priceInArriary } = useFormatter();
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [transactionPhoneNumber, setTransactionPhoneNumber] =
    useState<string>();
  const [reference, setReference] = useState<string>("");
  const handleSelect = (num: string) => {
    setSelectedNumber(num);
  };
  const csrf = useCSRF();

  const handleValidate = async () => {
    const data = {
      transactionPhoneNumber: transactionPhoneNumber,
      selectedPhoneNumber: selectedNumber,
      refTransaction: reference,
    };

    if (csrf) {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (response.status === 201) {
          toast.success(result.message);
        } else {
          toast.warning(result.message);
        }
      }
    }
    setIsModalOpen(false);
    setSelectedNumber(null);
    setTransactionPhoneNumber("");
    setReference("");
  };
  return (
    <div
      className={`bg-green-500 h-full ${
        isCollapsed ? "w-18" : "w-64"
      } transition-all duration-300 px-5 overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between py-5 border-b-[1px] border-white ${
          isCollapsed && "hidden"
        }`}
      >
        <h1 className="text-white text-center w-full">
          <span className="flex items-center gap-2">
            <LiaUser /> <>{user && user.username}</>
          </span>
          <span className="flex justify-between items-center w-full">
          <strong>{user?.boutiks_id && user?.boutiks_id.plan}</strong>
          {user?.boutiks_id && user?.boutiks_id.subscription_id && (
            <strong className="text-sm">
              Expiration:{" "}
              {new Date(
                user.boutiks_id.subscription_id.endDate
              ).toLocaleDateString("fr-FR")}
            </strong>
          )}
          </span>
        </h1>
        {user?.boutiks_id && !user?.boutiks_id.subscription_id && (
          <button onClick={() => setIsModalOpen(true)}>
            <FaCrown color="gold" size={20} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="pt-5">
        <div
          className={`flex items-center gap-4 py-3 ${
            isCollapsed ? "justify-center" : "justify-normal"
          }`}
        ></div>
        <div className=" border-b-[1px] border-white">
          <p
            className={`text-[14px] font-extrabold leading-[16px] text-white ${
              isCollapsed && "hidden"
            }`}
          >
            Menu
          </p>
          <div
            className={`flex flex-col gap-4 py-5 ${
              isCollapsed ? "items-center" : "items-start"
            }`}
          >
            <Link
              to="/espace_vendeur/dash"
              className="flex items-center gap-4 text-white"
            >
              <FaTachometerAlt />
              {!isCollapsed && (
                <span className="text-[14px] leading-[20px]">
                  Tableau de bord
                </span>
              )}
            </Link>
            {user &&
              user?.userGroupMember_id.usergroup_id.name === "Boutiks" && (
                <>
                  <Link
                    to="/espace_vendeur/products"
                    className="flex items-center gap-4 text-white"
                  >
                    <FaShoppingBag />
                    {!isCollapsed && (
                      <span className="text-[14px] leading-[20px]">
                        Produits
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/espace_vendeur/commandes"
                    className="flex items-center gap-4 text-white"
                  >
                    <FaShoppingBasket />
                    {!isCollapsed && (
                      <span className="text-[14px] leading-[20px]">
                        Commandes
                      </span>
                    )}
                  </Link>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="pt-5 border-b-[1px] border-white">
        <p
          className={`text-[14px] font-extrabold leading-[16px] text-white ${
            isCollapsed && "hidden"
          }`}
        >
          Paramètres
        </p>
        <div
          className={`flex flex-col gap-4 py-5 ${
            isCollapsed ? "items-center" : "items-start"
          }`}
        >
          {user && user?.userGroupMember_id.usergroup_id.name === "Boutiks" && (
            <Link
              to="/espace_vendeur/boutiksInfo"
              className="flex items-center gap-4 text-white"
            >
              <FaUserCog />
              {!isCollapsed && (
                <span className="text-[14px] leading-[20px]">
                  Informations boutique
                </span>
              )}
            </Link>
          )}
          <Link
            to="/espace_vendeur/abonnements"
            className="flex items-center gap-4 text-white"
          >
            <FaRegCreditCard />
            {!isCollapsed && (
              <span className="text-[14px] leading-[20px]">Abonnements</span>
            )}
          </Link>
          {user?.userGroupMember_id.usergroup_id.name === "Super Admin" && (
            <>
              <Link
                to="/espace_vendeur/shopaccounts"
                className="flex items-center gap-4 text-white"
              >
                <FaWrench />
                {!isCollapsed && (
                  <span className="text-[14px] leading-[20px]">
                    Gestion de compte
                  </span>
                )}
              </Link>
            </>
          )}
          <Link to="/" className="flex items-center gap-4 text-white">
            <FaHome />
            {!isCollapsed && (
              <span className="text-[14px] leading-[20px]">Accueil</span>
            )}
          </Link>
          <Link to="/logout" className="flex items-center gap-4 text-white">
            <FaSignOutAlt />
            {!isCollapsed && (
              <span className="text-[14px] leading-[20px]">Déconnexion</span>
            )}
          </Link>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex items-center justify-center pt-5">
        <div
          className="h-10 w-10 bg-green-900 rounded-full flex justify-center items-center cursor-pointer"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <FaChevronRight color="white" />
          ) : (
            <FaChevronLeft color="white" />
          )}
        </div>
      </div>

      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">
          Devenir une des nos vendeur Premium
        </h2>
        <div>
          <ul className="mb-3">
            <li className="flex items-center gap-3">
              <LiaCheckSolid color="green" size={20} />{" "}
              <span>Lorem ipsum dolor sit amet.</span>
            </li>
            <li className="flex items-center gap-3">
              <LiaCheckSolid color="green" size={20} />{" "}
              <span>Lorem ipsum dolor sit amet.</span>
            </li>
            <li className="flex items-center gap-3">
              <LiaCheckSolid color="green" size={20} />{" "}
              <span>Lorem ipsum dolor sit amet.</span>
            </li>
            <li className="flex items-center gap-3">
              <LiaCheckSolid color="green" size={20} />{" "}
              <span>Lorem ipsum dolor sit amet.</span>
            </li>
          </ul>

          <div className="px-2 py-2 rounded w-full  border-green-500 border-2">
            <h2>Mensuel</h2>
            <strong>{priceInArriary(50000)}</strong>
          </div>
          <hr className="my-2" />
          <div>
            <h3 className="m-2">
              Veuillez choisir l'un des operateur que vous allez envoyer votre
              payement
            </h3>
            {number.map((element, index) => (
              <div
                onClick={() => handleSelect(element.phonenumber)}
                className={`px-2 py-2 rounded w-full mb-2 border-2 ${
                  selectedNumber === element.phonenumber && "border-green-500"
                }`}
                key={index + 1}
              >
                <h2>{element.name}</h2>
                <strong>{element.phonenumber}</strong>
              </div>
            ))}
          </div>
          <hr />
          <div>
            <h3 className="m-2">
              Veuillez entrer si aprés le numéro que vous avez utilisé pour
              transfert l'argent
            </h3>
            <input
              type="text"
              className="px-2 py-2 rounded w-full mb-2 border-2"
              placeholder="votre numéro"
              value={transactionPhoneNumber}
              onChange={(e) => setTransactionPhoneNumber(e.target.value)}
            />

            <input
              type="text"
              className="px-2 py-2 rounded w-full mb-2 border-2"
              placeholder="Reference du paiements"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <button
            className="w-full text-center px-2 py-2 bg-green-500 rounded text-white"
            onClick={handleValidate}
          >
            Valider
          </button>
        </div>
      </UserInfo>
    </div>
  );
};

export default Sidebar;
