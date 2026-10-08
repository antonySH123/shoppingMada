import { MdOutlinePhonelinkRing } from "react-icons/md";
import {
  useState,
  useRef,
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  FormEvent,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import Preloader from "./loading/Preloader";
import { useLanguage } from "../context/useLanguage";

function RegisterConfirmation() {
  const { t } = useLanguage();
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const csrf = useCSRF();
  const location = useLocation();
  const isPasswordReset =
    location.state?.from === "/forgotPass" ||
    new URLSearchParams(location.search).get("flow") === "password-reset";
  const from = isPasswordReset ? "/resetPassword" : "/profil";

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedCode) return;
    event.preventDefault();
    const nextCode = new Array(6).fill("");
    pastedCode.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });
    setCode(nextCode);
    inputRefs.current[Math.min(pastedCode.length, 6) - 1]?.focus();
  };

  const handleSubmit = useCallback(async () => {
    const codeEntered = code.join("");
    if (codeEntered.length < 6) {
      toast.error(t("verify.codeRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (!csrf) {
        toast.error(t("verify.securityError"));
        return;
      }
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}email/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          credentials: "include",
          body: JSON.stringify({ OTP: codeEntered }),
        },
      );
      if (!response.ok) {
        await response.json().catch(() => null);
        toast.error(
          t("verify.invalidCode"),
        );
        setCode(new Array(6).fill(""));
        return;
      }
      if (response.status === 201) {
        toast.success(
          isPasswordReset
            ? t("verify.addressVerified")
            : t("verify.accountVerified"),
        );
        setTimeout(() => navigate(from, { replace: true }), 2000);
      }
    } catch {
      toast.error(
        t("verify.connectionError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [code, csrf, from, isPasswordReset, navigate, t]);

  if (!csrf) return <Preloader />;

  return (
    <div className="otp-page">
      <div className="otp-grid" aria-hidden="true" />
      <div className="otp-orb otp-orb-one" aria-hidden="true" />
      <div className="otp-orb otp-orb-two" aria-hidden="true" />
      <main className="otp-card">
        <div className="otp-security-badge">
          <span />
          <span />
          <span /> {t("verify.secureConnection")}
        </div>
        <div className="otp-icon">
          <MdOutlinePhonelinkRing />
        </div>
        <p className="otp-eyebrow">
          {isPasswordReset
            ? t("verify.passwordRecovery")
            : t("verify.accountValidation")}
        </p>
        <h1>{t("verify.enterCode")}</h1>
        <p className="otp-description">
          {t("verify.emailCodeHint")}
        </p>
        <div className="otp-progress" aria-label={t("verify.stepProgress")}>
          <span />
          <span className="is-active" />
        </div>
        <form
          className="otp-form"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="otp-inputs">
            {code.map((digit, index) => (
              <div
                key={index}
                className={`otp-input-shell ${digit ? "is-filled" : ""}`}
              >
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={t("verify.codeDigit").replace("{number}", String(index + 1))}
                  className="otp-input"
                  value={digit}
                  maxLength={1}
                  onChange={(event) => handleInputChange(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={handlePaste}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
          <p className="otp-paste-hint">{t("verify.pasteHint")}</p>
          <div className="otp-submit-wrap">
            <button
              type="submit"
              name="valider"
              className="otp-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("verify.submitting") : t("verify.submit")}
              <span>→</span>
            </button>
          </div>
        </form>
        <p className="otp-footnote">
          {t("verify.expiryHint")}
        </p>
      </main>
    </div>
  );
}

export default RegisterConfirmation;
