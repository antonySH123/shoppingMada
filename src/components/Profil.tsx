import { LiaAtSolid, LiaUserCircle, LiaUserCogSolid } from "react-icons/lia";
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
  const { user, setUserInfo } = useAuth();
  const csrf = useCSRF();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
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
    if (!csrf || isSaving) return;

    setIsSaving(true);
    try {
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
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Impossible de mettre à jour le profil.");
        return;
      }

      if (!result.userInfo) {
        toast.error(
          "Le profil a été enregistré, mais les informations actualisées sont indisponibles.",
        );
        return;
      }

      setUserInfo(result.userInfo);
      toast.success(result.message);
      setIsModalOpen(false);
    } catch {
      toast.error(
        "Une erreur est survenue lors de l’enregistrement du profil.",
      );
    } finally {
      setIsSaving(false);
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
    <div className="profile-page-root w-full py-8 md:py-12">
      <div className="profile-card page-container mt-2 flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(24,53,36,0.09)] md:mt-0 md:flex-row">
        {/* Colonne Profil */}
        <div className="profile-summary flex w-full flex-col items-center p-6 md:w-1/3 md:p-8">
          <div className="profile-avatar my-6">
            <LiaUserCircle size={94} />
          </div>
          <div className="flex flex-col gap-4 text-center  w-full">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {user?.personnalInfo_id?.firstName || <Skeleton />}
            </h1>
            <p className="-mt-3 text-sm text-gray-500">{user?.email}</p>
            <div className="profile-role-badge mx-auto flex items-center gap-2">
              <LiaUserCogSolid size={17} />
              <span>
                {user?.userGroupMember_id.usergroup_id.name || <Skeleton />}
              </span>
            </div>
            {user?.personnalInfo_id?.phoneNumber && (
              <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <LiaAtSolid size={17} />
                {user.personnalInfo_id.phoneNumber}
              </p>
            )}
            {user?.userGroupMember_id.usergroup_id.name === "Client" && (
              <Link to="/vendeur" className="market-button-primary mt-2 w-full">
                <FaHandshake size={20} />
                Devenir vendeur
              </Link>
            )}
          </div>
        </div>

        {/* Colonne Détails */}
        <div className="w-full p-6 md:w-2/3 md:p-9">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Mon espace
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Informations personnelles
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Vos coordonn�es et votre activit� sur ShopInMada.
            </p>
          </div>
          <div className="profile-information-grid grid gap-3 sm:grid-cols-2">
            <div className="profile-information-item">
              <span className="font-semibold">Nom :</span>
              <span>{user?.personnalInfo_id?.firstName || <Skeleton />}</span>
            </div>
            <div className="profile-information-item">
              <span className="font-semibold">Prénom :</span>
              <span>{user?.personnalInfo_id?.lastName || <Skeleton />}</span>
            </div>
            <div className="profile-information-item">
              <span className="font-semibold">Adresse :</span>
              <span>{user?.personnalInfo_id?.adresse || <Skeleton />}</span>
            </div>
            <div className="profile-information-item">
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
        <div className="personal-info-modal">
          <header className="personal-info-modal-heading">
            <span className="personal-info-modal-icon">
              <LiaUserCircle size={25} />
            </span>
            <div>
              <p className="personal-info-modal-eyebrow">Mon profil</p>
              <h2>Informations personnelles</h2>
              <p>Quelques détails pour compléter votre espace ShopInMada.</p>
            </div>
          </header>
          <form
            ref={form}
            onSubmit={handleSubmit}
            className="personal-info-form"
          >
            <div className="personal-info-fields">
              <label className="personal-info-field">
                Nom
                <input
                  type="text"
                  name="firstName"
                  placeholder="Votre nom"
                  value={userProfil.firstName}
                  onChange={handleChange}
                />
              </label>
              <label className="personal-info-field">
                Prénom
                <input
                  type="text"
                  name="lastName"
                  placeholder="Votre prénom"
                  value={userProfil.lastName}
                  onChange={handleChange}
                />
              </label>
              <label className="personal-info-field personal-info-field-wide">
                Adresse
                <input
                  type="text"
                  name="adresse"
                  placeholder="Votre adresse"
                  value={userProfil.adresse}
                  onChange={handleChange}
                />
              </label>
              <fieldset className="personal-info-gender">
                <legend>Sexe</legend>
                <label className="personal-info-gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={userProfil.gender === "male"}
                    onChange={handleChange}
                  />
                  Homme
                </label>
                <label className="personal-info-gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={userProfil.gender === "female"}
                    onChange={handleChange}
                  />
                  Femme
                </label>
              </fieldset>
              <label className="personal-info-field personal-info-field-wide">
                Numéro de téléphone
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Ex. 034 00 000 00"
                  value={userProfil.phoneNumber}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div className="personal-info-actions">
              <button
                type="submit"
                className="market-button-primary"
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="market-button-secondary"
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
