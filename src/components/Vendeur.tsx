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
import { useLanguage } from "../context/useLanguage";

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
  const { t } = useLanguage();

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
        throw new Error(t("seller.categoriesLoadError"));
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
      toast.error(t("seller.categoriesLoadError"));
      console.error("Category options could not be loaded", error);
    }
  }, [t]);

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
      toast.error(t("seller.requiredFields"));
      return;
    }
    if (
      !/^image\/(jpeg|png|webp)$/.test(boutik.logo.type) ||
      boutik.logo.size > 5 * 1024 * 1024
    ) {
      toast.error(t("seller.invalidLogo"));
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
        throw new Error(data.message || t("seller.submitError"));
      toast.success(data.message);
      navigate("/redirect");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("seller.genericError"),
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
              <FaCloudUploadAlt /> {t("seller.heroKicker")}
            </span>
            <h1>
              {t("seller.heroTitle")}
            </h1>
            <p>
              {t("seller.heroDescription")}
            </p>
            <div className="seller-hero-points">
              <span>{t("seller.stepStorefront")}</span>
              <span>{t("seller.stepCategories")}</span>
              <span>{t("seller.stepCustomers")}</span>
            </div>
          </div>
          <div className="seller-hero-visual" aria-hidden="true">
            <div className="seller-visual-glow" />
            <div className="seller-visual-card seller-visual-card-back" />
            <div className="seller-visual-card seller-visual-card-front">
              <span className="seller-visual-icon">
                <FaCloudUploadAlt />
              </span>
              <strong>{t("seller.brandAnywhere")}</strong>
              <small>{t("seller.storefrontGrowth")}</small>
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
            <span>{t("seller.startTogether")}</span>
            <h2>{t("seller.createWorkspace")}</h2>
            <p>{t("seller.onboardingDescription")}</p>
          </div>
          <div className="seller-form-card">
            <div className="seller-form-card-heading">
              <div>
                <span>{t("seller.storefront")}</span>
                <h3>{t("seller.shopInformation")}</h3>
              </div>
              <span className="seller-form-step">{t("seller.step")}</span>
            </div>
            <div className="seller-form-grid grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="seller-form-identity col-span-1 relative">
                <label htmlFor="seller-logo" className="seller-field-label">
                  {t("seller.logo")}
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
                      <strong>{t("seller.dropLogo")}</strong>
                      <small>{t("seller.logoBrowse")}</small>
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
                  placeholder={t("seller.selectCategories")}
                  classNamePrefix="seller-category"
                />
                <p className="seller-category-hint">
                  {t("seller.categoryHint")}
                </p>
              </div>
              <div className="seller-form-fields col-span-2">
                <div className="seller-form-intro">
                  <h4>{t("seller.presentActivity")}</h4>
                  <p>{t("seller.contactHint")}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="seller-field-label">
                    {t("seller.shopName")}
                    <input
                      type="text"
                      name="name"
                      value={boutik.name}
                      onChange={handleInputChange}
                      placeholder={t("seller.exampleShop")}
                      required
                    />
                  </label>
                  <label className="seller-field-label">
                    {t("seller.address")}
                    <input
                      type="text"
                      name="adresse"
                      value={boutik.adresse}
                      onChange={handleInputChange}
                      placeholder={t("seller.addressExample")}
                      required
                    />
                  </label>
                </div>
                <label className="seller-field-label">
                  {t("seller.phone")}
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={boutik.phoneNumber}
                    onChange={handleInputChange}
                    placeholder={t("seller.phoneExample")}
                    required
                  />
                </label>
                <label className="seller-field-label">
                  {t("seller.email")}
                  <input
                    type="email"
                    name="email"
                    value={boutik.email}
                    onChange={handleInputChange}
                    placeholder={t("seller.emailExample")}
                    required
                  />
                </label>
                <label className="seller-field-label">
                  {t("seller.taxId")} <span className="seller-optional">{t("seller.optional")}</span>
                  <input
                    type="text"
                    name="issuer"
                    value={boutik.issuer}
                    onChange={handleInputChange}
                    placeholder={t("seller.taxReference")}
                  />
                </label>
              </div>
            </div>
            <div className="seller-form-footer">
              <p>{t("seller.submitHint")}</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="market-button-primary disabled:opacity-60"
              >
                <FaCloudUploadAlt />{" "}
                {isSubmitting ? t("seller.submitting") : t("seller.submit")}{" "}
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
