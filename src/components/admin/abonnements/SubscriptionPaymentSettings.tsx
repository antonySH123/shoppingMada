import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FaPlus, FaSave, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import Preloader from "../../loading/Preloader";
import { AdminButton, PageHeader } from "../ui";

interface PaymentMethod {
  _id?: string;
  name: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
}

interface PaymentConfiguration {
  monthlyPriceMGA: number;
  methods: PaymentMethod[];
}

const emptyMethod = (): PaymentMethod => ({
  name: "",
  accountName: "",
  accountNumber: "",
  instructions: "",
  isActive: true,
});

function SubscriptionPaymentSettings() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const [configuration, setConfiguration] = useState<PaymentConfiguration>({
    monthlyPriceMGA: 50000,
    methods: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfiguration = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscription/payment-methods`,
        { credentials: "include" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de charger la configuration.",
        );
      setConfiguration({
        monthlyPriceMGA: Number(result.data?.monthlyPriceMGA ?? 50000),
        methods: Array.isArray(result.data?.methods) ? result.data.methods : [],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur de chargement.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const updateMethod = (
    index: number,
    field: keyof PaymentMethod,
    value: string | boolean,
  ) => {
    setConfiguration((current) => ({
      ...current,
      methods: current.methods.map((method, itemIndex) =>
        itemIndex === index ? { ...method, [field]: value } : method,
      ),
    }));
  };

  const saveConfiguration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrf || saving) return;
    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscription/payment-methods`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          credentials: "include",
          body: JSON.stringify(configuration),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible d’enregistrer la configuration.",
        );
      setConfiguration(result.data);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur d’enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (user?.userGroupMember_id?.usergroup_id?.name !== "Super Admin") {
    return <Navigate to="/espace_vendeur/dash" replace />;
  }
  if (!csrf || loading) return <Preloader />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Abonnements marketplace"
        title="Moyens de paiement"
        description="Configurez les coordonnées et le tarif que les vendeurs verront lors d’une demande d’abonnement."
      />
      <form onSubmit={saveConfiguration} className="space-y-5">
        <section className="admin-panel p-5">
          <div className="admin-field max-w-sm">
            <label htmlFor="subscription-monthly-price">
              Tarif mensuel (MGA)
            </label>
            <input
              id="subscription-monthly-price"
              className="admin-field__control"
              type="number"
              min={0}
              max={1000000000}
              step={1}
              required
              value={configuration.monthlyPriceMGA}
              onChange={(event) =>
                setConfiguration((current) => ({
                  ...current,
                  monthlyPriceMGA: Number(event.target.value),
                }))
              }
            />
          </div>
        </section>

        <section className="admin-panel">
          <header className="admin-panel-heading">
            <div>
              <h2>Coordonnées de paiement</h2>
              <p>
                Les options actives seront proposées aux vendeurs lors de leur
                demande.
              </p>
            </div>
            <AdminButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={configuration.methods.length >= 20}
              onClick={() =>
                setConfiguration((current) => ({
                  ...current,
                  methods: [...current.methods, emptyMethod()],
                }))
              }
            >
              <FaPlus aria-hidden="true" /> Ajouter un moyen
            </AdminButton>
          </header>
          <div className="grid gap-4 p-4">
            {configuration.methods.length === 0 ? (
              <p className="admin-empty-state">
                Aucun moyen de paiement configuré. Ajoutez-en un pour permettre
                aux vendeurs de demander un abonnement.
              </p>
            ) : (
              configuration.methods.map((method, index) => (
                <article
                  key={method._id ?? `new-${index}`}
                  className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-bold text-[var(--admin-text)]">
                      Moyen {index + 1}
                    </h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
                        <input
                          type="checkbox"
                          checked={method.isActive}
                          onChange={(event) =>
                            updateMethod(
                              index,
                              "isActive",
                              event.target.checked,
                            )
                          }
                        />
                        Actif
                      </label>
                      <AdminButton
                        type="button"
                        variant="danger"
                        size="sm"
                        aria-label={`Supprimer le moyen ${index + 1}`}
                        onClick={() =>
                          setConfiguration((current) => ({
                            ...current,
                            methods: current.methods.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          }))
                        }
                      >
                        <FaTrash aria-hidden="true" />
                      </AdminButton>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="admin-field">
                      Opérateur / moyen
                      <input
                        className="admin-field__control"
                        required
                        maxLength={80}
                        value={method.name}
                        onChange={(event) =>
                          updateMethod(index, "name", event.target.value)
                        }
                        placeholder="MVola, Orange Money…"
                      />
                    </label>
                    <label className="admin-field">
                      Nom du titulaire
                      <input
                        className="admin-field__control"
                        required
                        maxLength={120}
                        value={method.accountName}
                        onChange={(event) =>
                          updateMethod(index, "accountName", event.target.value)
                        }
                      />
                    </label>
                    <label className="admin-field">
                      Numéro de paiement
                      <input
                        className="admin-field__control"
                        required
                        maxLength={40}
                        value={method.accountNumber}
                        onChange={(event) =>
                          updateMethod(
                            index,
                            "accountNumber",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="admin-field md:col-span-2">
                      Instructions
                      <textarea
                        className="admin-field__control min-h-20"
                        maxLength={500}
                        value={method.instructions}
                        onChange={(event) =>
                          updateMethod(
                            index,
                            "instructions",
                            event.target.value,
                          )
                        }
                        placeholder="Référence à indiquer, étapes de transfert…"
                      />
                    </label>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
        <div className="flex justify-end">
          <AdminButton
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
          >
            <FaSave aria-hidden="true" /> Enregistrer la configuration
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

export default SubscriptionPaymentSettings;
