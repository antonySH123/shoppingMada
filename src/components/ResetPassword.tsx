import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LiaUserCogSolid} from "react-icons/lia";
import useCSRF from "../helper/useCSRF";

function ResetPassword() {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const csrf = useCSRF();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      setIsSubmitting(false);
      return;
    }

    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}auth/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify({ password: passwordData.newPassword }),
          }
        );

        const result = await response.json();
        if (result.status === "Failed") {
          toast.error(result.message);
        } else {
          toast.success("Mot de passe réinitialisé avec succès !");
          navigate("/login");
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

  return (
    <div className="text-white w-full h-[100vh] flex justify-center items-center bg-green-900 bg-[url('../src/assets/image/about/about.jpg')] bg-blend-multiply">
      <div>
        <div className="bg-green-950 shadow-xl border border-green-500 shadow-green-500 rounded-md p-8 backdrop-filter backdrop-blur-sm relative">
          <h1 className="text-white font-bold text-center mb-6 flex flex-col justify-center items-center">
            <LiaUserCogSolid size={60} />
            <strong className="text-2xl">Réinitialiser le mot de passe</strong>
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="relative my-4">
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="block w-72 py-5 px-0 text-white bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder="Nouveau mot de passe"
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
                placeholder="Confirmer le mot de passe"
                disabled={isSubmitting}
              />
            </div>
            <button
              className="w-full mt-6 rounded-full bg-emerald-600 text-white shadow shadow-emerald-600 hover:bg-emerald-600 hover:text-white py-2 transition-colors"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="text-sm">Veuillez patienter...</span>
              ) : (
                <span className="text-sm uppercase">Réinitialiser</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
