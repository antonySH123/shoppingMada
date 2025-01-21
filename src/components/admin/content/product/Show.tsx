import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useState,
  useEffect,
} from "react";
import { LiaPlusSolid, LiaTrashAltSolid } from "react-icons/lia";
import { useParams } from "react-router-dom";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";

interface IProductVariant {
  _id?: string;
  name: string;
  value: string;
  additionalPrice?: number;
}

interface IProduct{
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  details: string;
  variant:IProductVariant[]
  photos:[string]
}

function Show() {
  const [variant, setVariant] = useState<IProductVariant>({
    name: "",
    value: "",
    additionalPrice: 0,
  });
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const csrf = useCSRF();


  const getProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}boutiks/product/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données du produit");
      }

      const { data } = await response.json();
      console.log(data)
      setProduct(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown| any) {
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  // Handle input changes
  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setVariant((prev) => ({
      ...prev,
      [name]:value,
    }));
  };

  // Submit new variant
  const handleSubmitNewVariant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (csrf) {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}product/${id}/variant`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify(variant),
          }
        );

        if (!response.ok) {
          toast.error("Une erreur est survenue!");
          return;
        }

        if (response.status === 201) {
          const result = await response.json();
          toast.success(result.message);
          getProduct(); // Refresh product data
        }
      } catch {
        toast.error("Impossible d'ajouter la variante");
      }
    }
  };

  if (loading) return <p>Chargement des informations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="px-10 py-10 border-0 bg-white rounded-lg">
      <h1 className="text-center text-black text-3xl uppercase">
        Information du produit
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex justify-center items-center mt-5">
          <img src={`${import.meta.env.REACT_API_URL}uploads/${product?.photos[0]}`} alt="" />
        </div>
        <div>
          <div className="grid grid-cols-2">
            <div className="mt-5">
              <div className="mb-3">
                <p className="font-semibold">Nom : {product?.name}</p>
              </div>
              <div className="mb-3">
                <p className="font-semibold">Prix : {product?.price} €</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-3">
                <p className="font-semibold">Stock : {product?.stock}</p>
              </div>
              <div className="mb-3">
                <p className="font-semibold">Catégorie : {product?.category}</p>
              </div>
            </div>
          </div>
          <p>{product?.description}</p>
        </div>
      </div>

      <div className="mb-3">
        <h1 className="font-semibold mt-5 mb-3">Variants :</h1>
        <form onSubmit={handleSubmitNewVariant}>
          <div className="flex items-center gap-3 ">
            <strong>Ajouter une variante :</strong>
            <input
              type="text"
              name="name"
              placeholder="Nom"
              className="border px-4 py-2"
              onChange={handleVariantChange}
            />
            <input
              type="text"
              name="value"
              placeholder="Valeur"
              className="border px-4 py-2"
              onChange={handleVariantChange}
            />
            <input
              type="number"
              name="additionalPrice"
              placeholder="Prix"
              className="border px-4 py-2"
              onChange={handleVariantChange}
            />
            <button
              className="bg-green-500 px-3 py-3 rounded text-white cursor-pointer"
              type="submit"
            >
              <LiaPlusSolid size={20} />
            </button>
          </div>
        </form>

        <div className="overflow-auto mt-5">
          <table className="w-full border-2">
            <thead>
              <tr>
                <th className="py-3 px-3">Nom</th>
                <th className="py-3 px-3">Valeur</th>
                <th className="py-3 px-3">Prix</th>
               
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(product?.variant )  && product.variant.map((variant) => (
                <tr key={variant._id}>
                  <td className="py-2 px-3 text-center">{variant.name}</td>
                  <td className="py-2 px-3 text-center">{variant.value}</td>
                  <td className="py-2 px-3 text-center">{variant.additionalPrice}</td>
                  <td className="py-2 px-3 text-center">
                    <button className="text-red-500">
                      <LiaTrashAltSolid />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Show;
