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
import {
  AdminButton,
  AdminInput,
  DataTable,
  PageHeader,
  type AdminDataColumn,
} from "../../ui";

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
  _id: string;
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
  const variantRows =
    product?.variant.flatMap((productVariant) =>
      productVariant.values.map((value) => ({
        id: `${productVariant._id}-${value.value}`,
        variantId: productVariant._id as string,
        name: productVariant.name,
        value: value.value,
        additionalPrice: value.additionalPrice ?? 0,
      })),
    ) ?? [];
  const variantColumns: AdminDataColumn<(typeof variantRows)[number]>[] = [
    {
      id: "name",
      header: "Groupe",
      render: (row) => <strong>{row.name}</strong>,
      sortValue: (row) => row.name,
    },
    {
      id: "value",
      header: "Valeur",
      render: (row) => row.value,
      sortValue: (row) => row.value,
    },
    {
      id: "price",
      header: "Supplément",
      render: (row) => priceInArriary(row.additionalPrice),
      sortValue: (row) => row.additionalPrice,
    },
    {
      id: "action",
      header: "Action",
      className: "text-right",
      render: (row) => (
        <button
          type="button"
          className="admin-button admin-button--danger admin-button--icon"
          aria-label={`Supprimer la valeur ${row.value}`}
          title={`Supprimer ${row.value}`}
          onClick={() =>
            void removeVariant(product?._id ?? "", row.variantId, row.value)
          }
        >
          <LiaTrashAltSolid />
        </button>
      ),
    },
  ];

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
        },
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données du produit",
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
          },
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

  const removeVariant = async (
    productID: string,
    variant_id: string,
    value: string,
  ) => {
    if (csrf) {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}product/${productID}/variant/${variant_id}/${value}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        toast.error("Erreur lors de la récupération des données du produit");
      }

      const { message } = await response.json();
      toast.success(message);
      getProduct();
    }
  };

  if (loading) return <p>Chargement des informations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Catalogue boutique"
        title={product?.name ?? "Détail du produit"}
        description="Consultez les informations du produit et gérez ses variantes."
      />

      <section className="admin-panel grid min-w-0 gap-5 p-4 sm:p-6 xl:grid-cols-2">
        <div className="admin-product-gallery relative flex min-w-0 items-center justify-center">
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
                  className="admin-product-gallery-image"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            aria-label="Photo précédente"
            className="custom-prev admin-button admin-button--secondary admin-button--icon absolute left-3 top-1/2 z-10 -translate-y-1/2"
          >
            <LiaAngleLeftSolid size={30} />
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            className="custom-next admin-button admin-button--secondary admin-button--icon absolute right-3 top-1/2 z-10 -translate-y-1/2"
          >
            <LiaAngleRightSolid size={30} />
          </button>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="admin-product-detail">
              <span>Prix</span>
              <strong>{priceInArriary(product?.price as number)}</strong>
            </div>
            <div className="admin-product-detail">
              <span>Stock</span>
              <strong className="tabular-nums">{product?.stock}</strong>
            </div>
            <div className="admin-product-detail col-span-2">
              <span>Catégorie</span>
              <strong>{product?.category}</strong>
            </div>
          </div>

          <section>
            <h2 className="admin-subsection-title">Description</h2>
            <p className="admin-product-description">{product?.description}</p>
          </section>

          <section className="admin-product-description-content">
            {parse(product?.details as string)}
          </section>
        </div>
      </section>

      <section className="admin-panel space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="admin-subsection-title">Variantes du produit</h2>
          <p className="admin-helper-text">
            Ajoutez une valeur et son éventuel supplément de prix.
          </p>
        </div>

        <form onSubmit={handleSubmitNewVariant} className="admin-variant-form">
          <AdminInput
            label="Nom de la variante"
            value={variant.name}
            onChange={(event) =>
              setVariant((prev) => ({ ...prev, name: event.target.value }))
            }
          />

          <div className="relative" onMouseLeave={() => setIsOpen(false)}>
            <AdminButton
              type="button"
              variant="outline"
              aria-expanded={isOpen}
              aria-controls="existing-variants"
              onClick={handleIsOpen}
            >
              Choisir un groupe existant
              <span aria-hidden="true" className={isOpen ? "rotate-90" : ""}>
                <LiaAngleRightSolid size={16} />
              </span>
            </AdminButton>

            <ul
              id="existing-variants"
              className={`admin-variant-picker ${isOpen ? "is-open" : ""}`}
            >
              {Array.isArray(product?.variant) &&
                product.variant.map((productVariant) => (
                  <li key={productVariant._id}>
                    <button
                      type="button"
                      onClick={() =>
                        setVariant((prev) => ({
                          ...prev,
                          name: productVariant.name,
                        }))
                      }
                    >
                      {productVariant.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <AdminInput
            label="Valeur"
            name="value"
            onChange={handleVariantChange}
          />
          <AdminInput
            label="Supplément (Ar)"
            type="number"
            name="additionalPrice"
            onChange={handleVariantChange}
          />
          <AdminButton type="submit" variant="primary" size="md">
            <LiaPlusSolid /> Ajouter
          </AdminButton>
        </form>

        <DataTable
          columns={variantColumns}
          rows={variantRows}
          getRowKey={(row) => row.id}
          emptyTitle="Aucune variante"
          emptyDescription="Les options de ce produit apparaîtront ici."
        />
      </section>

      <Comment product_id={id as string} csrf={csrf as string} />
    </div>
  );
}

export default Show;
