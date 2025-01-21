import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const useCSRF = () => {
  const [csrf, setCsrf] = useState<string | null>(null);

  const getCSRF = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}csrf-token`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error(
          "Une erreur est survenue lors de la récupération du CSRF !"
        );
      } else {
        const result = await response.json();
        setCsrf(result.csrfToken);
      }
    } catch (error) {
      console.log(error);

      toast.error("Erreur réseau lors de la récupération du CSRF !");
    }
  }, []);

  useEffect(() => {
    getCSRF();
  }, [getCSRF]);

  return csrf;
};

export default useCSRF;
