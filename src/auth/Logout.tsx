import { useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";  
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";

function Logout() {
  // const navigate = useNavigate();
  const csrf = useCSRF();

  const logout = useCallback(async () => {
    if (!csrf) return;

    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
        }
      );

      if (response.status === 200) {
        localStorage.removeItem("user");
        localStorage.clear();
        window.location.href = "/login"
      } else {
        toast.error("La déconnexion a échoué.");
      }
    } catch (error) {
      console.error("Erreur logout :", error);
      toast.error("Erreur réseau lors de la déconnexion.");
    } 
  }, [csrf]);

  useEffect(() => {
    if (csrf) {
      logout();
    }
  }, [csrf, logout]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
    </div>
  );
}

export default Logout;
