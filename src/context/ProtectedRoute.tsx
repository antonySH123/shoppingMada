import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading"
import { useAuth } from "../helper/useAuth";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children}) => {
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

  if (!user || !["Boutiks","Super Admin"].includes(user?.userGroupMember_id.usergroup_id.name as string) ) {
    toast.warning("Vous devez vous connécté tout d'abort!")
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
