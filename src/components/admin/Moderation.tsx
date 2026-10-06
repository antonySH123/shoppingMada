import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../../helper/useCSRF";
import { useAuth } from "../../helper/useAuth";
import { AdminButton, PageHeader, StatusBadge } from "./ui";

type PublicationStatus = "Pending" | "Approved" | "Rejected";
type QueueFilter = "All" | PublicationStatus;

interface ModerationProduct {
  _id: string;
  name: string;
  description: string;
  details?: string;
  price: number;
  photos?: string[];
  createdAt?: string;
  publicationStatus?: PublicationStatus;
  moderationReason?: string;
  owner_id?: { username?: string; email?: string } | string;
  boutiks_id?: { name?: string } | string;
}

interface ModerationComment {
  _id: string;
  comment: string;
  createdAt?: string;
  moderationStatus?: PublicationStatus;
  moderationReason?: string;
  owner_id?: { username?: string } | string;
  product_id?: { _id?: string; name?: string } | string;
}

const statusLabel: Record<PublicationStatus, string> = {
  Pending: "En attente",
  Approved: "Approuvé",
  Rejected: "Refusé",
};

const displayName = (value?: { name?: string; username?: string } | string) =>
  typeof value === "string" ? value : (value?.name ?? value?.username ?? "—");

