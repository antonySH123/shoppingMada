import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LiaMinusSolid, LiaPlusSolid, LiaTimesSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useCart } from "../context/useCart";
import { useAuth } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";
import useFormatter from "../helper/useFormatter";
import Preloader from "./loading/Preloader";
import { useLanguage } from "../context/useLanguage";

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
  const { t } = useLanguage();
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
  const [savedAddresses, setSavedAddresses] = useState<Array<{ _id: string; label?: string; recipientName: string; phone: string; address: string; city?: string }>>([]);
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

  useEffect(() => { if (!user) return; void fetch(`${import.meta.env.REACT_API_URL}user/addresses`, { credentials: "include" }).then((response) => response.ok ? response.json() : null).then((result) => { if (result) setSavedAddresses(result.data ?? []); }); }, [user?._id]);

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
                payload.message || t("cart.paymentMethodsUnavailable"),
              );
            return [shopId, payload.data as ShopPaymentOptions] as const;
          } catch (error) {
            return [
              shopId,
              null,
              error instanceof Error
                ? error.message
                : t("cart.paymentLoadError"),
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
              errorMessage || t("cart.paymentLoadError");
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
      toast.error(t("cart.choosePaymentPerShop"));
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
        throw new Error(result.message || t("cart.checkoutFailed"));

      clearCart();
      const orderId = result.data._id;
      const trackingToken = result.trackingToken as string | undefined;
      if (trackingToken)
        sessionStorage.setItem(`shopinmada.order.${orderId}`, trackingToken);
      toast.success(result.message || t("cart.orderSent"));
      navigate(
        `/suivi-commande/${orderId}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("cart.checkoutError"),
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
              {t("cart.selection")}
            </p>
            <h1 className="market-section-title">{t("cart.title")}</h1>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-red-700 hover:text-red-900"
            >
              {t("cart.emptyButton")}
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-bold text-gray-900">
              {t("cart.empty")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("cart.explore")}
            </p>
            <Link to="/shop" className="market-button-primary mt-5">
              {t("nav.exploreProducts")}
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
                        {t("cart.shop")}
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
                        <span className="text-gray-500">{t("cart.delivery")}</span>
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
                              ? t("cart.paymentUnavailable")
                              : options
                                ? t("cart.choosePayment")
                                : t("cart.loadingPayment")}
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
                            t("cart.configurePayment")}
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
                  {t("cart.delivery")}
                </p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  {t("cart.customerDetails")}
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {t("cart.guestCheckout")}
                </p>
              </div>
              {(
                [
                  ["name", t("cart.name"), "text"],
                  ["phone", t("cart.phone"), "tel"],
                  ["email", t("cart.emailOptional"), "email"],
                  ["city", t("cart.city"), "text"],
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
                {t("cart.address")}
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
                {t("cart.multiVendorNote")}
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
                {isSubmitting ? t("cart.submitting") : t("cart.checkout")}
              </button>
            </form>
          </div>
        )}
              {savedAddresses.length > 0 && <label className="grid gap-1.5 text-xs font-bold text-gray-600">{t("cart.useSavedAddress")}<select className="min-h-11 rounded-xl border border-gray-200 px-3 text-sm font-normal text-gray-900" defaultValue="" onChange={(event) => { const address = savedAddresses.find((item) => item._id === event.target.value); if (address) setCustomer((current) => ({ ...current, name: address.recipientName, phone: address.phone, address: address.address, city: address.city ?? current.city })); }}><option value="">{t("cart.chooseAddress")}</option>{savedAddresses.map((address) => <option key={address._id} value={address._id}>{address.label || address.recipientName} · {address.city}</option>)}</select></label>}
      </div>
    </main>
  );
}

export default CartPage;
