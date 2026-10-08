import {
  LiaAtSolid,
  LiaEditSolid,
  LiaUserCircle,
  LiaUserCogSolid,
  LiaShieldAltSolid,
  LiaBellSolid,
  LiaSlidersHSolid,
  LiaStoreSolid,
  LiaLockSolid,
} from "react-icons/lia";
import { Link, useNavigate } from "react-router-dom";
import UserInfo from "./modals/UserInfo";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaHandshake } from "react-icons/fa";
import { useAuth } from "../helper/useAuth";
import Commande from "./commande/Commande";
import MarketplaceOrderHistory from "./commande/MarketplaceOrderHistory";
import AccountActivity from "./profile/AccountActivity";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import Preloader from "./loading/Preloader";
import { useLanguage } from "../context/useLanguage";

function Profil() {
  const { user, setUserInfo, currencyRates } = useAuth();
  const { t, language } = useLanguage();
  const csrf = useCSRF();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [notifications, setNotifications] = useState({ orders: true, support: true, promotions: false });
  const [currency, setCurrency] = useState<"MGA" | "EUR" | "USD">("MGA");
  const [addresses, setAddresses] = useState<Array<{ _id: string; label?: string; recipientName: string; phone: string; address: string; city?: string }>>([]);
  const [savedProducts, setSavedProducts] = useState<Array<{ _id: string; name: string }>>([]);
  const [recentProducts, setRecentProducts] = useState<Array<{ _id: string; name: string }>>([]);
  const [newAddress, setNewAddress] = useState({ label: "", recipientName: "", phone: "", address: "", city: "" });
  const [savingAddress, setSavingAddress] = useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] =
    useState(false);
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

  useEffect(() => {
    setCurrency(user?.preferences?.currency ?? "MGA");
    setNotifications({ orders: user?.preferences?.notifications?.orders ?? true, support: user?.preferences?.notifications?.support ?? true, promotions: user?.preferences?.notifications?.promotions ?? false });
  }, [user?._id, user?.preferences]);

  useEffect(() => { if (!user?._id || roleName !== "Client") return; void fetch(`${import.meta.env.REACT_API_URL}user/addresses`, { credentials: "include" }).then((response) => response.ok ? response.json() : null).then((result) => { if (result) setAddresses(result.data ?? []); }).catch(() => toast.error("Adresses enregistrées indisponibles.")); }, [user?._id, roleName]);

  useEffect(() => {
    if (!user?._id || roleName !== "Client") return;
    let active = true;
    const loadSavedProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_API_URL}wishlist?page=1&limit=50`, { credentials: "include" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Impossible de charger vos favoris.");
        if (active) setSavedProducts(result.data ?? []);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Favoris indisponibles.");
      }

      let recentIds: string[] = [];
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem("shopinmada.recent-products") ?? "[]");
        if (Array.isArray(parsed)) recentIds = parsed.filter((id): id is string => typeof id === "string").slice(0, 8);
      } catch {
        recentIds = [];
      }
      const products = await Promise.all(recentIds.map(async (id) => {
        try {
          const response = await fetch(`${import.meta.env.REACT_API_URL}shop/product/${encodeURIComponent(id)}`);
          if (!response.ok) return null;
          const result = await response.json();
          return result.data as { _id: string; name: string } | undefined;
        } catch {
          return null;
        }
      }));
      if (active) setRecentProducts(products.filter((product): product is { _id: string; name: string } => Boolean(product)));
    };
    void loadSavedProducts();
    return () => { active = false; };
  }, [user?._id, roleName]);

  const removeSavedProduct = async (productId: string) => {
    if (!csrf) return;
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}wishlist/${productId}`, { method: "PUT", credentials: "include", headers: { "xsrf-token": csrf } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Impossible de modifier vos favoris.");
      setSavedProducts((products) => products.filter((product) => product._id !== productId));
      toast.success("Produit retiré de vos favoris.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Favoris indisponibles.");
    }
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault(); if (!csrf || savingAddress) return; setSavingAddress(true);
    try { const response = await fetch(`${import.meta.env.REACT_API_URL}user/addresses`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf }, body: JSON.stringify(newAddress) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); setAddresses(result.data ?? []); setNewAddress({ label: "", recipientName: "", phone: "", address: "", city: "" }); toast.success("Adresse enregistrée."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Impossible d’enregistrer l’adresse."); } finally { setSavingAddress(false); }
  };

  const deleteAddress = async (id: string) => { if (!csrf) return; try { const response = await fetch(`${import.meta.env.REACT_API_URL}user/addresses/${id}`, { method: "DELETE", credentials: "include", headers: { "xsrf-token": csrf } }); const result = await response.json(); if (!response.ok) throw new Error(result.message); setAddresses(result.data ?? []); } catch (error) { toast.error(error instanceof Error ? error.message : "Suppression impossible."); } };

  const savePreferences = async (next: { currency: "MGA" | "EUR" | "USD"; notifications: { orders: boolean; support: boolean; promotions: boolean } }) => {
    if (!csrf || !user || savingPreferences) return;
    setSavingPreferences(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}user/preferences`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf }, body: JSON.stringify(next) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.");
      setUserInfo({ ...user, preferences: result.data });
      toast.success("Préférences enregistrées.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Enregistrement impossible."); }
    finally { setSavingPreferences(false); }
  };

  const saveNotification = (key: "orders" | "support" | "promotions", checked: boolean) => {
    const nextNotifications = { ...notifications, [key]: checked };
    setNotifications(nextNotifications);
    void savePreferences({ currency, notifications: nextNotifications });
  };

  const form = useRef(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfil((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!csrf || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}personnal/store`,
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

  const handlePasswordReset = async () => {
    if (!csrf || !user?.email || isRequestingPasswordReset) return;

    setIsRequestingPasswordReset(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}auth/forgotpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ email: user.email }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(
          result.message || "Impossible d’envoyer le code de vérification.",
        );
        return;
      }

      setUserInfo(result.userInfo);
      navigate("/confirmCompte", { state: { from: "/forgotPass" } });
    } catch {
      toast.error("Une erreur est survenue lors de l’envoi du code.");
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  const handleDataExport = () => {
    if (!user) return;

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: {
        username: user.username,
        email: user.email,
        phoneNumber: user.phonenumber,
        role: roleName,
      },
      personalInformation: profileInfo
        ? {
            firstName: profileInfo.firstName,
            lastName: profileInfo.lastName,
            phoneNumber: profileInfo.phoneNumber,
            gender: profileInfo.gender,
            address: profileInfo.adresse,
          }
        : null,
    };
    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "shopinmada-mes-donnees.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
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

  const isSeller = roleName === "Boutiks";
  return !csrf ? (
    <Preloader />
  ) : (
    <main className="profile-page-root w-full py-7 sm:py-10">
      <div className="profile-layout page-container">
        <header className="profile-page-heading">
          <div>
            <p className="profile-eyebrow">ShopInMada · {t("nav.account")}</p>
            <h1>{t("profile.title")}</h1>
            <p>
              {t("profile.description")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="profile-edit-button"
          >
            <LiaEditSolid size={18} /> {t("profile.edit")}
          </button>
        </header>

        <div className="profile-overview-grid">
          <aside className="profile-summary">
            <div className="profile-identity">
              <div className="profile-avatar">
                <LiaUserCircle size={42} />
              </div>
              <span className="profile-role-badge">
                <LiaUserCogSolid size={16} />
                {roleName}
              </span>
              <h2>{displayName}</h2>
              <p className="profile-username">@{user?.username || "compte"}</p>
              <a
                className="profile-email"
                href={user?.email ? `mailto:${user.email}` : undefined}
              >
                <LiaAtSolid size={16} />
                {user?.email || "Adresse e-mail non renseignée"}
              </a>
            </div>
            <div className="profile-completion">
              <div className="profile-completion-heading">
                <span>{t("profile.completed")}</span>
                <strong>{completedProfileFields}/4</strong>
              </div>
              <div
                className="profile-completion-track"
                role="progressbar"
                aria-label={t("profile.completed")}
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={completedProfileFields}
              >
                <span style={{ width: `${completedProfileFields * 25}%` }} />
              </div>
              <p>
                {completedProfileFields === 4
                  ? t("profile.upToDate")
                  : t("profile.completeHint")}
              </p>
            </div>
            {roleName === "Client" && (
              <Link to="/vendeur" className="profile-seller-link">
                <FaHandshake size={18} /> {t("profile.openShop")}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            )}
            {isSeller && (
              <Link to="/espace_vendeur/dash" className="profile-seller-link">
                <LiaStoreSolid size={18} /> Accéder au back-office
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </aside>

          <section className="profile-details-panel">
            <div className="profile-section-heading">
              <div>
                <p className="profile-eyebrow">{t("profile.accountInfo")}</p>
                <h2>{t("profile.personalInfo")}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="profile-inline-edit"
              >
                <LiaEditSolid size={17} />
                <span>{t("profile.edit")}</span>
              </button>
            </div>

            <div className="profile-information-grid">
              <div className="profile-information-item">
                <span className="profile-field-label">{t("profile.name")}</span>
                <strong>{profileInfo?.firstName || t("profile.toComplete")}</strong>
              </div>
              <div className="profile-information-item">
                <span className="profile-field-label">{t("profile.firstName")}</span>
                <strong>{profileInfo?.lastName || t("profile.toComplete")}</strong>
              </div>
              <div className="profile-information-item">
                <span className="profile-field-label">{t("profile.phone")}</span>
                <strong>
                  {profileInfo?.phoneNumber ||
                    user?.phonenumber ||
                    t("profile.toComplete")}
                </strong>
              </div>
              <div className="profile-information-item">
                <span className="profile-field-label">{t("profile.city")}</span>
                <strong>{profileInfo?.adresse || t("profile.toComplete")}</strong>
              </div>
            </div>

            <div className="profile-sections-stack">
              <div className="profile-section-card">
                <div className="profile-section-title">
                  <span className="profile-section-icon">
                    <LiaShieldAltSolid size={18} />
                  </span>
                  <div>
                    <h3>{t("profile.security")}</h3>
                    <p>{t("profile.securityHint")}</p>
                  </div>
                </div>
                <div className="profile-section-body">
                  <div className="profile-inline-row">
                    <span>{t("contact.email")}</span>
                    <span className="profile-pill profile-pill-neutral">
                      {user?.email ? t("profile.provided") : t("profile.notProvided")}
                    </span>
                  </div>
                  <div className="profile-inline-row">
                    <span>{t("profile.phone")}</span>
                    <span className="profile-pill profile-pill-neutral">
                      {user?.phonenumber ? t("profile.providedMasc") : t("profile.notProvidedMasc")}
                    </span>
                  </div>
                  <div className="profile-inline-row">
                    <span>{t("auth.password")}</span>
                    <button
                      type="button"
                      className="profile-text-button"
                      onClick={handlePasswordReset}
                      disabled={isRequestingPasswordReset || !user?.email}
                    >
                      {isRequestingPasswordReset
                        ? t("profile.sendCode")
                        : t("profile.changePassword")}
                    </button>
                  </div>
                  <div className="profile-inline-row">
                    <span>{t("profile.currentSession")}</span>
                    <Link to="/logout" className="profile-text-button">
                      {t("profile.signOut")}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="profile-section-card">
                <div className="profile-section-title">
                  <span className="profile-section-icon">
                    <LiaBellSolid size={18} />
                  </span>
                  <div>
                    <h3>{t("profile.notifications")}</h3>
                    <p>{t("profile.notificationHint")}</p>
                  </div>
                </div>
                <div className="profile-section-body">
                  <div className="profile-toggle-row">
                    <span>{t("profile.orderAlerts")}</span>
                    <input type="checkbox" checked={notifications.orders} disabled={savingPreferences} onChange={(event) => saveNotification("orders", event.target.checked)} />
                  </div>
                  <div className="profile-toggle-row">
                    <span>{t("profile.promotionAlerts")}</span>
                    <input type="checkbox" checked={notifications.promotions} disabled={savingPreferences} onChange={(event) => saveNotification("promotions", event.target.checked)} />
                  </div>
                  <div className="profile-toggle-row">
                    <span>{t("profile.marketplaceMessages")}</span>
                    <input type="checkbox" checked={notifications.support} disabled={savingPreferences} onChange={(event) => saveNotification("support", event.target.checked)} />
                  </div>
                </div>
              </div>

              {roleName === "Client" && <div className="profile-section-card"><div className="profile-section-title"><span className="profile-section-icon"><LiaAtSolid size={18}/></span><div><h3>{t("profile.addresses")}</h3><p>{t("profile.addressesHint")}</p></div></div><div className="profile-section-body">{addresses.map((item)=><div className="profile-inline-row" key={item._id}><span><strong>{item.label || item.recipientName}</strong><br/>{item.address} · {item.city} · {item.phone}</span><button type="button" className="profile-text-button danger-text" onClick={()=>void deleteAddress(item._id)}>{t("profile.delete")}</button></div>)}<form className="grid gap-3 sm:grid-cols-2" onSubmit={(event)=>void saveAddress(event)}><input required maxLength={40} placeholder={t("profile.addressLabel")} value={newAddress.label} onChange={(event)=>setNewAddress(v=>({...v,label:event.target.value}))}/><input required minLength={2} maxLength={120} placeholder={t("profile.recipient")} value={newAddress.recipientName} onChange={(event)=>setNewAddress(v=>({...v,recipientName:event.target.value}))}/><input required minLength={6} maxLength={40} placeholder={t("profile.phone")} value={newAddress.phone} onChange={(event)=>setNewAddress(v=>({...v,phone:event.target.value}))}/><input required minLength={5} maxLength={300} placeholder={t("profile.fullAddress")} value={newAddress.address} onChange={(event)=>setNewAddress(v=>({...v,address:event.target.value}))}/><input maxLength={100} placeholder={t("profile.city")} value={newAddress.city} onChange={(event)=>setNewAddress(v=>({...v,city:event.target.value}))}/><button disabled={savingAddress} className="profile-text-button">{savingAddress?t("profile.saving"):t("profile.addAddress")}</button></form></div></div>}

              <div className="profile-section-card">
                <div className="profile-section-title">
                  <span className="profile-section-icon">
                    <LiaSlidersHSolid size={18} />
                  </span>
                  <div>
                    <h3>{t("profile.preferences")}</h3>
                    <p>{t("profile.languageSpace")}</p>
                  </div>
                </div>
                <div className="profile-section-body compact-grid">
                  <label className="profile-pref-field">
                    <span>{t("language.label")}</span>
                    <span className="text-xs text-gray-500">{language === "fr" ? "Ce choix s’applique à toutes les pages et est enregistré sur votre compte." : "This choice applies across the app and is saved to your account."}</span>
                  </label>
                  <label className="profile-pref-field">
                    <span>{t("profile.currency")}</span>
                    <select value={currency} disabled={savingPreferences} onChange={(event) => { const nextCurrency = event.target.value as "MGA" | "EUR" | "USD"; setCurrency(nextCurrency); void savePreferences({ currency: nextCurrency, notifications }); }}>
                      <option value="MGA">Ariary (MGA)</option>
                      <option value="EUR" disabled={!currencyRates.fresh || !currencyRates.EUR}>Euro</option>
                      <option value="USD" disabled={!currencyRates.fresh || !currencyRates.USD}>Dollar</option>
                    </select>
                    {currency !== "MGA" && currencyRates.updatedAt && <small>{t("profile.exchangeDate").replace("{date}", new Date(currencyRates.updatedAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US"))}</small>}
                    {currency !== "MGA" && !currencyRates.fresh && <small>{t("profile.conversionUnavailable")}</small>}
                  </label>
                </div>
              </div>

              <div className="profile-section-card">
                <div className="profile-section-title">
                  <span className="profile-section-icon">
                    <LiaLockSolid size={18} />
                  </span>
                  <div>
                    <h3>{t("profile.privacy")}</h3>
                    <p>{t("profile.exportDescription")}</p>
                  </div>
                </div>
                <div className="profile-section-body">
                  <div className="profile-inline-row">
                    <span>{t("profile.exportData")}</span>
                    <button
                      type="button"
                      className="profile-text-button"
                      onClick={handleDataExport}
                    >
                      Télécharger
                    </button>
                  </div>
                  <div className="profile-inline-row danger-row">
                    <span>{language === "en" ? "Delete account" : "Supprimer le compte"}</span>
                    <button
                      type="button"
                      className="profile-text-button danger-text"
                      onClick={() =>
                        toast.info(
                          "La suppression autonome du compte n’est pas disponible. Contactez l’assistance ShopInMada.",
                        )
                      }
                    >
                      Indisponible
                    </button>
                  </div>
                </div>
              </div>

              {isSeller && (
                <div className="profile-section-card seller-card">
                  <div className="profile-section-title">
                    <span className="profile-section-icon">
                      <LiaStoreSolid size={18} />
                    </span>
                    <div>
                      <h3>Espace vendeur</h3>
                      <p>Informations boutique et abonnement</p>
                    </div>
                  </div>
                  <div className="profile-section-body">
                    <div className="profile-inline-row">
                      <span>Boutique</span>
                      <Link
                        to="/espace_vendeur/boutiksInfo"
                        className="profile-text-button"
                      >
                        Voir la boutique
                      </Link>
                    </div>
                    <div className="profile-inline-row">
                      <span>Abonnement</span>
                      <span className="profile-pill profile-pill-neutral">
                        Voir l’espace vendeur
                      </span>
                    </div>
                    <div className="profile-inline-row">
                      <span>Modes de paiement</span>
                      <span className="profile-pill profile-pill-neutral">
                        Configurés dans la boutique
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {roleName !== "Super Admin" && (
              <div className="profile-orders-content">
                {roleName === "Client" && <section className="profile-section-card">
                  <div className="profile-section-title"><span className="profile-section-icon"><LiaAtSolid size={18} /></span><div><h3>{t("profile.products")}</h3><p>{t("profile.productsHint")}</p></div></div>
                  <div className="profile-section-body grid gap-5 md:grid-cols-2">
                    <div><h4 className="mb-2 font-semibold">{t("profile.favorites")}</h4>{savedProducts.length ? savedProducts.map((product) => <div className="profile-inline-row" key={product._id}><Link to={`/product/${product._id}/details`} className="profile-text-button">{product.name}</Link><button type="button" className="profile-text-button danger-text" onClick={() => void removeSavedProduct(product._id)}>{t("profile.remove")}</button></div>) : <p className="text-sm text-gray-500">{t("profile.noFavorites")}</p>}</div>
                    <div><h4 className="mb-2 font-semibold">{t("profile.recentlyViewed")}</h4>{recentProducts.length ? recentProducts.map((product) => <div className="profile-inline-row" key={product._id}><Link to={`/product/${product._id}/details`} className="profile-text-button">{product.name}</Link></div>) : <p className="text-sm text-gray-500">{t("profile.noRecentlyViewed")}</p>}</div>
                  </div>
                </section>}
                <AccountActivity />
                <Commande csrf={csrf as string} />
                {roleName === "Client" && <MarketplaceOrderHistory />}
              </div>
            )}
          </section>
        </div>
      </div>

      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <div className="personal-info-modal">
          <header className="personal-info-modal-heading">
            <span className="personal-info-modal-icon">
              <LiaUserCircle size={25} />
            </span>
            <div>
              <p className="personal-info-modal-eyebrow">{t("profile.personalModal")}</p>
              <h2>{t("profile.personalModalTitle")}</h2>
              <p>{t("profile.personalModalHint")}</p>
            </div>
          </header>
          <form
            ref={form}
            onSubmit={handleSubmit}
            className="personal-info-form"
          >
            <div className="personal-info-fields">
              <label className="personal-info-field">
                {t("profile.name")}
                <input
                  type="text"
                  name="firstName"
                  placeholder={t("profile.name")}
                  value={userProfil.firstName}
                  onChange={handleChange}
                />
              </label>
              <label className="personal-info-field">
                {t("profile.firstName")}
                <input
                  type="text"
                  name="lastName"
                  placeholder={t("profile.firstName")}
                  value={userProfil.lastName}
                  onChange={handleChange}
                />
              </label>
              <label className="personal-info-field personal-info-field-wide">
                {t("profile.address")}
                <input
                  type="text"
                  name="adresse"
                  placeholder={t("profile.address")}
                  value={userProfil.adresse}
                  onChange={handleChange}
                />
              </label>
              <fieldset className="personal-info-gender">
                <legend>{t("profile.gender")}</legend>
                <label className="personal-info-gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={userProfil.gender === "male"}
                    onChange={handleChange}
                  />
                  {t("profile.male")}
                </label>
                <label className="personal-info-gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={userProfil.gender === "female"}
                    onChange={handleChange}
                  />
                  {t("profile.female")}
                </label>
              </fieldset>
              <label className="personal-info-field personal-info-field-wide">
                {t("profile.phoneNumber")}
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder={t("profile.phoneExample")}
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
                {isSaving ? t("profile.saving") : t("profile.save")}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="market-button-secondary"
              >
                {t("profile.close")}
              </button>
            </div>
          </form>
        </div>
      </UserInfo>
    </main>
  );
}

export default Profil;
