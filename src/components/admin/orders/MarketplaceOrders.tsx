import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import useFormatter from "../../../helper/useFormatter";
import { useAuth } from "../../../helper/useAuth";
import Preloader from "../../loading/Preloader";

type SubOrder = {
  _id: string;
  boutiks_id: { _id: string; name?: string } | string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  deliveryFee: number;
  payableTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  paymentDeclaration?: { reference: string; evidencePath?: string };
  shipping: {
    recipientName: string;
    phone: string;
    address: string;
    city?: string;
    carrier?: string;
    trackingNumber?: string;
  };
};
type MarketplaceOrder = {
  _id: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city?: string;
  };
  subOrders: SubOrder[];
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  en_attente_vendeur: "À traiter",
  en_attente_paiement: "En attente de paiement client",
  paiement_declare: "Paiement déclaré",
  paiement_confirme: "Paiement confirmé",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  terminee: "Terminée",
  annulee: "Annulée",
  refusee: "Refusée",
  expiree: "Expirée",
  litige: "En litige",
  partiellement_terminee: "Partiellement terminée",
};
const methodLabels: Record<string, string> = {
  mvola: "MVola",
  orange_money: "Orange Money",
  airtel_money: "Airtel Money",
  virement: "Virement bancaire",
  paiement_livraison: "Paiement à la livraison",
};

