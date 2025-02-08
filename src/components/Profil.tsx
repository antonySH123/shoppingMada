import { LiaAtSolid, LiaUser, LiaUserCircle, LiaUserCogSolid} from "react-icons/lia";
import { Link } from "react-router-dom";
import UserInfo from "./modals/UserInfo";
import { ChangeEvent,useEffect,useRef, useState } from "react";
import { FaHandshake } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "../helper/useAuth";
import Commande from "./commande/Commande";
import useCSRF from "../helper/useCSRF";
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
    e.preventDefault();;
    const response = await fetch(
      import.meta.env.REACT_API_URL + "personnal/store",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userProfil),
      }
    );
    if (!response.ok) {
      console.log("Erreur");
    }
    if (response.status === 201) {
      setIsModalOpen(false);
    }
  };

  useEffect(()=>{
    if(user && !user.personnalInfo_id){
      setIsModalOpen(true);
    }
  },[user])
  return (
    <div className="sticky top-0 left-0 w-full px-20 py-20 flex justify-center items-center bg-cover bg-no-repeat bg-center bg-gray-50">
      <div className="w-full flex rounded-md shadow-2xl px-5 py-24 mt-14 sticky top-24 bg-gray-50">
        <div className="w-80 h-full">
          <div className="px-5 my-20">
            <LiaUserCircle size={150}/>
          </div>
          <div className="px-5 my-5 flex flex-col gap-5">
            <h1 className="flex items-center gap-3">
              <LiaUser size={30} />{" "}
              <span className="w-full">
                {user?.personnalInfo_id.firstName || <Skeleton className="w-full" />}
              </span>
            </h1>
            <h1 className="flex items-center gap-3">
              <LiaAtSolid size={30} />
              <span className="w-full">
                {user?.personnalInfo_id.phoneNumber || <Skeleton className="w-full" />}
              </span>{" "}
            </h1>
            <h1 className="flex items-center gap-3">
              <LiaUserCogSolid size={30} />
              <span className="w-full">
                {(user?.userGroupMember_id.usergroup_id.name as string) || (
                  <>
                    <Skeleton className="w-full" />
                  </>
                )}
              </span>
            </h1>
            {user?.userGroupMember_id.usergroup_id.name == "Client" && (
              <Link
                className="flex items-center gap-3 border border-green-500 py-2 px-4 uppercase bg-green-500 text-white shadow-lg rounded-md"
                to={"/vendeur"}
              >
                <FaHandshake size={30} />
                <span>Devenir vendeur</span>{" "}
              </Link>
            )}
          </div>
        </div>
        <div className="w-[inherit] px-10  scrollbar-hide">
          <div className="mb-5 mt-20 flex flex-col gap-5">
            <h1 className="font-semibold text-3xl">Informations personnels</h1>
            <div className="flex gap-3">
              <h2 className="font-semibold">Nom : </h2>
              <span className="w-52">
                {user?.personnalInfo_id.firstName || <Skeleton className="w-full" />}
              </span>
            </div>
            <div className="flex gap-3">
              <h2 className="font-semibold">Prénom : </h2>
              <a href="" className="w-52">
                {user?.personnalInfo_id.lastName || <Skeleton className="w-full" />}
              </a>
            </div>
            <div className="flex gap-3">
              <h2 className="font-semibold">Adresse : </h2>
              <span className="w-52">
                {user?.personnalInfo_id.adresse || <Skeleton className="w-full" />}
              </span>
            </div>
            <div className="flex gap-3">
              <h2 className="font-semibold">Contact : </h2>
              <span className="w-52">
                {user?.personnalInfo_id.phoneNumber || (
                  <Skeleton className="w-full" />
                )}
              </span>
            </div>
          </div>
          {user?.userGroupMember_id.usergroup_id.name !== "Super Admin" && (
            <div>
              <Commande csrf={csrf as string} />
            </div>
          )}
        </div>
      </div>

      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Informations pérsonnels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          <form action="" method="post" ref={form} onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="rounded w-full border border-green-500 py-3  px-3 mb-3"
                placeholder="Votre nom"
                name="firstName"
                value={userProfil.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="rounded w-full border border-green-500 py-3  px-3 mb-3"
                placeholder="Votre prenom"
                name="lastName"
                value={userProfil.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="rounded w-full border border-green-500 py-3  px-3 mb-3"
                placeholder="Adresse"
                name="adresse"
                value={userProfil.adresse}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>Sexe:</label>&nbsp;&nbsp;&nbsp;
              <input
                type="radio"
                id="male"
                name="gender"
                value="male"
                onChange={handleChange}
              />
              <label htmlFor="male">Homme</label> &nbsp;&nbsp;&nbsp;
              <input
                type="radio"
                id="female"
                name="gender"
                value="female"
                onChange={handleChange}
              />
              <label htmlFor="female">Femme</label>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="rounded w-full border border-green-500 py-3  px-3 mb-3"
                placeholder="numero telephone"
                name="phoneNumber"
                value={userProfil.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end gap-5">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                valider
              </button>
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Fermer
              </button>
            </div>
          </form>
        </div>
      </UserInfo>
    </div>
  );
}

export default Profil;
