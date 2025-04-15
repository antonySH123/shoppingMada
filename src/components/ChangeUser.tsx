import { useCallback, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";

function ChangeUser() {
  const { setUserInfo } = useAuth();
  const csrf = useCSRF();
  const navigate = useNavigate();

  const regenerate = useCallback(async () => {
    if (!csrf) return;

    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
        }
      );

      if (response.status === 201) {
        const data = await response.json();
        setUserInfo(data.userInfo);
        navigate("/espace_vendeur/dash");
      } else {
        // En cas d’échec, rediriger ou gérer différemment
        navigate("/login");
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token :", error);
      navigate("/login");
    }
  }, [csrf, navigate, setUserInfo]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
    </div>
  );
}

export default ChangeUser;
