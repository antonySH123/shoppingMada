import { Navigate } from "react-router-dom";
import { useAuth } from "./UserContext";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading"

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de synchronisation
    const checkAuth = setTimeout(() => {
      setLoading(false); // Le chargement est terminé après un délai
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [token, user]);

  if (loading) {
    return <div>
        <ReactLoading type="bars"  height={'20%'} width={'20%'} />
    </div>; // Affichez un écran de chargement
  }

  if (!token || (role && user?.userGroup !== role)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
