import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";
import Preloader from "../../../loading/Preloader";
import { PageHeader } from "../../ui";

type ShopInfo = {
  logo: string;
  name: string;
  adresse: string;
  phoneNumber: string;
  whatsappNumber: string;
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
  logo: "",
  name: "",
  adresse: "",
  phoneNumber: "",
  whatsappNumber: "",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const csrf = useCSRF();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_API_URL}boutiks/info`, { credentials: "include" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Impossible de charger les informations boutique.");
        setShopInfo({ ...initialShopInfo, ...(result.boutiks ?? {}) });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Chargement de la boutique impossible.");
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!logoFile) { setLogoPreview(null); return; }
    const preview = URL.createObjectURL(logoFile);
    setLogoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [logoFile]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShopInfo({ ...shopInfo, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (csrf && !saving) {
      setSaving(true);
      try {
      const body = new FormData();
      Object.entries(shopInfo).forEach(([key, value]) => { if (key !== "logo") body.append(key, String(value ?? "")); });
      if (logoFile) body.append("image", logoFile);
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/update`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "xsrf-token": csrf },
          body,
        },
      );

      const result = await response.json();
      if (!response.ok || String(result.status).toLowerCase() !== "success") throw new Error(result.message || "Impossible d’enregistrer les informations boutique.");
      setShopInfo((current) => ({ ...current, logo: result.data?.logo ?? current.logo }));
      setLogoFile(null);
      toast.success(result.message || "Informations enregistrées.");
      } catch (error) { toast.error(error instanceof Error ? error.message : "Enregistrement impossible."); }
      finally { setSaving(false); }
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

      {loading ? <div className="admin-panel p-6 text-sm text-[var(--admin-muted)]">Chargement des informations boutique…</div> : <form
        onSubmit={handleSubmit}
        className="admin-panel mx-auto w-full max-w-3xl p-5 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <div className="admin-field sm:col-span-2"><label htmlFor="shop-logo">Logo de la boutique</label><div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white">{logoPreview || shopInfo.logo ? <img src={logoPreview ?? `${import.meta.env.REACT_API_URL}uploads/${encodeURIComponent(shopInfo.logo)}`} alt="Aperçu du logo boutique" className="h-full w-full object-contain" /> : <span className="text-2xl font-bold text-emerald-800">{shopInfo.name.slice(0, 1) || "B"}</span>}</div><div className="grid gap-1"><input id="shop-logo" type="file" accept="image/jpeg,image/png,image/webp" className="admin-field__control" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) { toast.error("Choisissez une image JPEG, PNG ou WebP de 5 Mo maximum."); event.target.value = ""; return; } setLogoFile(file); }} /><small className="text-xs text-[var(--admin-muted)]">Format JPEG, PNG ou WebP · 5 Mo maximum</small></div></div></div>
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

          <div className="admin-field">
            <label htmlFor="shop-whatsappNumber">WhatsApp (visible aux clients)</label>
            <input id="shop-whatsappNumber" type="tel" inputMode="tel" name="whatsappNumber" value={shopInfo.whatsappNumber} onChange={handleChange} placeholder="+261 34 00 000 00" maxLength={24} className="admin-field__control" />
            <small className="text-xs text-[var(--admin-muted)]">Utilisez l’indicatif international pour faciliter le contact.</small>
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
            disabled={saving}
            className="admin-button admin-button--primary admin-button--md"
          >
            <FaSave className="mr-2" /> {saving ? "Enregistrement…" : "Enregistrer les informations"}
          </button>
        </div>
      </form>}
    </div>
  );
}

export default BoutiksInfo;
