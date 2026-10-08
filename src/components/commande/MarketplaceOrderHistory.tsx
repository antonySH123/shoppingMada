import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFormatter from "../../helper/useFormatter";
import { useCart } from "../../context/useCart";
import { useLanguage } from "../../context/useLanguage";

interface MarketplaceOrderSummary {
  _id: string;
  status: string;
  createdAt: string;
  subOrders: Array<{
    _id: string;
    status: string;
    paymentStatus: string;
    payableTotal: number;
    refundedMGA?: number;
    refundHistory?: Array<{ amountMGA: number; createdAt: string }>;
    boutiks_id: { name?: string } | string;
    shipping?: { carrier?: string; trackingNumber?: string };
    statusHistory?: Array<{ status: string; createdAt: string; note?: string }>;
    items: Array<{
      product_id: string;
      name: string;
      quantity: number;
      variants?: Record<string, string>;
    }>;
  }>;
}

interface CurrentProduct {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  photos?: string[];
  variant?: Array<{
    name: string;
    values: Array<{ value: string; additionalPrice?: number; stock?: number }>;
  }>;
  boutiks_id?: { _id: string; name?: string };
}

function MarketplaceOrderHistory() {
  const [orders, setOrders] = useState<MarketplaceOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { priceInArriary } = useFormatter();
  const { t, language } = useLanguage();
  const { items: cartItems, replaceItems } = useCart();
  const [repeatingOrder, setRepeatingOrder] = useState<string | null>(null);

  const repeatOrder = async (order: MarketplaceOrderSummary) => {
    setRepeatingOrder(order._id);
    let addedCount = 0;
    let unavailableCount = 0;
    let failedCheckCount = 0;
    const nextCart = cartItems.map((item) => ({ ...item, variants: { ...item.variants } }));
    try {
      for (const subOrder of order.subOrders) {
        for (const item of subOrder.items ?? []) {
          try {
            const response = await fetch(
              `${import.meta.env.REACT_API_URL}shop/product/${item.product_id}`,
            );
            if (!response.ok) {
              unavailableCount += 1;
              continue;
            }
            const result = await response.json();
            const product = result.data as CurrentProduct | undefined;
            if (!product?.boutiks_id?._id) {
              unavailableCount += 1;
              continue;
            }
            const selectedVariants = item.variants ?? {};
            let unitPrice = product.price;
            let availableStock = product.stock;
            const currentVariantNames = new Set((product.variant ?? []).map((variant) => variant.name));
            let validVariants = Object.keys(selectedVariants).every((name) => currentVariantNames.has(name));
            for (const variant of product.variant ?? []) {
              const selectedValue = selectedVariants[variant.name];
              if (!selectedValue) {
                validVariants = false;
                break;
              }
              const option = variant.values.find(
                (value) => value.value === selectedValue,
              );
              if (!option) {
                validVariants = false;
                break;
              }
              unitPrice += Number(option.additionalPrice ?? 0);
              if (typeof option.stock === "number") {
                availableStock =
                  availableStock === undefined
                    ? option.stock
                    : Math.min(availableStock, option.stock);
              }
            }
            if (!validVariants) {
              unavailableCount += 1;
              continue;
            }
            const variantKey = (variants: Record<string, string>) =>
              JSON.stringify(Object.fromEntries(Object.entries(variants).sort(([left], [right]) => left.localeCompare(right))));
            const matching = nextCart.find((cartItem) =>
              cartItem.productId === product._id &&
              variantKey(cartItem.variants) === variantKey(selectedVariants),
            );
            const requestedQuantity = (matching?.quantity ?? 0) + item.quantity;
            if (requestedQuantity > 100 || (availableStock !== undefined && requestedQuantity > availableStock)) {
              unavailableCount += 1;
              continue;
            }
            if (matching) {
              matching.quantity = requestedQuantity;
              matching.name = product.name;
              matching.unitPrice = unitPrice;
              matching.image = product.photos?.[0];
              matching.shopId = product.boutiks_id._id;
              matching.shopName = product.boutiks_id.name ?? "Boutique";
              matching.stock = availableStock;
            } else nextCart.push({
              productId: product._id,
              name: product.name,
              unitPrice,
              quantity: item.quantity,
              image: product.photos?.[0],
              shopId: product.boutiks_id._id,
              shopName: product.boutiks_id.name ?? "Boutique",
              variants: selectedVariants,
              stock: availableStock,
            });
            addedCount += 1;
          } catch (error) {
            failedCheckCount += 1;
            console.error("Impossible de vérifier un article de la commande précédente.", error);
          }
        }
      }
      if (addedCount) replaceItems(nextCart);
      if (addedCount) toast.success(`${addedCount} article(s) ajouté(s) au panier.`);
      if (unavailableCount) toast.warning(`${unavailableCount} article(s) indisponible(s) ou en quantité insuffisante n’ont pas été ajoutés.`);
      if (failedCheckCount) toast.error(`Vérification impossible pour ${failedCheckCount} article(s). Réessayez plus tard.`);
      if (!addedCount && !unavailableCount && !failedCheckCount) toast.info("Cette commande ne contient aucun article à recommander.");
    } finally {
      setRepeatingOrder(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadOrders = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}marketplace/orders?page=${page}&limit=10`,
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
        setPages(result.pagination?.pages ?? 1);
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
  }, [page]);

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
          {t("order.noOrders")}
        </p>
      ) : (
        <div className="profile-orders-list">
          {orders.map((order) => (
            <article key={order._id} className="profile-order-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="profile-order-date">
                    {t("order.date")}{" "}
                    {new Date(order.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}
                  </p>
                  <p className="profile-order-shop-count">
                    {(order.subOrders.length > 1 ? t("order.shopCountPlural") : t("order.shopCountSingle")).replace("{count}", String(order.subOrders.length))}
                  </p>
                </div>
                <span className="profile-order-status">
                  {t(`order.status.${order.status}`) === `order.status.${order.status}` ? order.status : t(`order.status.${order.status}`)}
                </span>
              </div>
              <div className="profile-suborders">
                {order.subOrders.map((subOrder) => {
                  const shop =
                    typeof subOrder.boutiks_id === "string"
                      ? t("order.shop")
                      : (subOrder.boutiks_id.name ?? t("order.shop"));
                  return (
                    <div key={subOrder._id} className="rounded-xl border border-gray-100 p-3">
                      <div className="profile-suborder-row">
                        <span>{shop} · {t(`order.status.${subOrder.status}`) === `order.status.${subOrder.status}` ? subOrder.status : t(`order.status.${subOrder.status}`)}</span>
                        <strong>{priceInArriary(subOrder.payableTotal)}</strong>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("order.payment")}: {subOrder.paymentStatus === "confirme" ? t("order.payment.confirmed") : subOrder.paymentStatus === "declare" ? t("order.payment.declared") : t("order.payment.due")}
                        {subOrder.refundedMGA ? ` · ${t("order.refunded")}: ${priceInArriary(subOrder.refundedMGA)}` : ""}
                        {subOrder.shipping?.carrier ? ` · ${t("order.carrier")}: ${subOrder.shipping.carrier}` : ""}
                        {subOrder.shipping?.trackingNumber ? ` · ${t("order.trackingNumber")}: ${subOrder.shipping.trackingNumber}` : ""}
                      </p>
                      {subOrder.refundHistory && subOrder.refundHistory.length > 0 && <ul className="mt-2 text-xs text-gray-500">{subOrder.refundHistory.map((refund, index) => <li key={`${refund.createdAt}-${index}`}>{t("order.refunded")} · {new Date(refund.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}: {priceInArriary(refund.amountMGA)}</li>)}</ul>}
                      {subOrder.statusHistory && subOrder.statusHistory.length > 0 && (
                        <details className="mt-2 text-xs text-gray-600">
                          <summary className="cursor-pointer font-semibold">{t("order.statusHistory")}</summary>
                          <ol className="mt-2 space-y-1">
                            {subOrder.statusHistory.map((entry, index) => (
                              <li key={`${entry.createdAt}-${index}`}>
                                {new Date(entry.createdAt).toLocaleString(language === "fr" ? "fr-FR" : "en-US")} · {t(`order.status.${entry.status}`) === `order.status.${entry.status}` ? entry.status : t(`order.status.${entry.status}`)}{entry.note ? ` · ${entry.note}` : ""}
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link to={`/suivi-commande/${order._id}`} className="profile-order-link">{t("order.follow")}</Link>
                <button type="button" className="profile-order-link" disabled={repeatingOrder === order._id} onClick={() => void repeatOrder(order)}>
                  {repeatingOrder === order._id ? t("order.checkingItems") : t("order.repeat")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && pages > 1 && <div className="profile-inline-row"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{t("shop.previous")}</button><span>{t("shop.pageOf")} {page} {t("shop.of")} {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>{t("shop.next")}</button></div>}
    </section>
  );
}

export default MarketplaceOrderHistory;
