import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import IProduct from "../../../Interface/IProduct";
import { LiaEdit, LiaEye, LiaTrashAltSolid } from "react-icons/lia";
import Dialog from "../../modals/Dialog";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import Preloader from "../../loading/Preloader";
import { DataTable, PageHeader, RowActions, type AdminDataColumn } from "../ui";
import useFormatter from "../../../helper/useFormatter";

function Content() {
  const csrf = useCSRF();
  const navigate = useNavigate();
  const { priceInArriary } = useFormatter();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [title, setTitle] = useState("Confirmation");
  const close = () => setOpenDialog(false);
  const [products, setProduct] = useState<IProduct[]>();
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/product`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }
      if (response.status == 200) {
        const result = await response.json();
        setProduct(result.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, []);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const productColumns: AdminDataColumn<IProduct>[] = [
    {
      id: "number",
      header: "#",
      render: (_product, index) => (
        <span className="tabular-nums">{index + 1}</span>
      ),
    },
    {
      id: "name",
      header: "Produit",
      render: (product) => <strong>{product.name}</strong>,
      sortValue: (product) => product.name,
    },
    {
      id: "description",
      header: "Description",
      render: (product) => (
        <span className="line-clamp-2 max-w-md">{product.description}</span>
      ),
    },
    {
      id: "price",
      header: "Prix",
      render: (product) => priceInArriary(product.price),
      sortValue: (product) => product.price,
    },
    {
      id: "stock",
      header: "Stock",
      render: (product) => (
        <span className="tabular-nums">{product.stock ?? "—"}</span>
      ),
      sortValue: (product) => product.stock ?? 0,
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      render: (product) => (
        <RowActions
          actions={[
            {
              id: "view",
              label: "Voir le produit",
              icon: <LiaEye />,
              onSelect: () => navigate(product._id),
            },
            {
              id: "edit",
              label: "Modifier le produit",
              icon: <LiaEdit />,
              onSelect: () =>
                navigate(`/espace_vendeur/admin/addProduct/${product._id}`),
            },
            {
              id: "delete",
              label: "Supprimer le produit",
              icon: <LiaTrashAltSolid />,
              destructive: true,
              confirmBeforeAction: false,
              onSelect: () => {
                setSelectedProductId(product._id);
                setTitle("Êtes-vous sûr de vouloir supprimer ce produit ?");
                setOpenDialog(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  const handleDeleteProduct = async () => {
    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}shop/product/${selectedProductId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
          },
        );

        if (response.ok) {
          toast.success("Produit supprimé avec succès!");
          setOpenDialog(false);
          fetchData(); // Rafraîchir la liste des produits après suppression
        } else {
          toast.error("Une erreur s'est produite lors de la suppression.");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur serveur, veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-4 py-2">
      <PageHeader
        eyebrow="Catalogue boutique"
        title="Produits"
        description="Gérez votre catalogue, vos tarifs et les niveaux de stock."
        action={
          <button
            type="button"
            className="admin-button admin-button--primary admin-button--lg"
            onClick={() => navigate("/espace_vendeur/admin/addProduct")}
          >
            <span aria-hidden="true">+</span>Nouveau produit
          </button>
        }
      />
      <section className="admin-panel p-3 sm:p-4">
        <DataTable
          columns={productColumns}
          rows={products ?? []}
          getRowKey={(product) => product._id}
          loading={!products}
          emptyTitle="Votre catalogue est vide"
          emptyDescription="Ajoutez votre premier produit pour commencer à vendre."
        />
      </section>
      <Dialog
        title={title}
        message={""}
        ok={handleDeleteProduct}
        onClose={close}
        isOpen={openDialog}
      />
    </div>
  );
}

export default Content;
