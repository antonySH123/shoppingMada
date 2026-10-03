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
    <section className="profile-orders profile-marketplace-orders">
      <header className="profile-orders-heading">
        <p className="profile-orders-eyebrow">Marketplace</p>
        <h2>Commandes par boutique</h2>
      </header>
      {loading ? (
        <p className="profile-orders-empty" role="status">
          Chargement des commandes…
        </p>
      ) : orders.length === 0 ? (
        <p className="profile-orders-empty">
          Aucune commande multi-vendeur pour le moment.
        </p>
      ) : (
        <div className="profile-orders-list">
          {orders.map((order) => (
            <article key={order._id} className="profile-order-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="profile-order-date">
                    Commande du{" "}
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="profile-order-shop-count">
                    {order.subOrders.length} boutique
                    {order.subOrders.length > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="profile-order-status">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="profile-suborders">
                {order.subOrders.map((subOrder) => {
                  const shop =
                    typeof subOrder.boutiks_id === "string"
                      ? "Boutique"
                      : (subOrder.boutiks_id.name ?? "Boutique");
                  return (
                    <div key={subOrder._id} className="profile-suborder-row">
                      <span>
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
                className="profile-order-link"
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
