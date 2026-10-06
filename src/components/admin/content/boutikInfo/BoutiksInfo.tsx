import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";
import Preloader from "../../../loading/Preloader";
import { PageHeader } from "../../ui";

type ShopInfo = {
  name: string;
  adresse: string;
  phoneNumber: string;
  email: string;
  description: string;
  ville: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

const initialShopInfo: ShopInfo = {
  name: "",
  adresse: "",
  phoneNumber: "",
  email: "",
  description: "",
  ville: "",
  websiteUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
};

function BoutiksInfo() {
  const [shopInfo, setShopInfo] = useState<ShopInfo>(initialShopInfo);

  const csrf = useCSRF();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/info`,
        {
          credentials: "include",
        },
      );

      const result = await response.json();
      setShopInfo({ ...initialShopInfo, ...(result.boutiks ?? {}) });
    };
    fetchData();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShopInfo({ ...shopInfo, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (csrf) {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/update`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          body: JSON.stringify(shopInfo),
        },
      );

      const { status, message } = await response.json();

      if ((status as string).toLocaleLowerCase() === "success") {
        toast.success(message);
      }
      if ((status as string).toLocaleLowerCase() === "failed") {
        toast.error(message);
      }
    }
  };

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Boutique"
        title="Modifier les informations de la boutique"
        description="Tenez à jour les coordonnées visibles par vos clients."
      />

      <form
        onSubmit={handleSubmit}
        className="admin-panel mx-auto w-full max-w-3xl p-5 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <div className="admin-field">
            <label>Nom de la boutique</label>
            <input
              type="text"
              name="name"
              value={shopInfo.name}
              onChange={handleChange}
              placeholder="Entrez le nom de la boutique"
              className="admin-field__control"
              required
            />
          </div>

          <div className="admin-field">
            <label>Adresse</label>
            <input
              type="text"
              name="adresse"
              value={shopInfo.adresse}
              onChange={handleChange}
              placeholder="Entrez l'adresse de la boutique"
              className="admin-field__control"
              required
            />
          </div>

          <div className="admin-field">
            <label>Numéro de téléphone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={shopInfo.phoneNumber}
              onChange={handleChange}
              placeholder="Entrez le numéro de téléphone"
              className="admin-field__control"
              required
            />
          </div>

          <div className="admin-field">
            <label>Ville</label>
            <input
              type="text"
              name="ville"
              value={shopInfo.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="admin-field__control"
              required
            />
          </div>

          <div className="admin-field sm:col-span-2">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={shopInfo.email}
              onChange={handleChange}
              placeholder="Entrez l'email de la boutique"
              className="admin-field__control"
              required
            />
          </div>

          <div className="admin-field sm:col-span-2">
            <label htmlFor="shop-description">
              Présentation de la boutique
            </label>
            <textarea
              id="shop-description"
              name="description"
              value={shopInfo.description}
              onChange={handleChange}
              placeholder="Présentez votre boutique et vos produits en quelques lignes"
              className="admin-field__control min-h-28"
              maxLength={1000}
              rows={4}
            />
          </div>
        </div>

        <section className="mt-6 border-t border-[var(--admin-border)] pt-5">
          <h2 className="mb-1 text-base font-bold text-[var(--admin-text)]">
            Site web et réseaux sociaux
          </h2>
          <p className="mb-4 text-sm text-[var(--admin-muted)]">
            Ajoutez des liens publics pour permettre aux clients de découvrir et
            contacter votre boutique.
          </p>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {[
              ["websiteUrl", "Site web"],
              ["facebookUrl", "Facebook"],
              ["instagramUrl", "Instagram"],
              ["tiktokUrl", "TikTok"],
              ["youtubeUrl", "YouTube"],
            ].map(([field, label]) => (
              <div className="admin-field" key={field}>
                <label htmlFor={`shop-${field}`}>{label}</label>
                <input
                  id={`shop-${field}`}
                  type="url"
                  name={field}
                  value={shopInfo[field as keyof ShopInfo]}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="admin-field__control"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="admin-button admin-button--primary admin-button--md"
          >
            <FaSave className="mr-2" /> Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoutiksInfo;
