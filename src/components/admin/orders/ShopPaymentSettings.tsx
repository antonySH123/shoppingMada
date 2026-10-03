import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import { useAuth } from "../../../helper/useAuth";
import Preloader from "../../loading/Preloader";

type Method =
  | "mvola"
  | "orange_money"
  | "airtel_money"
  | "virement"
  | "paiement_livraison";
interface PaymentMethodSetting {
  method: Method;
  enabled: boolean;
  recipientName: string;
  account: string;
  phone: string;
  instructions: string;
}

const methods: Array<{ id: Method; label: string; needsAccount: boolean }> = [
  { id: "mvola", label: "MVola", needsAccount: true },
  { id: "orange_money", label: "Orange Money", needsAccount: true },
  { id: "airtel_money", label: "Airtel Money", needsAccount: true },
  { id: "virement", label: "Virement bancaire", needsAccount: true },
  {
    id: "paiement_livraison",
    label: "Paiement à la livraison",
    needsAccount: false,
  },
];

const emptyMethod = (
  method: Method,
  recipientName: string,
): PaymentMethodSetting => ({
  method,
  enabled: false,
  recipientName,
  account: "",
  phone: "",
  instructions: "",
});

function ShopPaymentSettings() {
  const csrf = useCSRF();
  const { user } = useAuth();
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [settings, setSettings] = useState<PaymentMethodSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}marketplace/orders/seller/payment-methods`,
          { credentials: "include" },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || "Impossible de charger la configuration.",
          );
        setDeliveryFee(String(result.data.deliveryFee ?? 0));
        const saved: PaymentMethodSetting[] = result.data.paymentMethods ?? [];
        setSettings(
          methods.map(({ id }) => {
            const savedMethod = saved.find((item) => item.method === id);
            return savedMethod
              ? {
                  ...emptyMethod(id, user?.username ?? ""),
                  ...savedMethod,
                  account: savedMethod.account ?? "",
                  phone: savedMethod.phone ?? "",
                  instructions: savedMethod.instructions ?? "",
                }
              : emptyMethod(id, user?.username ?? "");
          }),
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erreur de chargement.",
        );
      } finally {
        setLoading(false);
      }
    };
    void loadSettings();
  }, [user?.username]);

  const updateMethod = (
    method: Method,
    field: keyof PaymentMethodSetting,
    value: string | boolean,
  ) => {
    setSettings((current) =>
      current.map((item) =>
        item.method === method ? { ...item, [field]: value } : item,
      ),
    );
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrf || saving) return;
    const enabledMethods = settings.filter((item) => item.enabled);
    if (!enabledMethods.length) {
      toast.error("Activez au moins un mode de paiement.");
      return;
    }
    if (enabledMethods.some((item) => !item.recipientName.trim())) {
      toast.error("Indiquez le bénéficiaire pour chaque mode activé.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}marketplace/orders/seller/payment-methods`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          body: JSON.stringify({
            deliveryFee: Number(deliveryFee),
            paymentMethods: enabledMethods,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible d’enregistrer les réglages.",
        );
      toast.success("Modes de paiement et livraison enregistrés.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur d’enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!csrf || loading) return <Preloader />;

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="admin-toolbar">
        <div>
          <p className="admin-kicker">Configuration boutique</p>
          <h1 className="admin-panel-title text-2xl">Paiement et livraison</h1>
          <p className="admin-panel-subtitle mt-1 max-w-2xl text-sm">
            Les clients vous paient directement. ShopInMada n’encaisse et ne
            traite aucun paiement.
          </p>
        </div>
        <label className="grid gap-1 text-xs font-bold text-[var(--admin-muted)]">
          Frais de livraison par commande
          <input
            type="number"
            min="0"
            step="1"
            value={deliveryFee}
            onChange={(event) => setDeliveryFee(event.target.value)}
            className="admin-input min-h-11 w-full sm:w-56"
            required
          />
        </label>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Modes de paiement acceptés</h2>
            <p>
              Activez uniquement les moyens que vous pouvez recevoir et
              confirmer.
            </p>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {methods.map(({ id, label, needsAccount }) => {
            const setting =
              settings.find((item) => item.method === id) ??
              emptyMethod(id, user?.username ?? "");
            return (
              <fieldset
                key={id}
                className="grid gap-4 p-4 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1.2fr)] sm:p-5"
              >
                <label className="flex min-h-11 items-center gap-3 text-sm font-bold text-[var(--admin-text)]">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={(event) =>
                      updateMethod(id, "enabled", event.target.checked)
                    }
                    className="h-5 w-5 accent-emerald-700"
                  />
                  {label}
                </label>
                {setting.enabled && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-xs font-semibold text-[var(--admin-muted)]">
                      Nom du bénéficiaire
                      <input
                        required
                        maxLength={120}
                        value={setting.recipientName}
                        onChange={(event) =>
                          updateMethod(id, "recipientName", event.target.value)
                        }
                        className="admin-input min-h-10"
                      />
                    </label>
                    {needsAccount && (
                      <>
                        <label className="grid gap-1 text-xs font-semibold text-[var(--admin-muted)]">
                          {id === "virement"
                            ? "Téléphone de contact (facultatif)"
                            : "Téléphone destinataire"}
                          <input
                            required={id !== "virement"}
                            value={setting.phone}
                            maxLength={40}
                            onChange={(event) =>
                              updateMethod(id, "phone", event.target.value)
                            }
                            className="admin-input min-h-10"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-[var(--admin-muted)]">
                          {id === "virement"
                            ? "Coordonnées bancaires"
                            : "Référence du compte (facultatif)"}
                          <input
                            required={id === "virement"}
                            value={setting.account}
                            maxLength={120}
                            onChange={(event) =>
                              updateMethod(id, "account", event.target.value)
                            }
                            className="admin-input min-h-10"
                          />
                        </label>
                      </>
                    )}
                    <label className="grid gap-1 text-xs font-semibold text-[var(--admin-muted)] sm:col-span-2">
                      Instructions pour le client
                      <textarea
                        value={setting.instructions}
                        maxLength={500}
                        onChange={(event) =>
                          updateMethod(id, "instructions", event.target.value)
                        }
                        className="admin-input min-h-20 py-2"
                        placeholder="Précisez comment vous identifier le paiement."
                      />
                    </label>
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="admin-button-primary min-h-11 px-5 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer la configuration"}
        </button>
      </div>
    </form>
  );
}

export default ShopPaymentSettings;
