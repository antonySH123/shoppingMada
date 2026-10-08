import React, { useState } from "react";
import { LiaEnvelopeOpen } from "react-icons/lia";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import { useNavigate } from "react-router-dom";
import Preloader from "./loading/Preloader";
import { useLanguage } from "../context/useLanguage";

function EmailForgotPass() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const csrf = useCSRF();
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    try {
      if (!csrf) throw new Error("Jeton de sécurité indisponible. Réessayez.");
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}auth/forgotpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ email: email.trim() }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || "Impossible de démarrer la récupération.",
        );
      }
      toast.success(result.message);
      navigate("/confirmCompte?flow=password-reset", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue!",
      );
    } finally {
      setIsSubmitted(false);
    }
  };
  return !csrf ? (
    <Preloader />
  ) : (
    <div className="auth-page relative flex items-center justify-center">
      <div className="auth-panel w-full max-w-lg">
        <h1 className="text-white font-bold text-center mb-6 flex flex-col justify-center items-center">
          <LiaEnvelopeOpen size={60} />
          <strong className="text-2xl">{t("auth.emailTitle")}</strong>
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="relative my-4">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-72 py-5 px-0 text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
              placeholder={t("auth.emailPlaceholder")}
              disabled={isSubmitted}
              required
            />
          </div>
          <button
            className="w-full mt-6 rounded-full bg-emerald-600 text-white shadow shadow-emerald-600 hover:bg-emerald-600 hover:text-white py-2 transition-colors"
            type="submit"
            disabled={isSubmitted}
          >
            {isSubmitted ? t("auth.sending") : t("auth.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailForgotPass;
