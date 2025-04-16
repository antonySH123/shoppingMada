import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaPlusSolid,
  LiaTrashAltSolid,
} from "react-icons/lia";
import { useParams } from "react-router-dom";
import useCSRF from "../../../../helper/useCSRF";
import { toast } from "react-toastify";
import parse from "html-react-parser";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import useFormatter from "../../../../helper/useFormatter";
import Comment from "../../../comment/Comment";
import Preloader from "../../../loading/Preloader";

interface IProductVariant {
  _id?: string;
  name: string;
  values: IVariantValue[];
}

interface IVariantValue {
  value: string;
  additionalPrice?: number;
  stock: number;
}

interface IProduct {
  _id:string
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  details: string;
  variant: IProductVariant[];
  photos: [string];
}

function Show() {
  const [variant, setVariant] = useState<IProductVariant>({
    name: "",
    values: [
      {
        value: "",
        additionalPrice: 0,
        stock: 0,
      },
    ],
  });
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const csrf = useCSRF();
  const { priceInArriary } = useFormatter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  const getProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/product/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données du produit"
        );
      }

      const { data } = await response.json();
      setProduct(data);
    } catch (error) {
      setError("Une erreur est survenue " + error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    console.log(value)
    setVariant((prev) => {
      return {
        ...prev,
        values: [
          {
            ...prev.values[0],
            [name]: name === "additionalPrice" ? parseFloat(value) || 0 : value,
          },
        ],
      };
    });
  };

  const handleSubmitNewVariant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(variant);
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
          getProduct();
        }
      } catch {
        toast.error("Impossible d'ajouter la variante");
      }
    }
  };

  const removeVariant = async(productID:string, variant_id:string, value:string)=>{
   if(csrf){
    const response = await fetch(
      `${import.meta.env.REACT_API_URL}product/${productID}/variant/${variant_id}/${value}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "xsrf-token":csrf
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
     toast.error("Erreur lors de la récupération des données du produit")
    }

    const { message } = await response.json();
    toast.success(message)
    getProduct();
   }
  }

  if (loading) return <p>Chargement des informations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    !csrf ? <Preloader/> :
    <div className="px-10 py-10 border-0 bg-white rounded-lg">
      <h1 className="text-center text-black text-3xl uppercase">
        Information du produit
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex  justify-center items-center mt-5 relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={10}
            slidesPerView={1}
            navigation={{
              prevEl: ".custom-prev",
              nextEl: ".custom-next",
            }}
            loop
          >
            {product?.photos.slice(0, 5).map((photo, index) => (
              <SwiperSlide key={index}>
                <img
                  src={`${import.meta.env.REACT_API_URL}uploads/${photo}`}
                  alt={`Produit ${index + 1}`}
                  className="w-full h-auto max-h-80 object-contain rounded-md"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="custom-prev absolute left-5 top-1/2 transform -translate-y-1/2 bg-slate-100/10  p-2 rounded-full z-10">
            <LiaAngleLeftSolid size={30} />
          </button>
          <button className="custom-next absolute right-5 top-1/2 transform -translate-y-1/2 bg-slate-100/10  p-2 rounded-full z-10">
            <LiaAngleRightSolid size={30} />
          </button>
        </div>

        <div>
          <div className="grid grid-cols-2">
            <div className="mt-5">
              <div className="mb-3">
                <p className="font-semibold">Nom : {product?.name}</p>
              </div>
              <div className="mb-3">
                <p className="font-semibold">
                  Prix : {priceInArriary(product?.price as number)}{" "}
                </p>
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
          <h1 className="font-semibold uppercase">{product?.description}</h1>
          <hr />
          <div className="text-justify mt-2">
            {parse(product?.details as string)}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h1 className="font-semibold mt-5 mb-3">Variants :</h1>
        <form onSubmit={handleSubmitNewVariant}>
          <div className="flex items-center gap-3 ">
            <strong>Ajouter une variante :</strong>
            <div
              className="flex items-center border relative"
              onMouseLeave={() => setIsOpen(false)}
            >
              <input
                type="text"
                name="name"
                placeholder="Nom"
                value={variant.name}
                className="px-4 py-2"
                onChange={(e)=>{
                  setVariant((prev)=>({...prev,name:e.target.value}))
                }}
              />
              <div className="px-2 py-3 cursor-pointer" onClick={handleIsOpen}>
                <LiaAngleRightSolid
                  size={19}
                  className={`${
                    isOpen ? "rotate-90" : "rotate-0"
                  } transition-all ease-in-out`}
                />
              </div>

              <ul
                className={`${
                  isOpen
                    ? "w-full py-3 absolute top-full left-0 bg-white border "
                    : "hidden"
                } transition-all ease-in-out`}
              >
                {Array.isArray(product?.variant) &&
                  product.variant.map((variant) => (
                    <li
                      className="py-3 px-3 cursor-pointer hover:bg-gray-400"
                      key={variant._id}
                      onClick={() => {
                        setVariant((prev) => ({
                          ...prev,
                          name: variant.name,
                        }));
                      }}
                    >
                      {variant.name}
                    </li>
                  ))}
              </ul>
            </div>
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
              {Array.isArray(product?.variant) &&
                product.variant.map((variant) =>
                  variant.values.map((v, index) => (
                    <tr key={variant._id}>
                      {index === 0 && (
                        <td
                          className="py-2 px-3 text-center"
                          rowSpan={variant.values.length}
                        >
                          {variant.name}
                        </td>
                      )}
                      <td className="py-2 px-3 text-center">{v.value}</td>
                      <td className="py-2 px-3 text-center">
                        {v.additionalPrice}
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button className="text-red-500" onClick={()=> removeVariant(product._id,variant._id as string,v.value as string)}>
                          <LiaTrashAltSolid />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>

      <Comment product_id={id as string} csrf={csrf as string}/>
    </div>
  );
}

export default Show;