function Moderation() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const [products, setProducts] = useState<ModerationProduct[]>([]);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [filter, setFilter] = useState<QueueFilter>("Pending");
  const [productReasons, setProductReasons] = useState<Record<string, string>>(
    {},
  );
  const [commentReasons, setCommentReasons] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadQueues = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [productResponse, commentResponse] = await Promise.all([
        fetch(`${import.meta.env.REACT_API_URL}admin/products`, {
          credentials: "include",
          signal,
        }),
        fetch(`${import.meta.env.REACT_API_URL}admin/comments`, {
          credentials: "include",
          signal,
        }),
      ]);
      const [productResult, commentResult] = await Promise.all([
        productResponse.json(),
        commentResponse.json(),
      ]);
      if (!productResponse.ok || !commentResponse.ok) {
        throw new Error(
          productResult.message ||
            commentResult.message ||
            "Impossible de charger la modération.",
        );
      }
      const nextProducts = Array.isArray(productResult.data)
        ? productResult.data
        : [];
      const nextComments = Array.isArray(commentResult.data)
        ? commentResult.data
        : [];
      setProducts(nextProducts);
      setComments(nextComments);
      setProductReasons(
        Object.fromEntries(
          nextProducts.map((item: ModerationProduct) => [
            item._id,
            item.moderationReason ?? "",
          ]),
        ),
      );
      setCommentReasons(
        Object.fromEntries(
          nextComments.map((item: ModerationComment) => [
            item._id,
            item.moderationReason ?? "",
          ]),
        ),
      );
    } catch (error) {
      if (!signal?.aborted)
        toast.error(
          error instanceof Error ? error.message : "Erreur de chargement.",
        );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadQueues(controller.signal);
    return () => controller.abort();
  }, [loadQueues]);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (item) =>
          filter === "All" || (item.publicationStatus ?? "Pending") === filter,
      ),
    [filter, products],
  );
  const visibleComments = useMemo(
    () =>
      comments.filter(
        (item) =>
          filter === "All" || (item.moderationStatus ?? "Pending") === filter,
      ),
    [comments, filter],
  );
  const pendingCount =
    products.filter(
      (item) => !item.publicationStatus || item.publicationStatus === "Pending",
    ).length +
    comments.filter(
      (item) => !item.moderationStatus || item.moderationStatus === "Pending",
    ).length;

  const updateStatus = async (
    kind: "products" | "comments",
    id: string,
    status: Exclude<PublicationStatus, "Pending">,
  ) => {
    if (!csrf || updatingId) return;
    const reason =
      kind === "products"
        ? productReasons[id]?.trim()
        : commentReasons[id]?.trim();
    if (status === "Rejected" && !reason) {
      toast.warning("Ajoutez un motif avant de refuser cet élément.");
      return;
    }
    setUpdatingId(id);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}admin/${kind}/${id}/moderation`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          credentials: "include",
          body: JSON.stringify({
            [kind === "products" ? "publicationStatus" : "moderationStatus"]:
              status,
            moderationReason: status === "Rejected" ? reason : "",
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "La décision n’a pas été enregistrée.",
        );
      if (kind === "products") {
        setProducts((current) =>
          current.map((item) =>
            item._id === id
              ? {
                  ...item,
                  publicationStatus: status,
                  moderationReason: status === "Rejected" ? reason : "",
                }
              : item,
          ),
        );
      } else {
        setComments((current) =>
          current.map((item) =>
            item._id === id
              ? {
                  ...item,
                  moderationStatus: status,
                  moderationReason: status === "Rejected" ? reason : "",
                }
              : item,
          ),
        );
      }
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "La décision n’a pas été enregistrée.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (user?.userGroupMember_id?.usergroup_id?.name !== "Super Admin") {
    return <Navigate to="/espace_vendeur/dash" replace />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Contrôle de la marketplace"
        title="Modération des publications"
        description={`${pendingCount} élément${pendingCount > 1 ? "s" : ""} en attente. Les produits et commentaires ne deviennent visibles qu’après approbation.`}
        action={
          <label className="admin-field min-w-40">
            <span>Afficher</span>
            <select
              className="admin-field__control"
              value={filter}
              onChange={(event) => setFilter(event.target.value as QueueFilter)}
            >
              <option value="Pending">En attente</option>
              <option value="Approved">Approuvés</option>
              <option value="Rejected">Refusés</option>
              <option value="All">Tout</option>
            </select>
          </label>
        }
      />

      <section className="admin-panel">
        <header className="admin-panel-heading">
          <div>
            <h2>Produits des vendeurs</h2>
            <p>
              Les fiches nouvelles ou modifiées restent masquées jusqu’à
              validation.
            </p>
          </div>
          <StatusBadge
            status="Pending"
            label={`${products.filter((item) => !item.publicationStatus || item.publicationStatus === "Pending").length} en attente`}
          />
        </header>
        <div className="grid gap-3 p-3 sm:p-4">
          {loading ? (
            <p className="admin-empty-state">Chargement des publications…</p>
          ) : visibleProducts.length === 0 ? (
            <p className="admin-empty-state">Aucun produit dans ce filtre.</p>
          ) : (
            visibleProducts.map((item) => {
              const status = item.publicationStatus ?? "Pending";
              return (
                <article
                  key={item._id}
                  className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[var(--admin-text)]">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--admin-muted)]">
                        Boutique : {displayName(item.boutiks_id)} · Vendeur :{" "}
                        {displayName(item.owner_id)}
                      </p>
                    </div>
                    <StatusBadge status={status} label={statusLabel[status]} />
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--admin-muted)]">
                    {item.description}
                  </p>
                  {item.photos?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.photos.map((photo) => (
                        <img
                          key={photo}
                          src={`${import.meta.env.REACT_API_URL}uploads/${photo}`}
                          alt={`Photo du produit ${item.name}`}
                          loading="lazy"
                          className="h-20 w-20 rounded-md border border-[var(--admin-border)] object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  {item.details && (
                    <details className="mt-3 text-sm text-[var(--admin-muted)]">
                      <summary className="cursor-pointer font-semibold text-[var(--admin-text)]">
                        Voir la description détaillée
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap">
                        {item.details.replace(/<[^>]*>/g, " ").trim()}
                      </p>
                    </details>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--admin-muted)]">
                    <span>
                      Prix : {new Intl.NumberFormat("fr-FR").format(item.price)}{" "}
                      Ar
                    </span>
                    {item.createdAt && (
                      <time dateTime={item.createdAt}>
                        {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                      </time>
                    )}
                  </div>
                  {item.moderationReason && status === "Rejected" && (
                    <p className="mt-3 text-sm text-[var(--admin-danger)]">
                      Motif précédent : {item.moderationReason}
                    </p>
                  )}
                  <label className="admin-field mt-4">
                    <span>
                      Motif de refus{" "}
                      {status !== "Rejected" && "(requis pour refuser)"}
                    </span>
                    <textarea
                      className="admin-field__control min-h-20"
                      maxLength={500}
                      value={productReasons[item._id] ?? ""}
                      onChange={(event) =>
                        setProductReasons((current) => ({
                          ...current,
                          [item._id]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <AdminButton
                      size="sm"
                      variant="danger"
                      disabled={updatingId !== null}
                      onClick={() =>
                        void updateStatus("products", item._id, "Rejected")
                      }
                    >
                      {updatingId === item._id ? "Enregistrement…" : "Refuser"}
                    </AdminButton>
                    <AdminButton
                      size="sm"
                      variant="primary"
                      disabled={updatingId !== null}
                      onClick={() =>
                        void updateStatus("products", item._id, "Approved")
                      }
                    >
                      {updatingId === item._id
                        ? "Enregistrement…"
                        : "Approuver"}
                    </AdminButton>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="admin-panel">
        <header className="admin-panel-heading">
          <div>
            <h2>Commentaires</h2>
            <p>Les commentaires sont publiés uniquement après validation.</p>
          </div>
          <StatusBadge
            status="Pending"
            label={`${comments.filter((item) => !item.moderationStatus || item.moderationStatus === "Pending").length} en attente`}
          />
        </header>
        <div className="grid gap-3 p-3 sm:p-4">
          {loading ? (
            <p className="admin-empty-state">Chargement des commentaires…</p>
          ) : visibleComments.length === 0 ? (
            <p className="admin-empty-state">
              Aucun commentaire dans ce filtre.
            </p>
          ) : (
            visibleComments.map((item) => {
              const status = item.moderationStatus ?? "Pending";
              return (
                <article
                  key={item._id}
                  className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[var(--admin-text)]">
                        {displayName(item.product_id)}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--admin-muted)]">
                        Par {displayName(item.owner_id)}
                        {item.createdAt
                          ? ` · ${new Date(item.createdAt).toLocaleDateString("fr-FR")}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={status} label={statusLabel[status]} />
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--admin-text)]">
                    {item.comment}
                  </p>
                  {item.moderationReason && status === "Rejected" && (
                    <p className="mt-3 text-sm text-[var(--admin-danger)]">
                      Motif précédent : {item.moderationReason}
                    </p>
                  )}
                  <label className="admin-field mt-4">
                    <span>
                      Motif de refus{" "}
                      {status !== "Rejected" && "(requis pour refuser)"}
                    </span>
                    <textarea
                      className="admin-field__control min-h-20"
                      maxLength={500}
                      value={commentReasons[item._id] ?? ""}
                      onChange={(event) =>
                        setCommentReasons((current) => ({
                          ...current,
                          [item._id]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <AdminButton
                      size="sm"
                      variant="danger"
                      disabled={updatingId !== null}
                      onClick={() =>
                        void updateStatus("comments", item._id, "Rejected")
                      }
                    >
                      {updatingId === item._id ? "Enregistrement…" : "Refuser"}
                    </AdminButton>
                    <AdminButton
                      size="sm"
                      variant="primary"
                      disabled={updatingId !== null}
                      onClick={() =>
                        void updateStatus("comments", item._id, "Approved")
                      }
                    >
                      {updatingId === item._id
                        ? "Enregistrement…"
                        : "Approuver"}
                    </AdminButton>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default Moderation;
