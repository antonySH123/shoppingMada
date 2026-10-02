import { MdOutlinePhonelinkRing } from "react-icons/md";
import { useState, useRef, ChangeEvent, ClipboardEvent, KeyboardEvent, FormEvent, useCallback } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import { useAuth } from "../helper/useAuth";
import Preloader from "./loading/Preloader";

function RegisterConfirmation() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const csrf = useCSRF();
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from === "/forgotPass" ? "/resetPassword" : "/profil";

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedCode) return;
    event.preventDefault();
    const nextCode = new Array(6).fill("");
    pastedCode.split("").forEach((digit, index) => { nextCode[index] = digit; });
    setCode(nextCode);
    inputRefs.current[Math.min(pastedCode.length, 6) - 1]?.focus();
  };

  const handleSubmit = useCallback(async () => {
    const codeEntered = code.join("");
    if (codeEntered.length < 6) {
      toast.error("Veuillez entrer le code complet.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!csrf) {
        toast.error("Erreur de sécurité. Veuillez réessayer.");
        return;
      }
      const response = await fetch(`${import.meta.env.REACT_API_URL}email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf },
        credentials: "include",
        body: JSON.stringify({ OTP: codeEntered }),
      });
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Erreur de vérification. Veuillez réessayer.");
        if (response.status === 403) setCode(new Array(6).fill(""));
        return;
      }
      if (response.status === 201) {
        toast.success("Compte vérifié avec succès !");
        setTimeout(() => navigate(from, { replace: true }), 2000);
      }
    } catch {
      toast.error("Une erreur est survenue. Veuillez vérifier votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, csrf, from, navigate]);

  if (!user) return <Navigate to="/login" />;
  if (!csrf) return <Preloader />;

  return (
    <div className="otp-page">
      <div className="otp-grid" aria-hidden="true" />
      <div className="otp-orb otp-orb-one" aria-hidden="true" />
      <div className="otp-orb otp-orb-two" aria-hidden="true" />
      <main className="otp-card">
        <div className="otp-security-badge"><span /><span /><span /> Connexion sécurisée</div>
        <div className="otp-icon"><MdOutlinePhonelinkRing /></div>
        <p className="otp-eyebrow">VALIDATION DE VOTRE COMPTE</p>
        <h1>Entrez votre code de sécurité.</h1>
        <p className="otp-description">Consultez votre téléphone ou votre boîte e-mail : un code à 6 chiffres vous a été envoyé.</p>
        <div className="otp-progress" aria-label="Étape 2 sur 2"><span /><span className="is-active" /></div>
        <form className="otp-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void handleSubmit(); }}>
          <div className="otp-inputs">
            {code.map((digit, index) => (
              <div key={index} className={`otp-input-shell ${digit ? "is-filled" : ""}`}>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Chiffre ${index + 1} du code`}
                  className="otp-input"
                  value={digit}
                  maxLength={1}
                  onChange={(event) => handleInputChange(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={handlePaste}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
          <p className="otp-paste-hint">Vous pouvez coller le code complet.</p>
          <div className="otp-submit-wrap">
            <button type="submit" name="valider" className="otp-submit" disabled={isSubmitting}>
              {isSubmitting ? "Validation…" : "Valider mon compte"}<span>→</span>
            </button>
          </div>
        </form>
        <p className="otp-footnote">Pour votre sécurité, le code expire après un court délai.</p>
      </main>
    </div>
  );
}

export default RegisterConfirmation;
