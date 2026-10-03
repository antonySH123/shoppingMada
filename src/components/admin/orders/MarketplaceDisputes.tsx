import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import useFormatter from "../../../helper/useFormatter";
import Preloader from "../../loading/Preloader";

interface DisputedSubOrder {
  _id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  payableTotal: number;
  paymentDeclaration?: { reference: string; evidencePath?: string };
  boutiks_id: { name?: string; phoneNumber?: string; email?: string } | string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  statusHistory: Array<{
    status: string;
    actor: string;
    note?: string;
    createdAt: string;
  }>;
}
interface DisputedOrder {
  _id: string;
  customer: { name: string; phone: string; email?: string; address: string };
  subOrders: DisputedSubOrder[];
  createdAt: string;
}

const resolutions = [
  { value: "annulee", label: "Annuler la sous-commande" },
  { value: "paiement_confirme", label: "Confirmer le paiement" },
  { value: "en_preparation", label: "Autoriser la préparation" },
  { value: "livree", label: "Clôturer comme livrée" },
];

function MarketplaceDisputes() {
  const csrf = useCSRF();
  const { priceInArriary } = useFormatter();
  const [orders, setOrders] = useState<DisputedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [resolutionsById, setResolutionsById] = useState<
    Record<string, string>
  >({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/disputes`,
        { credentials: "include" },
      );
      const result = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error(
          "L’API marketplace n’est pas encore déployée sur le serveur. Déployez la dernière version backend.",
        );
      }
      if (!response.ok)
        throw new Error(result.message || "Impossible de charger les litiges.");
      setOrders(result.data);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Erreur de chargement des litiges.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDisputes();
  }, [loadDisputes]);

  const resolve = async (orderId: string, subOrder: DisputedSubOrder) => {
    if (!csrf || busyId) return;
    const status = resolutionsById[subOrder._id] || "annulee";
    setBusyId(subOrder._id);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/${orderId}/suborders/${subOrder._id}/resolve`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          body: JSON.stringify({
            status,
            reason: reasons[subOrder._id] || "Décision du Super Admin.",
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Impossible de traiter le litige.");
      toast.success(result.message || "Litige traité.");
      await loadDisputes();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setBusyId("");
    }
  };

  if (!csrf || loading) return <Preloader />;

  return (
    <section className="space-y-5">
      <header className="admin-toolbar">
        <div>
          <p className="admin-kicker">Arbitrage marketplace</p>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Litiges de commande
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Examinez les éléments transmis avant de décider pour chaque
            sous-commande.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDisputes()}
          className="admin-button-secondary min-h-11"
        >
          Actualiser
        </button>
      </header>

      {loadError ? (
        <div
          role="alert"
          className="admin-panel border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"
        >
          <p className="font-bold">Impossible de charger les litiges</p>
          <p className="mt-1">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadDisputes()}
            className="admin-button-secondary mt-4 min-h-10"
          >
            Réessayer
          </button>
        </div>
      ) : !orders.length ? (
        <div className="admin-panel p-10 text-center">
          <h2 className="font-bold text-gray-900">Aucun litige ouvert</h2>
          <p className="mt-1 text-sm text-gray-500">
            Les sous-commandes signalées apparaîtront dans cette file.
          </p>
        </div>
      ) : (
        orders.map((order) => {
          const disputed = order.subOrders.filter(
            (subOrder) => subOrder.status === "litige",
          );
          return (
            <article key={order._id} className="admin-panel">
              <header className="admin-panel-heading">
                <div>
                  <p className="admin-panel-kicker">
                    Signalé le{" "}
                    {new Date(order.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <h2 className="admin-panel-title">{order.customer.name}</h2>
                  <p className="admin-panel-subtitle">
                    {order.customer.phone} · {order.customer.address}
                  </p>
                </div>
                <span className="admin-status-badge admin-status-danger">
                  {disputed.length} litige{disputed.length > 1 ? "s" : ""}
                </span>
              </header>
              <div className="space-y-4 p-4 sm:p-5">
                {disputed.map((subOrder) => {
                  const shop =
                    typeof subOrder.boutiks_id === "string"
                      ? null
                      : subOrder.boutiks_id;
                  return (
                    <section
                      key={subOrder._id}
                      className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {shop?.name ?? "Boutique"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {shop?.phoneNumber}{" "}
                            {shop?.email ? `· ${shop.email}` : ""}
                          </p>
                        </div>
                        <strong>{priceInArriary(subOrder.payableTotal)}</strong>
                      </div>
                      <div className="mt-3 space-y-1">
                        {subOrder.items.map((item, index) => (
                          <p
                            key={`${item.name}-${index}`}
                            className="text-xs text-gray-600"
                          >
                            {item.quantity} × {item.name} ·{" "}
                            {priceInArriary(item.unitPrice)}
                          </p>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-gray-700">
                        Paiement : {subOrder.paymentMethod} · état :{" "}
                        {subOrder.paymentStatus}
                        {subOrder.paymentDeclaration
                          ? ` · référence ${subOrder.paymentDeclaration.reference}`
                          : ""}
                      </p>
                      {subOrder.paymentDeclaration?.evidencePath && (
                        <a
                          href={`${import.meta.env.REACT_API_URL}marketplace/orders/${order._id}/suborders/${subOrder._id}/evidence`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-bold text-emerald-800 underline"
                        >
                          Voir la capture fournie
                        </a>
                      )}
                      <details className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                        <summary className="cursor-pointer text-xs font-bold text-gray-700">
                          Historique des statuts
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {subOrder.statusHistory.map((entry, index) => (
                            <li
                              key={`${entry.status}-${index}`}
                              className="text-xs text-gray-600"
                            >
                              {new Date(entry.createdAt).toLocaleString(
                                "fr-FR",
                              )}{" "}
                              · {entry.status} · {entry.actor}
                              {entry.note ? ` · ${entry.note}` : ""}
                            </li>
                          ))}
                        </ul>
                      </details>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-end">
                        <label className="grid gap-1 text-xs font-bold text-gray-600">
                          Décision
                          <select
                            className="admin-input min-h-10"
                            value={resolutionsById[subOrder._id] ?? "annulee"}
                            onChange={(event) =>
                              setResolutionsById((current) => ({
                                ...current,
                                [subOrder._id]: event.target.value,
                              }))
                            }
                          >
                            {resolutions.map((resolution) => (
                              <option
                                value={resolution.value}
                                key={resolution.value}
                              >
                                {resolution.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-1 text-xs font-bold text-gray-600">
                          Motif de décision
                          <textarea
                            maxLength={500}
                            value={reasons[subOrder._id] ?? ""}
                            onChange={(event) =>
                              setReasons((current) => ({
                                ...current,
                                [subOrder._id]: event.target.value,
                              }))
                            }
                            className="admin-input min-h-10 py-2"
                            placeholder="Résumé de l’arbitrage"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={!!busyId}
                          onClick={() => void resolve(order._id, subOrder)}
                          className="admin-button-primary min-h-10 px-4"
                        >
                          {busyId === subOrder._id
                            ? "Traitement…"
                            : "Appliquer la décision"}
                        </button>
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

export default MarketplaceDisputes;
