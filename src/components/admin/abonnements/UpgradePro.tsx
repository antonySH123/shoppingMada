import { FormEvent, useState } from "react";
import { FaBolt, FaChartLine, FaCheck, FaCrown, FaShieldAlt, FaStore } from "react-icons/fa";
import number from "../../../data/number.json";
import useCSRF from "../../../helper/useCSRF";
import useFormatter from "../../../helper/useFormatter";
import { toast } from "react-toastify";

function UpgradePro() {
  const csrf = useCSRF();
  const { priceInArriary } = useFormatter();
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [transactionPhoneNumber, setTransactionPhoneNumber] = useState("");
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrf || !selectedNumber) {
      toast.warning("Sélectionnez un opérateur de paiement pour continuer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xsrf-token": csrf,
        },
        credentials: "include",
        body: JSON.stringify({
          transactionPhoneNumber,
          selectedPhoneNumber: selectedNumber,
          refTransaction: reference,
        }),
      });
      const result = await response.json();
      if (response.status === 201) toast.success(result.message);
      else if (response.ok) toast.warning(result.message);
      else toast.error(result.message || "La demande n’a pas pu être envoyée.");
    } catch {
      toast.error("Impossible de contacter le serveur. Réessayez dans un instant.");
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
          <span className="upgrade-pro-kicker"><FaBolt /> La croissance de votre boutique commence ici</span>
          <h1>Passez en mode <span>Pro.</span></h1>
          <p>Des outils premium pour développer votre visibilité, mieux présenter vos produits et faire grandir votre activité.</p>
          <div className="upgrade-pro-trust"><FaShieldAlt /> Paiement mobile sécurisé · Activation après validation</div>
        </div>
        <div className="upgrade-pro-hero-mark" aria-hidden="true"><FaCrown /></div>
      </section>

      <section className="upgrade-pro-content">
        <div className="upgrade-pro-benefits">
          <div className="upgrade-pro-section-heading">
            <span>SHOPINMADA PRO</span>
            <h2>Votre activité, avec plus d’impact.</h2>
            <p>Tout ce qu’il faut pour donner à votre boutique les moyens de ses ambitions.</p>
          </div>
          <div className="upgrade-pro-feature-grid">
            <article className="upgrade-pro-feature"><span><FaStore /></span><h3>Catalogue sans limite</h3><p>Publiez tous vos produits et faites évoluer votre vitrine à votre rythme.</p></article>
            <article className="upgrade-pro-feature"><span><FaChartLine /></span><h3>Plus de visibilité</h3><p>Mettez vos produits en avant et attirez de nouveaux clients.</p></article>
            <article className="upgrade-pro-feature"><span><FaBolt /></span><h3>Outils professionnels</h3><p>Gérez votre activité avec des fonctionnalités conçues pour les vendeurs.</p></article>
            <article className="upgrade-pro-feature"><span><FaShieldAlt /></span><h3>Assistance prioritaire</h3><p>Profitez d’un accompagnement dédié lorsque vous en avez besoin.</p></article>
          </div>
        </div>

        <aside className="upgrade-pro-checkout">
          <div className="upgrade-pro-plan-head">
            <span className="upgrade-pro-plan-badge"><FaCrown /> Offre professionnelle</span>
            <h2>Abonnement mensuel</h2>
            <p className="upgrade-pro-price">{priceInArriary(50000)}<span> / mois</span></p>
            <p className="upgrade-pro-plan-note">Sans engagement annuel. Votre demande sera traitée par notre équipe.</p>
          </div>
          <form onSubmit={handleSubmit} className="upgrade-pro-payment-form">
            <fieldset>
              <legend>1. Choisissez votre opérateur</legend>
              <div className="upgrade-pro-operators">
                {number.map((operator) => (
                  <button
                    type="button"
                    key={operator.phonenumber}
                    aria-pressed={selectedNumber === operator.phonenumber}
                    onClick={() => setSelectedNumber(operator.phonenumber)}
                    className={`upgrade-pro-operator ${selectedNumber === operator.phonenumber ? "is-selected" : ""}`}
                  >
                    <span className="upgrade-pro-operator-check"><FaCheck /></span>
                    <strong>{operator.name}</strong>
                    <small>{operator.phonenumber}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>2. Confirmez votre transfert</legend>
              <label>Numéro utilisé pour le paiement<input type="tel" inputMode="tel" autoComplete="tel" value={transactionPhoneNumber} onChange={(event) => setTransactionPhoneNumber(event.target.value)} placeholder="Ex. 034 12 345 67" required /></label>
              <label>Référence de la transaction<input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Référence indiquée par l’opérateur" required /></label>
            </fieldset>
            <button type="submit" disabled={isSubmitting} className="upgrade-pro-submit">{isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}<span>→</span></button>
            <p className="upgrade-pro-legal"><FaShieldAlt /> Vos informations sont utilisées uniquement pour vérifier votre paiement.</p>
          </form>
        </aside>
      </section>
    </main>
  );
}

export default UpgradePro;
