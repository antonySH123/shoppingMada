import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LiaUserCogSolid } from "react-icons/lia";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";
import Preloader from "./loading/Preloader";
import { useLanguage } from "../context/useLanguage";

function ResetPassword() {
  const { t } = useLanguage();
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const csrf = useCSRF();
  const { setUserInfo } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      setIsSubmitting(false);
      return;
    }

    try {
      if (csrf) {
        const response = await fetch(`${import.meta.env.REACT_API_URL}email/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ password: passwordData.newPassword }),
        });

        const result = await response.json();
        if (!response.ok) {
          toast.error(result.message || "Impossible de réinitialiser le mot de passe.");
        } else {
          toast.success("Mot de passe réinitialisé avec succès !");
          setPasswordData({ newPassword: "", confirmPassword: "" });
          setUserInfo(null);
          navigate("/login", { replace: true });
        }
      } else {
        toast.error("Une erreur est survenue !");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erreur de connexion au serveur !");
    }
    setIsSubmitting(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="auth-page relative flex items-center justify-center">
      <div>
        <div className="auth-panel w-full max-w-lg">
          <h1 className="text-white font-bold text-center mb-6 flex flex-col justify-center items-center">
            <LiaUserCogSolid size={60} />
            <strong className="text-2xl">{t("auth.resetTitle")}</strong>
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="relative my-4">
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="block w-72 py-5 px-0 text-white bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder={t("auth.newPassword")}
                disabled={isSubmitting}
              />
            </div>
            <div className="relative my-4">
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="block w-72 py-5 px-0 text-white bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder={t("auth.confirmPassword")}
                disabled={isSubmitting}
              />
            </div>
            <button
              className="w-full mt-6 rounded-full bg-emerald-600 text-white shadow shadow-emerald-600 hover:bg-emerald-600 hover:text-white py-2 transition-colors"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="text-sm">{t("auth.wait")}...</span>
              ) : (
                <span className="text-sm uppercase">{t("auth.reset")}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
