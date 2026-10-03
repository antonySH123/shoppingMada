import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFormatter from "../../helper/useFormatter";

interface MarketplaceOrderSummary {
  _id: string;
  status: string;
  createdAt: string;
  subOrders: Array<{
    _id: string;
    status: string;
    payableTotal: number;
    boutiks_id: { name?: string } | string;
  }>;
}

const statusLabels: Record<string, string> = {
  en_attente_vendeur: "En attente vendeur",
  en_attente_paiement: "Paiement à effectuer",
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

function MarketplaceOrderHistory() {
  const [orders, setOrders] = useState<MarketplaceOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { priceInArriary } = useFormatter();

  useEffect(() => {
    const controller = new AbortController();
    const loadOrders = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}marketplace/orders`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || "Impossible de charger les commandes.",
          );
        setOrders(result.data);
      } catch (error) {
        if (!controller.signal.aborted)
          toast.error(
            error instanceof Error
              ? error.message
              : "Erreur de chargement des commandes.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadOrders();
    return () => controller.abort();
  }, []);

  return (
    <section className="mt-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
        Nouveau parcours
      </p>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900">
        Commandes par boutique
      </h2>
      {loading ? (
        <p className="text-sm text-gray-500">Chargement des commandes…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Aucune commande multi-vendeur pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Commande du{" "}
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {order.subOrders.length} boutique
                    {order.subOrders.length > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                {order.subOrders.map((subOrder) => {
                  const shop =
                    typeof subOrder.boutiks_id === "string"
                      ? "Boutique"
                      : (subOrder.boutiks_id.name ?? "Boutique");
                  return (
                    <div
                      key={subOrder._id}
                      className="flex flex-wrap justify-between gap-2 text-xs"
                    >
                      <span className="text-gray-600">
                        {shop} ·{" "}
                        {statusLabels[subOrder.status] ?? subOrder.status}
                      </span>
                      <strong>{priceInArriary(subOrder.payableTotal)}</strong>
                    </div>
                  );
                })}
              </div>
              <Link
                to={`/suivi-commande/${order._id}`}
                className="mt-4 inline-flex text-sm font-bold text-emerald-800 hover:text-emerald-950"
              >
                Suivre cette commande
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MarketplaceOrderHistory;
