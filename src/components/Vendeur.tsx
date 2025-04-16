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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
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
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const result = await response.json();
      const datas = result.category.map(
        (element: { _id: string; slug: string }) => ({
          value: element._id,
          label: element.slug,
        })
      );
      setOption(datas);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      throw error;
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
      !boutik.email
    ) {
      toast.error("Tous les champs obligatoires doivent être remplis");
      return;
    }

    const formData = new FormData();
    formData.append("name", boutik.name);
    formData.append("adresse", boutik.adresse);
    formData.append("phoneNumber", boutik.phoneNumber);
    formData.append("email", boutik.email);
    formData.append("issuer", boutik.issuer);

    if (boutik.logo) {
      formData.append("image", boutik.logo);
    }

    boutik.product_category.forEach((category, index) => {
      formData.append(`product_category[${index}]`, category.value);
    });

    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}boutiks/store`,
          {
            method: "POST",
            headers: {
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Échec de la création de la boutique");
        }

        const data = await response.json();
        toast.success(data.message);
        navigate("/redirect");
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
      throw error;
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

  return !csrf ? (
    <Preloader />
  ) : (
    <form onSubmit={handleSubmit}>
      <section className="bg-green-900/50 bg-[url('/src/assets/image/banner/banner.jpg')] h-72 bg-center bg-cover bg-blend-color-burn bg-no-repeat flex justify-center items-center">
        <h1 className="text-center text-4xl uppercase text-white font-semibold">
          Devenir vendeur
        </h1>
      </section>
      <section>
        <div className="container mx-auto px-3 py-5">
          <div className="container shadow rounded-lg mx-auto px-10 py-3">
            <h2 className="text-xl font-semibold mx-5 my-5">
              Informations de la boutique
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5">
              <div className="col-span-1 relative">
                <div
                  className="bg-white/50 h-64 w-full mb-1 aspect-video relative left-0 top-0  shadow rounded flex flex-col justify-center items-center right-0  cursor-pointer"
                  onClick={handleClick}
                >
                  <input
                    type="file"
                    name="logo"
                    className="absolute hidden"
                    onChange={handleFileChange}
                    ref={inputFile}
                  />
                  {!boutik.logo ? (
                    <>
                      <FaCloudUploadAlt
                        className="font-bold  text-green-500"
                        size={50}
                      />
                      <h2>Votre logo</h2>
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
                  placeholder={"Choisir votre categorie de produit"}
                />
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="name"
                    value={boutik.name}
                    onChange={handleInputChange}
                    placeholder="Nom de la boutique"
                    className="rounded w-full border border-green-500 py-5 px-3 mb-3"
                    required
                  />
                  <input
                    type="text"
                    name="adresse"
                    value={boutik.adresse}
                    onChange={handleInputChange}
                    placeholder="Adresse"
                    className="rounded w-full border border-green-500 py-5 px-3 mb-3"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  value={boutik.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Téléphone"
                  className="rounded w-full border border-green-500 py-5 px-3 mb-3"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={boutik.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="rounded w-full border border-green-500 py-5 px-3 mb-3"
                  required
                />
                <input
                  type="text"
                  name="issuer"
                  value={boutik.issuer}
                  onChange={handleInputChange}
                  placeholder="NIF/STAT"
                  className="rounded w-full border border-green-500 py-5 px-3 mb-3"
                />
              </div>
              <div></div>
            </div>
            <div className="px-5">
              <button
                type="submit"
                className="bg-green-500 text-white text-lg py-5 w-full uppercase  rounded-md"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}

export default Vendeur;
