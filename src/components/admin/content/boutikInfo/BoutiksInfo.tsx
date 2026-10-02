import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";
import Preloader from "../../../loading/Preloader";
type ShopInfo = {
  name: string;
  adresse: string;
  phoneNumber: string;
  email: string;
  description: string;
  ville: string;
};
function BoutiksInfo() {
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    name: "",
    adresse: "",
    phoneNumber: "",
    email: "",
    description: "",
    ville: "",
  });

  const csrf = useCSRF();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/info`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();
      setShopInfo(result.boutiks);
    };
    fetchData();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        }
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
    <div className="admin-shop-info flex justify-center px-1 py-4 sm:py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Paramètres de la boutique</p>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Modifier les informations de la boutique
        </h1>
        <p className="mb-7 text-sm text-gray-500">Tenez à jour les coordonnées visibles par vos clients.</p>

        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom de la boutique
            </label>
            <input
              type="text"
              name="name"
              value={shopInfo.name}
              onChange={handleChange}
              placeholder="Entrez le nom de la boutique"
              className="mt-1 block w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={shopInfo.adresse}
              onChange={handleChange}
              placeholder="Entrez l'adresse de la boutique"
              className="mt-1 block w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={shopInfo.phoneNumber}
              onChange={handleChange}
              placeholder="Entrez le numéro de téléphone"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ville
            </label>
            <input
              type="text"
              name="ville"
              value={shopInfo.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="mt-1 block w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={shopInfo.email}
              onChange={handleChange}
              placeholder="Entrez l'email de la boutique"
              className="mt-1 block w-full"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="market-button-primary"
          >
            <FaSave className="mr-2" /> Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoutiksInfo;
