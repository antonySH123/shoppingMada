import {
  LiaAtSolid,
  LiaUser,
  LiaUserCircle,
  LiaUserCogSolid,
} from "react-icons/lia";
import { Link } from "react-router-dom";
import UserInfo from "./modals/UserInfo";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaHandshake } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "../helper/useAuth";
import Commande from "./commande/Commande";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import Preloader from "./loading/Preloader";
function Profil() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const closeModal = () => setIsModalOpen(false);
  const [userProfil, setUserProfil] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    adresse: "",
    phoneNumber: "",
  });

  const form = useRef(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfil((prevUser) => {
      if (prevUser) {
        return {
          ...prevUser,
          [name]: value,
        };
      }
      return prevUser;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (csrf) {
      const response = await fetch(
        import.meta.env.REACT_API_URL + "personnal/store",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify(userProfil),
        }
      );
      if (!response.ok) {
        console.log("Erreur");
      }
      if (response.status === 201) {
        const result = await response.json();
        toast.success(result.message);
        setIsModalOpen(false);
      }
    }
  };

  useEffect(() => {
    if (user && !user.personnalInfo_id) {
      setIsModalOpen(true);
    }
  }, [user]);
  return !csrf ? (
    <Preloader />
  ) : (
    <div className="sticky top-0 left-0 w-full min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4 md:px-10">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-2xl rounded-lg overflow-hidden  mt-14 sticky top-24">
        {/* Colonne Profil */}
        <div className="w-full md:w-1/3 p-6 flex flex-col items-center bg-gray-100">
          <div className="my-6">
            <LiaUserCircle size={120} />
          </div>
          <div className="flex flex-col gap-4 text-center  w-full">
            <h1 className="flex items-center gap-3 justify-center">
              <LiaUser size={24} />
              <span>{user?.personnalInfo_id?.firstName || <Skeleton />}</span>
            </h1>
            <h1 className="flex items-center gap-3 justify-center">
              <LiaAtSolid size={24} />
              <span>{user?.personnalInfo_id?.phoneNumber || <Skeleton />}</span>
            </h1>
            <h1 className="flex items-center gap-3 justify-center">
              <LiaUserCogSolid size={24} />
              <span>
                {user?.userGroupMember_id.usergroup_id.name || <Skeleton />}
              </span>
            </h1>
            {user?.userGroupMember_id.usergroup_id.name === "Client" && (
              <Link
                to="/vendeur"
                className="flex items-center justify-center gap-2 mt-4 border border-green-500 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                <FaHandshake size={20} />
                Devenir vendeur
              </Link>
            )}
          </div>
        </div>

        {/* Colonne Détails */}
        <div className="w-full md:w-2/3 p-6">
          <h1 className="text-2xl font-bold mb-6">Informations personnelles</h1>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <span className="font-semibold">Nom :</span>
              <span>{user?.personnalInfo_id?.firstName || <Skeleton />}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Prénom :</span>
              <span>{user?.personnalInfo_id?.lastName || <Skeleton />}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Adresse :</span>
              <span>{user?.personnalInfo_id?.adresse || <Skeleton />}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">Contact :</span>
              <span>{user?.personnalInfo_id?.phoneNumber || <Skeleton />}</span>
            </div>
          </div>

          {user?.userGroupMember_id.usergroup_id.name !== "Super Admin" && (
            <div className="mt-10">
              <Commande csrf={csrf as string} />
            </div>
          )}
        </div>
      </div>

      {/* Modale */}
      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
        <form ref={form} onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="Votre nom"
            value={userProfil.firstName}
            onChange={handleChange}
            className="w-full border border-green-500 rounded px-4 py-2"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Votre prénom"
            value={userProfil.lastName}
            onChange={handleChange}
            className="w-full border border-green-500 rounded px-4 py-2"
          />
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={userProfil.adresse}
            onChange={handleChange}
            className="w-full border border-green-500 rounded px-4 py-2"
          />
          <div>
            <label className="mr-4">Sexe :</label>
            <input
              type="radio"
              id="male"
              name="gender"
              value="male"
              onChange={handleChange}
            />
            <label htmlFor="male" className="mr-4 ml-1">
              Homme
            </label>
            <input
              type="radio"
              id="female"
              name="gender"
              value="female"
              onChange={handleChange}
            />
            <label htmlFor="female" className="ml-1">
              Femme
            </label>
          </div>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Numéro téléphone"
            value={userProfil.phoneNumber}
            onChange={handleChange}
            className="w-full border border-green-500 rounded px-4 py-2"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Valider
            </button>
            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Fermer
            </button>
          </div>
        </form>
      </UserInfo>
    </div>
  );
}

export default Profil;
