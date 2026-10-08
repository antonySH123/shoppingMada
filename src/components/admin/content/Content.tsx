import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import IProduct from "../../../Interface/IProduct";
import { LiaEdit, LiaEye, LiaTrashAltSolid } from "react-icons/lia";
import Dialog from "../../modals/Dialog";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import Preloader from "../../loading/Preloader";
import {
  DataTable,
  PageHeader,
  RowActions,
  StatusBadge,
  type AdminDataColumn,
} from "../ui";
import useFormatter from "../../../helper/useFormatter";

function Content() {
  const csrf = useCSRF();
  const navigate = useNavigate();
  const { priceInArriary } = useFormatter();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [title, setTitle] = useState("Confirmation");
  const close = () => setOpenDialog(false);
  const [products, setProduct] = useState<IProduct[]>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/product?page=${page}&limit=20&status=${encodeURIComponent(status)}&search=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Erreur lors de la récupération des produits");
      }
      const result = await response.json();
      setProduct(result.data ?? []);
      setPages(result.pagination?.pages ?? 1);
      setTotal(result.pagination?.total ?? 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Catalogue indisponible.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

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
      id: "publicationStatus",
      header: "Publication",
      render: (product) => {
        const status = product.publicationStatus ?? "Pending";
        return (
          <div className="grid justify-items-start gap-1">
            <StatusBadge
              status={status}
              label={
                status === "Approved"
                  ? "Publié"
                  : status === "Rejected"
                    ? "Refusé"
                    : "En attente"
              }
            />
            {status === "Rejected" && product.moderationReason && (
              <span className="max-w-xs whitespace-normal text-xs text-[var(--admin-danger)]">
                Motif : {product.moderationReason}
              </span>
            )}
          </div>
        );
      },
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
        description="Gérez vos produits et suivez leur statut de publication. Chaque nouveau produit ou modification doit être approuvé avant sa mise en ligne."
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
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <label className="grid min-w-[14rem] flex-1 gap-1 text-xs font-bold text-[var(--admin-muted)]">Rechercher un produit<input className="admin-input min-h-10" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nom ou description" /></label>
          <label className="grid min-w-44 gap-1 text-xs font-bold text-[var(--admin-muted)]">Publication<select className="admin-input min-h-10" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">Tous les statuts</option><option value="Approved">Publié</option><option value="Pending">En attente</option><option value="Rejected">Refusé</option></select></label>
          <span className="pb-2 text-xs text-[var(--admin-muted)]">{total} produit(s)</span>
        </div>
        {loadError && <div role="alert" className="mb-3 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-[var(--admin-danger)]">{loadError} <button type="button" className="ml-2 underline" onClick={() => void fetchData()}>Réessayer</button></div>}
        <DataTable
          columns={productColumns}
          rows={products ?? []}
          getRowKey={(product) => product._id}
          loading={loading}
          pageSize={20}
          emptyTitle="Votre catalogue est vide"
          emptyDescription={search || status !== "all" ? "Aucun produit ne correspond à ces filtres." : "Ajoutez votre premier produit pour commencer à vendre."}
        />
        {!loading && pages > 1 && <div className="admin-table-pagination mt-3"><span>Page {page} sur {pages}</span><div><button type="button" className="admin-button admin-button--outline admin-button--sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Précédent</button><button type="button" className="admin-button admin-button--outline admin-button--sm" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Suivant</button></div></div>}
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
