import { FormEvent, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";
import useFormatter from "../helper/useFormatter";
import Preloader from "./loading/Preloader";

type OrderItem = {
  product_id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  variants: Record<string, string>;
};
type SubOrder = {
  _id: string;
  boutiks_id: { name?: string; phoneNumber?: string; ville?: string } | string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  payableTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentInstructions: {
    recipientName: string;
    account?: string;
    phone?: string;
    instructions?: string;
  };
  paymentDeclaration?: { reference: string; evidencePath?: string };
  status: string;
  expiresAt?: string;
  shipping: {
    address: string;
    recipientName: string;
    phone: string;
    city?: string;
  };
};
type MarketplaceOrder = {
  _id: string;
  status: string;
  customer: { name: string };
  subOrders: SubOrder[];
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  en_attente_vendeur: "En attente de réponse du vendeur",
  en_attente_paiement: "Paiement à effectuer",
  paiement_declare: "Paiement déclaré, en vérification",
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

function OrderTracking() {
  const { orderId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const csrf = useCSRF();
  const { priceInArriary } = useFormatter();
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePayment, setActivePayment] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const token =
    searchParams.get("token") ??
    sessionStorage.getItem(`shopinmada.order.${orderId}`) ??
    "";

  const loadOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/track/${orderId}`,
        {
          credentials: "include",
          headers: token ? { "x-order-token": token } : {},
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Impossible de charger le suivi.");
      setOrder(result.data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Le suivi est indisponible.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId, token]);

  const submitPayment = async (
    event: FormEvent<HTMLFormElement>,
    subOrderId: string,
  ) => {
    event.preventDefault();
    if (!csrf || !reference.trim() || busy) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("reference", reference.trim());
      if (evidence) formData.append("evidence", evidence);
      if (token) formData.append("trackingToken", token);
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/${orderId}/suborders/${subOrderId}/payment`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "xsrf-token": csrf,
            ...(token ? { "x-order-token": token } : {}),
          },
          body: formData,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de déclarer le paiement.",
        );
      setReference("");
      setEvidence(null);
      setActivePayment(null);
      toast.success(result.message);
      await loadOrder();
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (
    subOrderId: string,
    status: "annulee" | "litige" | "terminee",
  ) => {
    if (!csrf || busy) return;
    setBusy(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/${orderId}/suborders/${subOrderId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
            ...(token ? { "x-order-token": token } : {}),
          },
          body: JSON.stringify({ status, trackingToken: token || undefined }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de mettre à jour la commande.",
        );
      toast.success(result.message);
      await loadOrder();
    } catch (updateError) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!csrf || loading) return <Preloader />;

  return (
    <main className="customer-checkout-page min-h-[70vh] py-8 sm:py-12">
      <div className="market-container">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Suivi de commande
            </p>
            <h1 className="market-section-title">
              {order
                ? (statusLabels[order.status] ?? order.status)
                : "Votre commande"}
            </h1>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          >
            Continuer mes achats
          </Link>
        </header>

        {error || !order ? (
          <section
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
          >
            <p>{error || "Commande introuvable."}</p>
            {!user && !token && (
              <p className="mt-2">
                Ouvrez le lien de suivi complet reçu après validation de la
                commande.
              </p>
            )}
          </section>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              Commande du {new Date(order.createdAt).toLocaleString("fr-FR")}
            </p>
            {order.subOrders.map((subOrder) => {
              const shop =
                typeof subOrder.boutiks_id === "string"
                  ? null
                  : subOrder.boutiks_id;
              const canDeclare =
                subOrder.status === "en_attente_paiement" &&
                subOrder.paymentMethod !== "paiement_livraison";
              const canCancel = [
                "en_attente_vendeur",
                "en_attente_paiement",
              ].includes(subOrder.status);
              const canDispute = ![
                "terminee",
                "annulee",
                "refusee",
                "expiree",
              ].includes(subOrder.status);
              const canComplete =
                subOrder.status === "livree" &&
                subOrder.paymentStatus === "confirme";
              return (
                <article
                  key={subOrder._id}
                  className="market-card overflow-hidden"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                        Sous-commande
                      </p>
                      <h2 className="mt-1 text-base font-bold text-gray-900">
                        {shop?.name ?? "Boutique"}
                      </h2>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">
                      {statusLabels[subOrder.status] ?? subOrder.status}
                    </span>
                  </header>
                  <div className="space-y-4 p-5">
                    {subOrder.items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={
                            item.image
                              ? `${import.meta.env.REACT_API_URL}uploads/${item.image}`
                              : "/logo.png"
                          }
                          alt=""
                          className="h-14 w-14 rounded-lg bg-gray-50 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {priceInArriary(item.unitPrice)}
                          </p>
                        </div>
                        <strong className="text-sm">
                          {priceInArriary(item.unitPrice * item.quantity)}
                        </strong>
                      </div>
                    ))}
                    <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Sous-total boutique</span>
                        <span>{priceInArriary(subOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Livraison</span>
                        <span>{priceInArriary(subOrder.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>À payer à {shop?.name ?? "la boutique"}</span>
                        <span>{priceInArriary(subOrder.payableTotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Mode</span>
                        <span>
                          {methodLabels[subOrder.paymentMethod] ??
                            subOrder.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {subOrder.status === "en_attente_vendeur" && (
                      <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                        Le vendeur doit accepter votre demande avant le{" "}
                        {subOrder.expiresAt
                          ? new Date(subOrder.expiresAt).toLocaleString("fr-FR")
                          : "expiration du délai"}
                        .
                      </p>
                    )}
                    {canDeclare && (
                      <section className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <h3 className="text-sm font-bold text-gray-900">
                          Payer directement le vendeur
                        </h3>
                        <p className="mt-1 text-xs text-gray-600">
                          Bénéficiaire :{" "}
                          {subOrder.paymentInstructions.recipientName}
                        </p>
                        {subOrder.paymentInstructions.phone && (
                          <p className="mt-1 text-xs text-gray-600">
                            Téléphone / compte :{" "}
                            {subOrder.paymentInstructions.phone}
                          </p>
                        )}
                        {subOrder.paymentInstructions.account && (
                          <p className="mt-1 text-xs text-gray-600">
                            Référence du compte :{" "}
                            {subOrder.paymentInstructions.account}
                          </p>
                        )}
                        {subOrder.paymentInstructions.instructions && (
                          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-gray-600">
                            {subOrder.paymentInstructions.instructions}
                          </p>
                        )}
                        {activePayment === subOrder._id ? (
                          <form
                            className="mt-4 grid gap-3"
                            onSubmit={(event) =>
                              void submitPayment(event, subOrder._id)
                            }
                          >
                            <label className="grid gap-1 text-xs font-semibold text-gray-700">
                              Référence de transaction
                              <input
                                required
                                maxLength={120}
                                value={reference}
                                onChange={(event) =>
                                  setReference(event.target.value)
                                }
                                className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal"
                              />
                            </label>
                            <label className="grid gap-1 text-xs font-semibold text-gray-700">
                              Capture d’écran (facultative)
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) =>
                                  setEvidence(event.target.files?.[0] ?? null)
                                }
                                className="text-xs"
                              />
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <button
                                disabled={busy}
                                className="market-button-primary min-h-10 px-4 text-sm"
                              >
                                Déclarer le paiement
                              </button>
                              <button
                                type="button"
                                onClick={() => setActivePayment(null)}
                                className="market-button-secondary min-h-10 px-4 text-sm"
                              >
                                Annuler
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActivePayment(subOrder._id)}
                            className="market-button-primary mt-4 min-h-10 px-4 text-sm"
                          >
                            J’ai payé, déclarer
                          </button>
                        )}
                      </section>
                    )}
                    {subOrder.status === "paiement_declare" && (
                      <div className="rounded-lg bg-sky-50 p-3 text-xs leading-5 text-sky-900">
                        <p>
                          Référence déclarée :{" "}
                          {subOrder.paymentDeclaration?.reference}. Le vendeur
                          doit confirmer la réception des fonds.
                        </p>
                        {subOrder.paymentDeclaration?.evidencePath && (
                          <a
                            href={`${import.meta.env.REACT_API_URL}marketplace/orders/${orderId}/suborders/${subOrder._id}/evidence${token ? `?token=${encodeURIComponent(token)}` : ""}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex font-bold underline"
                          >
                            Voir la capture envoyée
                          </a>
                        )}
                      </div>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void updateStatus(subOrder._id, "annulee")
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Annuler cette sous-commande
                      </button>
                    )}
                    {canComplete && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void updateStatus(subOrder._id, "terminee")
                        }
                        className="ml-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        Confirmer la réception
                      </button>
                    )}
                    {canDispute && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void updateStatus(subOrder._id, "litige")
                        }
                        className="ml-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Signaler un litige
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default OrderTracking;
