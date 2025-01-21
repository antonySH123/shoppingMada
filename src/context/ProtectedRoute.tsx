import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading"
import { useAuth } from "../helper/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const checkAuth = setTimeout(() => {
      setLoading(false); 
    }, 100);
    return () => clearTimeout(checkAuth);
  }, [user]);
  if (loading) {
    return <div>
        <ReactLoading type="bars"  height={'20%'} width={'20%'} />
    </div>; // Affichez un écran de chargement
  }

  if (!user || (role && user?.userGroup !== role)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
