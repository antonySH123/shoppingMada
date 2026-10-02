import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { LiaUserSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";
import Preloader from "./loading/Preloader";
function Login() {
  const { setUserInfo } = useAuth();
  const [userAuth, setUserAuth] = useState({ emailOrPhone: "", password: "" });
  const [isSubmited, setIsSubmited] = useState<boolean>(false);
  const navigate = useNavigate();
  const csrf = useCSRF();
  const location = useLocation();

  const from = location.state?.from || "/profil";
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmited(true);
    try {
      if (csrf) {
        const postdata = await fetch(
          `${import.meta.env.REACT_API_URL}auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify(userAuth),
          }
        );
        const response = await postdata.json();
        if (postdata.status === 403) {
          setUserInfo(response.userInfo);
          toast.warning(response.message);
          navigate("/none");
        }

        if (postdata.status === 412) {
          toast.error(response.message);
        }

        if (postdata.status === 401 && response.status === "Failed") {
          toast.error(response.message);
        }

        if (postdata.status === 201 && response.status === "Success") {
          setUserInfo(response.userInfo);
          toast.success("Vous êtes connécté!");
          navigate(from, { replace: true });
        }
        if (
          postdata.status === 200 &&
          response.status === "Verification Failed"
        ) {
          setUserInfo(response.userInfo);
          toast.warning("Veuillez confimé votre adresse mail!");
          navigate("/confirmCompte", { replace: true });
        }
      } else {
        toast.error("Une erreur est survenu!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsSubmited(false);
    }
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserAuth((prevAuthUser) => ({ ...prevAuthUser, [name]: value }));
  };

  return (
    !csrf ? <Preloader/> :
    <div className="auth-page auth-login-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(22,131,75,0.12),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(15,89,54,0.12),transparent_35%)]" aria-hidden="true" />
      <Link to={"/"} aria-label="Retour à l'accueil" className="absolute left-5 top-4 h-16 w-32 sm:left-10 sm:top-7">
        <img src="/src/assets/logo.png" alt="" className="object-contain" />
      </Link>
      <div className="relative w-full max-w-md">
        <div className="auth-panel auth-card rounded-3xl border border-gray-100 bg-white p-7 sm:p-10">
          <h1 className="mb-2 flex flex-col items-center text-center font-bold text-gray-900">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"><LiaUserSolid size={28} /></span>
            <strong className="text-2xl">Bon retour</strong>
          </h1>
          <p className="mb-7 text-center text-sm text-gray-500">Connectez-vous à votre espace ShopInMada.</p>
          <form action="" method="post" onSubmit={handleSubmit}>
            <div className="my-4">
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">Adresse e-mail ou téléphone</label>
              <input
                type="text"
                name="emailOrPhone"
                value={userAuth.emailOrPhone}
                onChange={handleChange}
                id="email"
                className="market-input w-full"
                placeholder="nom@exemple.com"
                disabled={isSubmited}
              />
            </div>
            <div className="my-4">
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">Mot de passe</label>
              <input
                type="password"
                name="password"
                id="password"
                value={userAuth.password}
                onChange={handleChange}
                className="market-input w-full"
                placeholder="Votre mot de passe"
                disabled={isSubmited}
              />
            </div>
            <div className="flex items-center justify-end">
              <Link to="/forgotPass" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">
                Mot de passe oublié
              </Link>
            </div>
            <button
              className="market-button-primary mt-6 mb-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmited}
            >
              {isSubmited ? (
                <>
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 me-3 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-sm">veuillez patienter</span>
                </>
              ) : (
                <span className="text-sm uppercase">Se connecter</span>
              )}
            </button>
            <div className="flex justify-between items-center">
              <span className="mt-3 flex w-full justify-center gap-2 text-sm text-gray-600">
                Pas encore de compte ?
                <Link to="/register" className="font-semibold text-emerald-800">
                  S'inscrire
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