function MarketplaceOrders() {
  const csrf = useCSRF();
  const { user } = useAuth();
  const { priceInArriary } = useFormatter();
  const role = user?.userGroupMember_id?.usergroup_id?.name;
  const isSeller = role === "Boutiks";
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refusalDraft, setRefusalDraft] = useState<Record<string, string>>({});
  const [shippingDraft, setShippingDraft] = useState<
    Record<string, { carrier: string; trackingNumber: string }>
  >({});
  const [shippingFormId, setShippingFormId] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders?page=${page}&limit=20&status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(searchQuery)}`,
        { credentials: "include" },
      );
      const result = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error(
          "L’API marketplace n’est pas encore déployée sur le serveur. Déployez la dernière version backend.",
        );
      }
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de charger les commandes.",
        );
      setOrders(result.data);
      setPages(result.pagination?.pages ?? 1);
      setTotalOrders(result.pagination?.total ?? 0);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Erreur de chargement des commandes.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const performAction = async (
    orderId: string,
    subOrder: SubOrder,
    action: "status" | "confirm-payment",
    status?: string,
    payload: Record<string, unknown> = {},
  ) => {
    if (!csrf || busyId) return;
    setBusyId(subOrder._id);
    try {
      const suffix =
        action === "confirm-payment" ? "confirm-payment" : "status";
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/${orderId}/suborders/${subOrder._id}/${suffix}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          body: JSON.stringify(
            action === "confirm-payment" ? payload : { ...payload, status },
          ),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de mettre à jour la sous-commande.",
        );
      toast.success(result.message || "Sous-commande mise à jour.");
      setShippingFormId("");
      await loadOrders();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setBusyId("");
    }
  };

  if (!csrf) return <Preloader />;

  const visibleOrders = orders;
  const statuses = Object.keys(statusLabels);

  return (
    <section className="space-y-5">
      <header className="admin-toolbar">
        <div>
          <p className="admin-kicker">Opérations marketplace</p>
          <h1 className="admin-panel-title text-2xl">
            {isSeller ? "Commandes de la boutique" : "Commandes multi-vendeurs"}
          </h1>
            <p className="admin-panel-subtitle mt-1 text-sm">{totalOrders} commande(s) · chaque boutique suit son paiement et sa livraison.</p>
        </div>
        <div className="admin-toolbar-actions">
          <label className="grid gap-1 text-xs font-bold text-[var(--admin-muted)]">Recherche client
            <input className="admin-input min-h-11" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nom ou téléphone" aria-label="Rechercher par nom ou téléphone" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-[var(--admin-muted)]">
            Statut
            <select
              className="admin-input min-h-11"
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
            >
              <option value="all">Tous les statuts</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status] ?? status}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="admin-button-secondary min-h-11"
          >
            Actualiser
          </button>
        </div>
      </header>

      {loading ? (
        <div className="admin-panel p-8 text-center text-sm text-[var(--admin-muted)]">
          Chargement des commandes…
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="admin-panel border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"
        >
          <p className="font-bold">
            Impossible de charger les commandes marketplace
          </p>
          <p className="mt-1">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="admin-button-secondary mt-4 min-h-10"
          >
            Réessayer
          </button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="admin-panel p-10 text-center">
          <h2 className="font-bold text-[var(--admin-text)]">
            Aucune sous-commande
          </h2>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Les nouvelles commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        visibleOrders.map((order) => (
          <article key={order._id} className="admin-panel">
            <header className="admin-panel-heading">
              <div>
                <p className="admin-panel-kicker">
                  Commande groupée ·{" "}
                  {new Date(order.createdAt).toLocaleString("fr-FR")}
                </p>
                <h2 className="admin-panel-title">{order.customer.name}</h2>
                <p className="admin-panel-subtitle">
                  {order.customer.phone}
                  {order.customer.city
                    ? ` · ${order.customer.city}`
                    : ""} · {order.customer.address}
                </p>
              </div>
              <span className="admin-status-badge admin-status-info">
                {statusLabels[order.status] ?? order.status}
              </span>
            </header>
            <div className="space-y-4 p-4 sm:p-5">
              {order.subOrders.map((subOrder) => {
                const shopName =
                  typeof subOrder.boutiks_id === "string"
                    ? "Boutique"
                    : (subOrder.boutiks_id.name ?? "Boutique");
                const draft = shippingDraft[subOrder._id] ?? {
                  carrier: "",
                  trackingNumber: "",
                };
                const canSellerAct = isSeller;
                return (
                  <section
                    key={subOrder._id}
                    className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
                  >
                    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-surface-raised)] px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-[var(--admin-text)]">
                          {shopName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
                          {statusLabels[subOrder.status] ?? subOrder.status}
                        </p>
                      </div>
                      <strong className="text-sm text-[var(--admin-text)]">
                        {priceInArriary(subOrder.payableTotal)}
                      </strong>
                    </header>
                    <div className="space-y-3 p-4">
                      <div className="space-y-1">
                        {subOrder.items.map((item, index) => (
                          <div
                            key={`${item.name}-${index}`}
                            className="flex justify-between gap-3 text-xs"
                          >
                            <span className="text-[var(--admin-muted)]">
                              {item.quantity} × {item.name}
                            </span>
                            <strong className="text-[var(--admin-text)]">
                              {priceInArriary(item.quantity * item.unitPrice)}
                            </strong>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--admin-border)] pt-3 text-xs text-[var(--admin-muted)]">
                        <span>
                          Sous-total : {priceInArriary(subOrder.subtotal)}
                        </span>
                        <span>
                          Livraison : {priceInArriary(subOrder.deliveryFee)}
                        </span>
                        <span>
                          Paiement :{" "}
                          {methodLabels[subOrder.paymentMethod] ??
                            subOrder.paymentMethod}
                        </span>
                        <span>Statut paiement : {subOrder.paymentStatus}</span>
                      </div>
                      {subOrder.paymentDeclaration && (
                        <div className="rounded-lg bg-sky-50 p-3 text-xs text-sky-900">
                          <p>
                            Référence communiquée :{" "}
                            <strong>
                              {subOrder.paymentDeclaration.reference}
                            </strong>
                          </p>
                          {subOrder.paymentDeclaration.evidencePath && (
                            <a
                              href={`${import.meta.env.REACT_API_URL}marketplace/orders/${order._id}/suborders/${subOrder._id}/evidence`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex font-bold underline"
                            >
                              Voir la capture fournie
                            </a>
                          )}
                        </div>
                      )}
                      {subOrder.shipping.trackingNumber && (
                        <p className="text-xs text-[var(--admin-muted)]">
                          Expédition :{" "}
                          {subOrder.shipping.carrier || "Transporteur"} ·{" "}
                          {subOrder.shipping.trackingNumber}
                        </p>
                      )}
                      {canSellerAct && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                          {subOrder.status === "en_attente_vendeur" && (
                            <>
                              {subOrder.paymentMethod ===
                              "paiement_livraison" ? (
                                <button
                                  disabled={!!busyId}
                                  onClick={() =>
                                    void performAction(
                                      order._id,
                                      subOrder,
                                      "status",
                                      "en_preparation",
                                    )
                                  }
                                  className="admin-button-primary min-h-10 px-3 text-xs"
                                >
                                  Accepter et préparer
                                </button>
                              ) : (
                                <button
                                  disabled={!!busyId}
                                  onClick={() =>
                                    void performAction(
                                      order._id,
                                      subOrder,
                                      "status",
                                      "en_attente_paiement",
                                    )
                                  }
                                  className="admin-button-primary min-h-10 px-3 text-xs"
                                >
                                  Accepter, demander le paiement
                                </button>
                              )}
                              <input
                                aria-label="Motif de refus"
                                placeholder="Motif du refus"
                                value={refusalDraft[subOrder._id] ?? ""}
                                onChange={(event) =>
                                  setRefusalDraft((current) => ({
                                    ...current,
                                    [subOrder._id]: event.target.value,
                                  }))
                                }
                                className="admin-input min-h-10 max-w-56 text-xs"
                              />
                              <button
                                disabled={
                                  !!busyId ||
                                  !refusalDraft[subOrder._id]?.trim()
                                }
                                onClick={() =>
                                  void performAction(
                                    order._id,
                                    subOrder,
                                    "status",
                                    "refusee",
                                    { reason: refusalDraft[subOrder._id] },
                                  )
                                }
                                className="admin-button-danger min-h-10 px-3 text-xs"
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          {subOrder.status === "paiement_declare" && (
                            <button
                              disabled={!!busyId}
                              onClick={() =>
                                void performAction(
                                  order._id,
                                  subOrder,
                                  "confirm-payment",
                                )
                              }
                              className="admin-button-primary min-h-10 px-3 text-xs"
                            >
                              Confirmer la réception du paiement
                            </button>
                          )}
                          {subOrder.status === "paiement_confirme" && (
                            <button
                              disabled={!!busyId}
                              onClick={() =>
                                void performAction(
                                  order._id,
                                  subOrder,
                                  "status",
                                  "en_preparation",
                                )
                              }
                              className="admin-button-primary min-h-10 px-3 text-xs"
                            >
                              Mettre en préparation
                            </button>
                          )}
                          {subOrder.status === "en_preparation" &&
                            (shippingFormId === subOrder._id ? (
                              <form
                                className="flex w-full flex-wrap items-end gap-2"
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  void performAction(
                                    order._id,
                                    subOrder,
                                    "status",
                                    "expediee",
                                    draft,
                                  );
                                }}
                              >
                                <label className="grid gap-1 text-[10px] font-bold text-[var(--admin-muted)]">
                                  Transporteur
                                  <input
                                    className="admin-input min-h-10"
                                    value={draft.carrier}
                                    onChange={(event) =>
                                      setShippingDraft((current) => ({
                                        ...current,
                                        [subOrder._id]: {
                                          ...draft,
                                          carrier: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>
                                <label className="grid gap-1 text-[10px] font-bold text-[var(--admin-muted)]">
                                  N° de suivi
                                  <input
                                    className="admin-input min-h-10"
                                    value={draft.trackingNumber}
                                    onChange={(event) =>
                                      setShippingDraft((current) => ({
                                        ...current,
                                        [subOrder._id]: {
                                          ...draft,
                                          trackingNumber: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>
                                <button className="admin-button-primary min-h-10 px-3 text-xs">
                                  Confirmer l’expédition
                                </button>
                              </form>
                            ) : (
                              <button
                                disabled={!!busyId}
                                onClick={() => setShippingFormId(subOrder._id)}
                                className="admin-button-primary min-h-10 px-3 text-xs"
                              >
                                Préparer l’expédition
                              </button>
                            ))}
                          {subOrder.status === "expediee" && (
                            <button
                              disabled={!!busyId}
                              onClick={() =>
                                void performAction(
                                  order._id,
                                  subOrder,
                                  "status",
                                  "livree",
                                )
                              }
                              className="admin-button-primary min-h-10 px-3 text-xs"
                            >
                              Marquer livrée
                            </button>
                          )}
                          {subOrder.status === "livree" &&
                            subOrder.paymentMethod === "paiement_livraison" &&
                            subOrder.paymentStatus !== "confirme" && (
                              <button
                                disabled={!!busyId}
                                onClick={() =>
                                  void performAction(
                                    order._id,
                                    subOrder,
                                    "confirm-payment",
                                  )
                                }
                                className="admin-button-secondary min-h-10 px-3 text-xs"
                              >
                                Confirmer l’encaissement à la livraison
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </article>
        ))
      )}
      {pages > 1 && <div className="admin-panel flex items-center justify-between gap-3 p-4"><button type="button" className="admin-button-secondary min-h-10" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Précédent</button><span>Page {page} / {pages}</span><button type="button" className="admin-button-secondary min-h-10" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}>Suivant</button></div>}
    </section>
  );
}

export default MarketplaceOrders;
