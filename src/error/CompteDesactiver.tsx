import { Link } from "react-router-dom";
import { FaArrowDown, FaArrowLeft, FaCheckCircle, FaEnvelope, FaLock, FaPhone, FaShieldAlt } from "react-icons/fa";
import Contact from "../components/Contact";
import { useLanguage } from "../context/useLanguage";
import { useAuth } from "../helper/useAuth";

function CompteDesactiver() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        eyebrow: "ACCOUNT ACCESS · SECURITY",
        status: "ACCESS PAUSED",
        title: "Your account is disabled",
        intro: "Your access to ShopInMada services has been temporarily restricted by the platform team.",
        detailTitle: "What does this mean?",
        detail: "You cannot sign in to your customer or seller workspace while the account is disabled. Your existing account data is kept. Contact support to request a review; only an administrator can restore access.",
        account: "ACCOUNT DETAILS",
        accountName: "Account",
        accountEmail: "Email address",
        next: "NEXT STEPS",
        nextTitle: "Ask our team to review your access",
        nextDetail: "Send a message with the email address on your account. Our support team will review the request and get back to you.",
        contact: "Contact support",
        call: "Call support",
        response: "Your request is recorded as a support ticket.",
        home: "Back to home",
        logout: "Sign out",
        contactSubject: "Review my disabled ShopInMada account",
        footer: "Account access is managed by the ShopInMada support team.",
      }
    : {
        eyebrow: "ACCES AU COMPTE · SECURITE",
        status: "ACCES SUSPENDU",
        title: "Votre compte est desactive",
        intro: "L'acces a vos services ShopInMada a ete temporairement restreint par l'equipe de la plateforme.",
        detailTitle: "Qu'est-ce que cela signifie ?",
        detail: "Vous ne pouvez pas vous connecter a votre espace client ou vendeur tant que le compte est desactive. Les donnees existantes de votre compte sont conservees. Contactez le support pour demander une verification; seul un administrateur peut retablir l'acces.",
        account: "INFORMATIONS DU COMPTE",
        accountName: "Compte",
        accountEmail: "Adresse e-mail",
        next: "ETAPES SUIVANTES",
        nextTitle: "Demandez une verification de votre acces",
        nextDetail: "Envoyez un message avec l'adresse e-mail associee a votre compte. Notre equipe examinera votre demande et vous repondra.",
        contact: "Contacter le support",
        call: "Appeler le support",
        response: "Votre demande sera enregistree comme ticket de support.",
        home: "Retour a l'accueil",
        logout: "Se deconnecter",
        contactSubject: "Verification de mon compte ShopInMada desactive",
        footer: "L'acces aux comptes est gere par l'equipe de support ShopInMada.",
      };

  const scrollToContact = () => document.getElementById("disabled-account-contact")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="disabled-access-page">
      <main className="disabled-access-shell">
        <header className="disabled-access-header">
          <Link to="/" className="disabled-access-brand" aria-label="ShopInMada - accueil">
            <img src="/logo.png" alt="" />
            <span>ShopInMada</span>
          </Link>
          <span className="disabled-access-secure"><FaShieldAlt aria-hidden="true" /> {copy.eyebrow}</span>
        </header>

        <section className="disabled-access-hero" aria-labelledby="disabled-access-title">
          <div className="disabled-access-main-card">
            <div className="disabled-access-status"><span className="disabled-access-status-dot" /><FaLock aria-hidden="true" /> {copy.status}</div>
            <h1 id="disabled-access-title">{copy.title}</h1>
            <p className="disabled-access-intro">{copy.intro}</p>

            <div className="disabled-access-explanation">
              <span className="disabled-access-explanation-icon"><FaShieldAlt aria-hidden="true" /></span>
              <div><h2>{copy.detailTitle}</h2><p>{copy.detail}</p></div>
            </div>

            {user && <div className="disabled-access-account">
              <p className="disabled-access-kicker">{copy.account}</p>
              <div className="disabled-access-account-grid">
                <div><span>{copy.accountName}</span><strong>{user.username || "ShopInMada"}</strong></div>
                <div><span>{copy.accountEmail}</span><strong><FaEnvelope aria-hidden="true" /> {user.email}</strong></div>
              </div>
            </div>}

            <div className="disabled-access-actions">
              <button type="button" className="disabled-access-primary" onClick={scrollToContact}>{copy.contact}<FaArrowDown aria-hidden="true" /></button>
              <a className="disabled-access-phone" href="tel:+261345385365"><FaPhone aria-hidden="true" /> {copy.call} <span>+261 34 53 853 65</span></a>
            </div>
            <p className="disabled-access-ticket"><FaCheckCircle aria-hidden="true" /> {copy.response}</p>
          </div>

          <aside className="disabled-access-next-card">
            <span className="disabled-access-orbit disabled-access-orbit-one" />
            <span className="disabled-access-orbit disabled-access-orbit-two" />
            <div className="disabled-access-next-icon"><FaEnvelope aria-hidden="true" /></div>
            <p className="disabled-access-kicker">{copy.next}</p>
            <h2>{copy.nextTitle}</h2>
            <p>{copy.nextDetail}</p>
            <div className="disabled-access-next-step"><span>01</span><span>{copy.contact}</span><FaArrowDown aria-hidden="true" /></div>
            <div className="disabled-access-next-step"><span>02</span><span>{copy.response}</span><FaCheckCircle aria-hidden="true" /></div>
          </aside>
        </section>

        <footer className="disabled-access-footer">
          <Link to="/"><FaArrowLeft aria-hidden="true" /> {copy.home}</Link>
          <Link to="/logout">{copy.logout}</Link>
          <span>{copy.footer}</span>
        </footer>
      </main>

      <div id="disabled-account-contact" className="disabled-access-contact-wrap">
        <Contact initialName={user?.username ?? ""} initialEmail={user?.email ?? ""} initialSubject={copy.contactSubject} />
      </div>
    </div>
  );
}

export default CompteDesactiver;
