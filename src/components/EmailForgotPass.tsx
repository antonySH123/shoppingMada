import React, { useState } from "react";
import { LiaEnvelopeOpen } from "react-icons/lia";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import Preloader from "./loading/Preloader";

function EmailForgotPass() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const csrf = useCSRF();
  const { setUserInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    try {
      // Simuler une requête
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}auth/forgotpassword`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify({ email: email }),
          }
        );
        if (response.ok && response.status === 201) {
          const { userInfo } = await response.json();
          setUserInfo(userInfo);
          toast.success("Email soumis avec succès!");
          navigate("/confirmCompte", { state: { from: location.pathname } });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Une erreur est survenue!");
    }

    setIsSubmitted(false);
  };
  return !csrf ? (
    <Preloader />
  ) : (
    <div className="text-white w-full h-screen flex justify-center items-center bg-green-900 bg-[url('../src/assets/image/about/about.jpg')] bg-blend-multiply">
      <div className="bg-green-950 shadow-xl border border-green-500 shadow-green-500 rounded-md p-8 backdrop-filter backdrop-blur-sm relative">
        <h1 className="text-white font-bold text-center mb-6 flex flex-col justify-center items-center">
          <LiaEnvelopeOpen size={60} />
          <strong className="text-2xl">Entrer votre Email</strong>
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="relative my-4">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-72 py-5 px-0 text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
              placeholder="Votre email"
              disabled={isSubmitted}
              required
            />
          </div>
          <button
            className="w-full mt-6 rounded-full bg-emerald-600 text-white shadow shadow-emerald-600 hover:bg-emerald-600 hover:text-white py-2 transition-colors"
            type="submit"
            disabled={isSubmitted}
          >
            {isSubmitted ? "Envoi en cours..." : "Soumettre"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailForgotPass;
