import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Select, { MultiValue } from "react-select";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";
import Preloader from "./loading/Preloader";

interface CategoryOption {
  value: string;
  label: string;
}

interface BoutikState {
  name: string;
  adresse: string;
  phoneNumber: string;
  email: string;
  logo: File | null;
  product_category: CategoryOption[];
  issuer: string;
}

function Vendeur() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [boutik, setBoutik] = useState<BoutikState>({
    name: "",
    adresse: "",
    phoneNumber: "",
    email: "",
    logo: null,
    product_category: [],
    issuer: "",
  });

  const [option, setOption] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csrf = useCSRF();
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_CATEGORY_URL}all/category`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const result = await response.json();
      const datas = result.category.map(
        (element: { _id: string; slug: string }) => ({
          value: element._id,
          label: element.slug,
        }),
      );
      setOption(datas);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      console.error("Category options could not be loaded", error);
    }
  }, []);

  const inputFile = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !boutik.name ||
      !boutik.adresse ||
      !boutik.phoneNumber ||
      !boutik.email ||
      !boutik.logo ||
      boutik.product_category.length === 0
    ) {
      toast.error(
        "Renseignez les coordonnées, le logo et au moins une catégorie.",
      );
      return;
    }
    if (
      !/^image\/(jpeg|png|webp)$/.test(boutik.logo.type) ||
      boutik.logo.size > 5 * 1024 * 1024
    ) {
      toast.error(
        "Le logo doit être au format JPG, PNG ou WebP et peser 5 Mo maximum.",
      );
      return;
    }
    if (!csrf || isSubmitting) return;

    const formData = new FormData();
    formData.append("name", boutik.name);
    formData.append("adresse", boutik.adresse);
    formData.append("phoneNumber", boutik.phoneNumber);
    formData.append("email", boutik.email);
    formData.append("issuer", boutik.issuer);

    if (boutik.logo) {
      formData.append("image", boutik.logo);
    }

    formData.append(
      "product_category",
      JSON.stringify(boutik.product_category.map((category) => category.value)),
    );

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/store`,
        {
          method: "POST",
          headers: {
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Échec de la création de la boutique.");
      toast.success(data.message);
      navigate("/redirect");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur s'est produite.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = () => {
    inputFile?.current?.click();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBoutik((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selected: MultiValue<CategoryOption>) => {
    setBoutik((prev) => ({
      ...prev,
      product_category: selected as CategoryOption[],
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setBoutik((prev) => ({ ...prev, logo: file }));
  };

  if (user?.userGroupMember_id?.usergroup_id?.name === "Boutiks") {
    return <Navigate to="/espace_vendeur/dash" replace />;
  }

  return !csrf ? (
    <Preloader />
  ) : (
    <form onSubmit={handleSubmit} className="seller-page">
      <section className="seller-hero">
        <div className="market-container seller-hero-inner">
          <div className="seller-hero-copy">
            <span className="seller-hero-kicker">
              <FaCloudUploadAlt /> Espace des professionnels
            </span>
            <h1>
              Votre boutique mérite une <span>vitrine remarquable.</span>
            </h1>
            <p>
              Rejoignez ShopInMada et présentez vos produits aux clients partout
              à Madagascar.
            </p>
            <div className="seller-hero-points">
              <span>01 · Créez votre vitrine</span>
              <span>02 · Ajoutez vos catégories</span>
              <span>03 · Touchez de nouveaux clients</span>
            </div>
          </div>
          <div className="seller-hero-visual" aria-hidden="true">
            <div className="seller-visual-glow" />
            <div className="seller-visual-card seller-visual-card-back" />
            <div className="seller-visual-card seller-visual-card-front">
              <span className="seller-visual-icon">
                <FaCloudUploadAlt />
              </span>
              <strong>Votre marque, partout.</strong>
              <small>Une vitrine pensée pour grandir</small>
              <span className="seller-visual-bars">
                <i />
                <i />
                <i />
              </span>
            </div>
            <span className="seller-visual-orbit" />
          </div>
        </div>
      </section>
      <section className="seller-onboarding-section py-9 sm:py-14">
        <div className="market-container">
          <div className="seller-onboarding-heading">
            <span>COMMENÇONS ENSEMBLE</span>
            <h2>Créez votre espace vendeur</h2>
            <p>
              Quelques informations suffisent pour préparer votre boutique en
              ligne.
            </p>
          </div>
          <div className="seller-form-card">
            <div className="seller-form-card-heading">
              <div>
                <span>VOTRE VITRINE</span>
                <h3>Informations de la boutique</h3>
              </div>
              <span className="seller-form-step">Étape 1 sur 1</span>
            </div>
            <div className="seller-form-grid grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="seller-form-identity col-span-1 relative">
                <label htmlFor="seller-logo" className="seller-field-label">
                  Logo de la boutique
                </label>
                <div
                  className="seller-logo-upload relative left-0 right-0 top-0 mb-3 flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden"
                  onClick={handleClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleClick();
                    }
                  }}
                >
                  <input
                    type="file"
                    id="seller-logo"
                    name="logo"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute hidden"
                    onChange={handleFileChange}
                    ref={inputFile}
                  />
                  {!boutik.logo ? (
                    <>
                      <FaCloudUploadAlt
                        className="font-bold text-green-600"
                        size={50}
                      />
                      <strong>Déposez votre logo ici</strong>
                      <small>Formats image · Cliquez pour parcourir</small>
                    </>
                  ) : (
                    <img
                      src={URL.createObjectURL(boutik.logo)}
                      alt=""
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>

                <Select
                  options={option}
                  isMulti
                  isClearable
                  value={boutik.product_category}
                  onChange={handleSelectChange}
                  placeholder={"Sélectionnez vos catégories"}
                  classNamePrefix="seller-category"
                />
                <p className="seller-category-hint">
                  Choisissez les catégories qui représentent le mieux vos
                  produits.
                </p>
              </div>
              <div className="seller-form-fields col-span-2">
                <div className="seller-form-intro">
                  <h4>Présentez votre activité</h4>
                  <p>
                    Ces informations aideront vos clients à vous trouver et à
                    vous contacter.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="seller-field-label">
                    Nom de la boutique
                    <input
                      type="text"
                      name="name"
                      value={boutik.name}
                      onChange={handleInputChange}
                      placeholder="Ex. Atelier Mada"
                      required
                    />
                  </label>
                  <label className="seller-field-label">
                    Adresse
                    <input
                      type="text"
                      name="adresse"
                      value={boutik.adresse}
                      onChange={handleInputChange}
                      placeholder="Ville, quartier, adresse"
                      required
                    />
                  </label>
                </div>
                <label className="seller-field-label">
                  Téléphone
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={boutik.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Ex. 034 12 345 67"
                    required
                  />
                </label>
                <label className="seller-field-label">
                  Adresse e-mail
                  <input
                    type="email"
                    name="email"
                    value={boutik.email}
                    onChange={handleInputChange}
                    placeholder="contact@votreboutique.mg"
                    required
                  />
                </label>
                <label className="seller-field-label">
                  NIF / STAT <span className="seller-optional">Facultatif</span>
                  <input
                    type="text"
                    name="issuer"
                    value={boutik.issuer}
                    onChange={handleInputChange}
                    placeholder="Vos références administratives"
                  />
                </label>
              </div>
            </div>
            <div className="seller-form-footer">
              <p>
                En envoyant ce formulaire, vous soumettez votre boutique à
                validation.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="market-button-primary disabled:opacity-60"
              >
                <FaCloudUploadAlt />{" "}
                {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}{" "}
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}

export default Vendeur;
