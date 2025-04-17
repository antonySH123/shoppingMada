import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";

function Logout() {
  const csrf = useCSRF();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const logout = async () => {
      if (!csrf || isLoggingOut) return;
  
      setIsLoggingOut(true);
  
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
  
        console.log(response.status);
        
  
        if (response.ok && response.status === 200) {
          // Nettoyage localStorage
          localStorage.removeItem("user");
          localStorage.removeItem("csrfToken"); // <- si stocké dans localStorage
          // Redirection
          navigate("/login");
        } else {
          toast.error("La déconnexion a échoué.");
        }
      } catch (error) {
        console.error("Erreur logout :", error);
        toast.error("Erreur réseau lors de la déconnexion.");
      } finally {
        setIsLoggingOut(false);
      }
    }
      logout();
    
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Déconnexion en cours...</p>
      </div>
    </div>
  );
}

export default Logout;
