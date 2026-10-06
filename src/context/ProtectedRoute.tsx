import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ReactLoading from "react-loading";
import { useAuth } from "../helper/useAuth";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (authReady && !user) {
      toast.warning("Vous devez vous connecter pour accéder à cet espace.");
    }
  }, [authReady, user]);

  if (!authReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <ReactLoading type="bars" height={48} width={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (
    !["Boutiks", "Super Admin"].includes(
      user.userGroupMember_id?.usergroup_id?.name ?? "",
    )
  )
    return <Navigate to="/profil" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
