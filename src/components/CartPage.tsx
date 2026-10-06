import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LiaMinusSolid, LiaPlusSolid, LiaTimesSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useCart } from "../context/useCart";
import { useAuth } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";
import useFormatter from "../helper/useFormatter";
import Preloader from "./loading/Preloader";

type PaymentMethod =
  | "mvola"
  | "orange_money"
  | "airtel_money"
  | "virement"
  | "paiement_livraison";
interface ShopPaymentOptions {
  deliveryFee: number;
  paymentMethods: Array<{
    providerType: "manual";
    method: PaymentMethod;
    recipientName: string;
    account?: string;
    phone?: string;
    instructions?: string;
  }>;
}

const paymentLabels: Record<PaymentMethod, string> = {
  mvola: "MVola",
  orange_money: "Orange Money",
  airtel_money: "Airtel Money",
  virement: "Virement bancaire",
  paiement_livraison: "Paiement à la livraison",
};

function CartPage() {
  const { items, setQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const csrf = useCSRF();
  const navigate = useNavigate();
  const { priceInArriary } = useFormatter();
  const [shopOptions, setShopOptions] = useState<
    Record<string, ShopPaymentOptions>
  >({});
  const [shopErrors, setShopErrors] = useState<Record<string, string>>({});
  const [paymentSelection, setPaymentSelection] = useState<
    Record<string, PaymentMethod>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const shopIds = [...new Set(items.map((item) => item.shopId))];
  const shopIdsKey = shopIds.join(",");

  useEffect(() => {
    if (!user) return;
    const profile = user.personnalInfo_id;
    setCustomer((current) => ({
      ...current,
      name:
        current.name ||
        [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "",
      phone: current.phone || profile?.phoneNumber || user.phonenumber || "",
      email: current.email || user.email || "",
      address: current.address || profile?.adresse || "",
    }));
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!shopIdsKey) {
      setShopOptions({});
      return () => {
        active = false;
      };
    }

    const loadShopOptions = async () => {
      const result = await Promise.all(
        shopIdsKey.split(",").map(async (shopId) => {
          try {
            const response = await fetch(
              `${import.meta.env.REACT_API_URL}marketplace/orders/payment-methods/${shopId}`,
            );
            const payload = await response.json();
            if (!response.ok)
              throw new Error(
                payload.message || "Modes de paiement indisponibles.",
              );
            return [shopId, payload.data as ShopPaymentOptions] as const;
          } catch (error) {
            return [
              shopId,
              null,
              error instanceof Error
                ? error.message
                : "Impossible de charger les modes de paiement.",
            ] as const;
          }
        }),
      );
      if (!active) return;
      const nextOptions: Record<string, ShopPaymentOptions> = {};
      const nextErrors: Record<string, string> = {};
      for (const [shopId, options, errorMessage] of result) {
        if (options) nextOptions[shopId] = options;
        else
          nextErrors[shopId] =
            errorMessage || "Impossible de charger les modes de paiement.";
      }
      setShopOptions(nextOptions);
      setShopErrors(nextErrors);
      setPaymentSelection((current) => {
        const next = { ...current };
        for (const [shopId, options] of result) {
          if (options && !next[shopId])
            next[shopId] = options.paymentMethods[0]?.method;
        }
        return next;
      });
    };
    void loadShopOptions();
    return () => {
      active = false;
    };
  }, [shopIdsKey]);

  const groupedItems = shopIds.map((shopId) => ({
    shopId,
    shopName:
      items.find((item) => item.shopId === shopId)?.shopName ?? "Boutique",
    items: items.filter((item) => item.shopId === shopId),
    subtotal: items
      .filter((item) => item.shopId === shopId)
      .reduce((total, item) => total + item.unitPrice * item.quantity, 0),
  }));

  const handleCustomerChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrf || isSubmitting) return;
    if (groupedItems.some((group) => !paymentSelection[group.shopId])) {
      toast.error("Choisissez un mode de paiement pour chaque boutique.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          body: JSON.stringify({
            items: items.map(({ productId, quantity, variants }) => ({
              productId,
              quantity,
              variants,
            })),
            customer,
            paymentMethods: paymentSelection,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Impossible de valider la commande.");

      clearCart();
      const orderId = result.data._id;
      const trackingToken = result.trackingToken as string | undefined;
      if (trackingToken)
        sessionStorage.setItem(`shopinmada.order.${orderId}`, trackingToken);
      toast.success(result.message || "Commande envoyée aux boutiques.");
      navigate(
        `/suivi-commande/${orderId}${trackingToken ? `?token=${encodeURIComponent(trackingToken)}` : ""}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!csrf) return <Preloader />;

  return (
    <main className="customer-checkout-page min-h-[70vh] py-8 sm:py-12">
      <div className="market-container">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Votre sélection
            </p>
            <h1 className="market-section-title">Panier et validation</h1>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-red-700 hover:text-red-900"
            >
              Vider le panier
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-bold text-gray-900">
              Votre panier est vide
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Parcourez les boutiques locales et ajoutez vos articles.
            </p>
            <Link to="/shop" className="market-button-primary mt-5">
              Explorer les produits
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
            <section className="space-y-5" aria-label="Articles par boutique">
              {groupedItems.map((group) => {
                const options = shopOptions[group.shopId];
                return (
                  <article
                    className="market-card overflow-hidden"
                    key={group.shopId}
                  >
                    <header className="border-b border-gray-100 bg-white px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                        Boutique
                      </p>
                      <h2 className="mt-1 text-base font-bold text-gray-900">
                        {group.shopName}
                      </h2>
                    </header>
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item) => (
                        <div
                          key={`${item.productId}-${JSON.stringify(item.variants)}`}
                          className="flex gap-3 p-4 sm:gap-4"
                        >
                          <img
                            src={
                              item.image
                                ? `${import.meta.env.REACT_API_URL}uploads/${item.image}`
                                : "/logo.png"
                            }
                            alt=""
                            className="h-20 w-20 shrink-0 rounded-xl bg-gray-50 object-cover sm:h-24 sm:w-24"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
                                {item.name}
                              </h3>
                              <button
                                type="button"
                                aria-label={`Retirer ${item.name}`}
                                onClick={() =>
                                  removeItem(item.productId, item.variants)
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-700"
                              >
                                <LiaTimesSolid size={19} />
                              </button>
                            </div>
                            {Object.entries(item.variants).length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">
                                {Object.entries(item.variants)
                                  .map(([key, value]) => `${key} : ${value}`)
                                  .join(" · ")}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="inline-flex h-9 items-center rounded-lg border border-gray-200">
                                <button
                                  type="button"
                                  aria-label="Diminuer la quantité"
                                  onClick={() =>
                                    item.quantity === 1
                                      ? removeItem(
                                          item.productId,
                                          item.variants,
                                        )
                                      : setQuantity(
                                          item.productId,
                                          item.variants,
                                          item.quantity - 1,
                                        )
                                  }
                                  className="grid h-9 w-9 place-items-center text-gray-600 hover:text-emerald-800"
                                >
                                  <LiaMinusSolid size={15} />
                                </button>
                                <span className="min-w-8 text-center text-sm font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Augmenter la quantité"
                                  disabled={
                                    item.stock !== undefined &&
                                    item.quantity >= item.stock
                                  }
                                  onClick={() =>
                                    setQuantity(
                                      item.productId,
                                      item.variants,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="grid h-9 w-9 place-items-center text-gray-600 hover:text-emerald-800 disabled:opacity-40"
                                >
                                  <LiaPlusSolid size={15} />
                                </button>
                              </div>
                              <strong className="text-sm text-gray-900">
                                {priceInArriary(item.unitPrice * item.quantity)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <footer className="space-y-3 border-t border-gray-100 bg-[#fbfdfb] p-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Sous-total</span>
                        <strong>{priceInArriary(group.subtotal)}</strong>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Livraison</span>
                        <strong>
                          {options
                            ? priceInArriary(options.deliveryFee)
                            : "À configurer"}
                        </strong>
                      </div>
                      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold leading-5 text-emerald-900">
                        Vous paierez{" "}
                        {options
                          ? priceInArriary(group.subtotal + options.deliveryFee)
                          : "le montant communiqué par la boutique"}{" "}
                        à la Boutique {group.shopName}.
                      </p>
                      <label className="grid gap-1.5 text-xs font-bold text-gray-600">
                        Mode de paiement pour {group.shopName}
                        <select
                          value={paymentSelection[group.shopId] ?? ""}
                          onChange={(event) =>
                            setPaymentSelection((current) => ({
                              ...current,
                              [group.shopId]: event.target
                                .value as PaymentMethod,
                            }))
                          }
                          disabled={!options?.paymentMethods.length}
                          className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800"
                        >
                          <option value="">
                            {shopErrors[group.shopId]
                              ? "Modes de paiement indisponibles"
                              : options
                                ? "Choisir un mode de paiement"
                                : "Chargement des modes de paiement…"}
                          </option>
                          {options?.paymentMethods.map((method) => (
                            <option value={method.method} key={method.method}>
                              {paymentLabels[method.method]}
                            </option>
                          ))}
                        </select>
                      </label>
                      {(!options || !options.paymentMethods.length) && (
                        <p role="status" className="text-xs text-amber-800">
                          {shopErrors[group.shopId] ||
                            "Cette boutique doit configurer ses modes de paiement avant de recevoir une commande."}
                        </p>
                      )}
                    </footer>
                  </article>
                );
              })}
            </section>

            <form
              onSubmit={handleCheckout}
              className="market-card space-y-5 p-5 sm:p-6 lg:sticky lg:top-24"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                  Livraison
                </p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  Vos coordonnées
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  La commande peut être passée sans compte client.
                </p>
              </div>
              {(
                [
                  ["name", "Nom complet", "text"],
                  ["phone", "Téléphone", "tel"],
                  ["email", "E-mail (facultatif)", "email"],
                  ["city", "Ville", "text"],
                ] as const
              ).map(([name, label, type]) => (
                <label
                  className="grid gap-1.5 text-xs font-bold text-gray-600"
                  key={name}
                >
                  {label}
                  <input
                    className="min-h-11 rounded-xl border border-gray-200 px-3 text-sm font-normal text-gray-900"
                    type={type}
                    name={name}
                    value={customer[name]}
                    onChange={handleCustomerChange}
                    required={name !== "email" && name !== "city"}
                    maxLength={name === "name" ? 120 : 100}
                  />
                </label>
              ))}
              <label className="grid gap-1.5 text-xs font-bold text-gray-600">
                Adresse de livraison
                <textarea
                  className="min-h-20 rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal text-gray-900"
                  name="address"
                  value={customer.address}
                  onChange={handleCustomerChange}
                  required
                  maxLength={500}
                />
              </label>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                Chaque boutique recevra et traitera sa propre sous-commande.
                Vous paierez directement chaque vendeur selon le mode
                sélectionné.
              </div>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  groupedItems.some(
                    (group) =>
                      !shopOptions[group.shopId]?.paymentMethods.length,
                  ) ||
                  groupedItems.some((group) => !paymentSelection[group.shopId])
                }
                className="market-button-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Envoi en cours…" : "Confirmer les commandes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export default CartPage;
