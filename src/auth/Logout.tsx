import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";

function Logout() {
  const csrf = useCSRF();
  const navigate = useNavigate();
  const { setUserInfo } = useAuth();
  const logoutStarted = useRef(false);

  useEffect(() => {
    if (!csrf || logoutStarted.current) return;
    logoutStarted.current = true;

    void (async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_API_URL}auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          credentials: "include",
        });
        if (!response.ok) throw new Error("La déconnexion a échoué.");
        setUserInfo(null);
        navigate("/login", { replace: true, state: { fromLogout: true } });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur réseau lors de la déconnexion.");
      }
    })();
  }, [csrf, navigate, setUserInfo]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="font-medium text-gray-600">Déconnexion en cours…</p>
      </div>
    </div>
  );
}

export default Logout;
