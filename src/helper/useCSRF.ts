import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useCSRF = () => {
  const [csrf, setCsrf] = useState<string | null>(() => {
    return localStorage.getItem("csrfToken");
  });

  useEffect(() => {
    // Si on a déjà le token, pas besoin de le récupérer
    if (csrf) return;

    const fetchCSRF = async () => {
      try {
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
          localStorage.setItem("csrfToken", result.csrfToken);
          setCsrf(result.csrfToken);
        } else {
          console.warn("CSRF token manquant dans la réponse :", result);
          toast.error("Le token CSRF est manquant.");
        }
      } catch (err) {
        console.error("Erreur CSRF :", err);
        toast.error("Impossible de récupérer le token CSRF.");
      }
    };

    fetchCSRF();
  }, [csrf]);

  return csrf;
};

export default useCSRF;
