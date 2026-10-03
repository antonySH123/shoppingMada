import { LiaAtSolid, LiaEditSolid, LiaUserCircle, LiaUserCogSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import UserInfo from "./modals/UserInfo";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaHandshake } from "react-icons/fa";
import { useAuth } from "../helper/useAuth";
import Commande from "./commande/Commande";
import MarketplaceOrderHistory from "./commande/MarketplaceOrderHistory";
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
  const profileInfo = user?.personnalInfo_id;
  const roleName = user?.userGroupMember_id?.usergroup_id?.name ?? "Compte";
  const displayName =
    [profileInfo?.firstName, profileInfo?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Votre profil";
  const completedProfileFields = [
    profileInfo?.firstName,
    profileInfo?.lastName,
    profileInfo?.phoneNumber || user?.phonenumber,
    profileInfo?.adresse,
  ].filter(Boolean).length;

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
    if (!user) return;
    const info = user.personnalInfo_id;
    setUserProfil({
      firstName: info?.firstName ?? "",
      lastName: info?.lastName ?? "",
      gender: info?.gender ?? "",
      adresse: info?.adresse ?? "",
      phoneNumber: info?.phoneNumber ?? user.phonenumber ?? "",
    });
    if (!info) setIsModalOpen(true);
  }, [user]);
  return !csrf ? (
    <Preloader />
  ) : (
    <main className="profile-page-root w-full py-7 sm:py-10">
      <div className="profile-layout page-container">
        <header className="profile-page-heading">
          <div>
            <p className="profile-eyebrow">ShopInMada · Mon compte</p>
            <h1>Profil et coordonnées</h1>
            <p>Gérez votre identité et retrouvez votre activité sur la marketplace.</p>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="profile-edit-button">
            <LiaEditSolid size={18} /> Modifier mes informations
          </button>
        </header>

        <div className="profile-overview-grid">
          <aside className="profile-summary">
            <div className="profile-identity">
              <div className="profile-avatar"><LiaUserCircle size={72} /></div>
              <span className="profile-role-badge"><LiaUserCogSolid size={16} />{roleName}</span>
              <h2>{displayName}</h2>
              <p className="profile-username">@{user?.username || "compte"}</p>
              <a className="profile-email" href={user?.email ? `mailto:${user.email}` : undefined}>
                <LiaAtSolid size={16} />{user?.email || "Adresse e-mail non renseignée"}
              </a>
            </div>
            <div className="profile-completion">
              <div className="profile-completion-heading">
                <span>Profil complété</span>
                <strong>{completedProfileFields}/4</strong>
              </div>
              <div className="profile-completion-track" role="progressbar" aria-label="Complétude du profil" aria-valuemin={0} aria-valuemax={4} aria-valuenow={completedProfileFields}>
                <span style={{ width: `${completedProfileFields * 25}%` }} />
              </div>
              <p>{completedProfileFields === 4 ? "Vos coordonnées sont à jour." : "Complétez vos coordonnées pour faciliter vos achats et livraisons."}</p>
            </div>
            {roleName === "Client" && (
              <Link to="/vendeur" className="profile-seller-link"><FaHandshake size={18} /> Ouvrir une boutique <span aria-hidden="true">→</span></Link>
            )}
          </aside>

          <section className="profile-details-panel">
            <div className="profile-section-heading">
              <div><p className="profile-eyebrow">Informations du compte</p><h2>Coordonnées personnelles</h2></div>
              <button type="button" onClick={() => setIsModalOpen(true)} className="profile-inline-edit"><LiaEditSolid size={17} /><span>Modifier</span></button>
            </div>
            <div className="profile-information-grid">
              <div className="profile-information-item"><span className="profile-field-label">Nom</span><strong>{profileInfo?.firstName || "À compléter"}</strong></div>
              <div className="profile-information-item"><span className="profile-field-label">Prénom</span><strong>{profileInfo?.lastName || "À compléter"}</strong></div>
              <div className="profile-information-item"><span className="profile-field-label">Téléphone</span><strong>{profileInfo?.phoneNumber || user?.phonenumber || "À compléter"}</strong></div>
              <div className="profile-information-item"><span className="profile-field-label">Adresse de livraison</span><strong>{profileInfo?.adresse || "À compléter"}</strong></div>
            </div>

            {roleName !== "Super Admin" && (
              <div className="profile-orders-content">
                <Commande csrf={csrf as string} />
                {roleName === "Client" && <MarketplaceOrderHistory />}
              </div>
            )}
          </section>
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
    </main>
  );
}

export default Profil;
