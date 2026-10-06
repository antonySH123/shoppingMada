import { FormEvent, useEffect, useState } from "react";
import {
  FaBolt,
  FaChartLine,
  FaCheck,
  FaCrown,
  FaShieldAlt,
  FaStore,
} from "react-icons/fa";
import useCSRF from "../../../helper/useCSRF";
import useFormatter from "../../../helper/useFormatter";
import { toast } from "react-toastify";

interface SubscriptionPaymentMethod {
  _id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

function UpgradePro() {
  const csrf = useCSRF();
  const { priceInArriary } = useFormatter();
  const [paymentMethods, setPaymentMethods] = useState<
    SubscriptionPaymentMethod[]
  >([]);
  const [monthlyPriceMGA, setMonthlyPriceMGA] = useState(50000);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [transactionPhoneNumber, setTransactionPhoneNumber] = useState("");
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}subscription/payment-methods`,
          { credentials: "include", signal: controller.signal },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || "Impossible de charger les moyens de paiement.",
          );
        setPaymentMethods(
          Array.isArray(result.data?.methods) ? result.data.methods : [],
        );
        setMonthlyPriceMGA(Number(result.data?.monthlyPriceMGA ?? 50000));
      } catch (error) {
        if (!controller.signal.aborted)
          toast.error(
            error instanceof Error
              ? error.message
              : "Erreur de chargement des moyens de paiement.",
          );
      } finally {
        if (!controller.signal.aborted) setIsLoadingPaymentMethods(false);
      }
    };
    void fetchPaymentMethods();
    return () => controller.abort();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrf || !selectedMethodId) {
      toast.warning("Sélectionnez un moyen de paiement pour continuer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify({
            plan: "Pro",
            transactionPhoneNumber,
            paymentMethodId: selectedMethodId,
            refTransaction: reference,
          }),
        },
      );
      const result = await response.json();
      if (response.status === 201) toast.success(result.message);
      else if (response.ok) toast.warning(result.message);
      else toast.error(result.message || "La demande n’a pas pu être envoyée.");
    } catch {
      toast.error(
        "Impossible de contacter le serveur. Réessayez dans un instant.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="upgrade-pro-page">
      <section className="upgrade-pro-hero">
        <div className="upgrade-pro-orb upgrade-pro-orb-one" />
        <div className="upgrade-pro-orb upgrade-pro-orb-two" />
        <div className="upgrade-pro-hero-content">
          <span className="upgrade-pro-kicker">
            <FaBolt /> La croissance de votre boutique commence ici
          </span>
          <h1>
            Passez en mode <span>Pro.</span>
          </h1>
          <p>
            Des outils premium pour développer votre visibilité, mieux présenter
            vos produits et faire grandir votre activité.
          </p>
          <div className="upgrade-pro-trust">
            <FaShieldAlt /> Paiement mobile sécurisé · Activation après
            validation
          </div>
        </div>
        <div className="upgrade-pro-hero-mark" aria-hidden="true">
          <FaCrown />
        </div>
      </section>

      <section className="upgrade-pro-content">
        <div className="upgrade-pro-benefits">
          <div className="upgrade-pro-section-heading">
            <span>SHOPINMADA PRO</span>
            <h2>Votre activité, avec plus d’impact.</h2>
            <p>
              Tout ce qu’il faut pour donner à votre boutique les moyens de ses
              ambitions.
            </p>
          </div>
          <div className="upgrade-pro-feature-grid">
            <article className="upgrade-pro-feature">
              <span>
                <FaStore />
              </span>
              <h3>Catalogue sans limite</h3>
              <p>
                Publiez tous vos produits et faites évoluer votre vitrine à
                votre rythme.
              </p>
            </article>
            <article className="upgrade-pro-feature">
              <span>
                <FaChartLine />
              </span>
              <h3>Plus de visibilité</h3>
              <p>
                Mettez vos produits en avant et attirez de nouveaux clients.
              </p>
            </article>
            <article className="upgrade-pro-feature">
              <span>
                <FaBolt />
              </span>
              <h3>Outils professionnels</h3>
              <p>
                Gérez votre activité avec des fonctionnalités conçues pour les
                vendeurs.
              </p>
            </article>
            <article className="upgrade-pro-feature">
              <span>
                <FaShieldAlt />
              </span>
              <h3>Assistance prioritaire</h3>
              <p>
                Profitez d’un accompagnement dédié lorsque vous en avez besoin.
              </p>
            </article>
          </div>
        </div>

        <aside className="upgrade-pro-checkout">
          <div className="upgrade-pro-plan-head">
            <span className="upgrade-pro-plan-badge">
              <FaCrown /> Offre professionnelle
            </span>
            <h2>Abonnement mensuel</h2>
            <p className="upgrade-pro-price">
              {priceInArriary(monthlyPriceMGA)}
              <span> / mois</span>
            </p>
            <p className="upgrade-pro-plan-note">
              Sans engagement annuel. Votre demande sera traitée par notre
              équipe.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="upgrade-pro-payment-form">
            <fieldset>
              <legend>1. Choisissez un moyen de paiement</legend>
              <div className="upgrade-pro-operators">
                {isLoadingPaymentMethods ? (
                  <p role="status">Chargement des moyens de paiement…</p>
                ) : paymentMethods.length === 0 ? (
                  <p>
                    Aucun moyen de paiement n’est disponible pour le moment.
                    Contactez l’assistance.
                  </p>
                ) : (
                  paymentMethods.map((method) => (
                    <button
                      type="button"
                      key={method._id}
                      aria-pressed={selectedMethodId === method._id}
                      onClick={() => setSelectedMethodId(method._id)}
                      className={`upgrade-pro-operator ${selectedMethodId === method._id ? "is-selected" : ""}`}
                    >
                      <span className="upgrade-pro-operator-check">
                        <FaCheck />
                      </span>
                      <strong>{method.name}</strong>
                      <small>
                        {method.accountName} · {method.accountNumber}
                      </small>
                      {method.instructions && (
                        <small>{method.instructions}</small>
                      )}
                    </button>
                  ))
                )}
              </div>
            </fieldset>
            <fieldset>
              <legend>2. Confirmez votre transfert</legend>
              <label>
                Numéro utilisé pour le paiement
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={transactionPhoneNumber}
                  onChange={(event) =>
                    setTransactionPhoneNumber(event.target.value)
                  }
                  placeholder="Ex. 034 12 345 67"
                  required
                />
              </label>
              <label>
                Référence de la transaction
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Référence indiquée par l’opérateur"
                  required
                />
              </label>
            </fieldset>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingPaymentMethods ||
                paymentMethods.length === 0
              }
              className="upgrade-pro-submit"
            >
              {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
              <span>→</span>
            </button>
            <p className="upgrade-pro-legal">
              <FaShieldAlt /> Vos informations sont utilisées uniquement pour
              vérifier votre paiement.
            </p>
          </form>
        </aside>
      </section>
    </main>
  );
}

export default UpgradePro;
