import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useCSRF = () => {
  const [csrf, setCsrf] = useState<string | null>(null);

  useEffect(() => {
    const getCSRF = async () => {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}csrf-token`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur CSRF - Backend:", errorText);
        toast.error("Erreur lors de la récupération du CSRF.");
        return;
      }
  
      const result = await response.json();
  
      if (result?.csrfToken) {
        setCsrf(result.csrfToken);
      } else {
        console.warn("CSRF token manquant dans la réponse :", result);
        toast.error("Le token CSRF est manquant.");
      }
    }
    getCSRF();
  }, []);

  return csrf;
};

export default useCSRF;
