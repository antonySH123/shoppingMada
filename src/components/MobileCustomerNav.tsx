import { LiaHomeSolid, LiaSearchSolid, LiaStoreSolid, LiaUser } from "react-icons/lia";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../helper/useAuth";

function MobileCustomerNav() {
  const { user } = useAuth();
  const location = useLocation();
  const roleName = user?.userGroupMember_id?.usergroup_id?.name;
  const isProfessional = Boolean(roleName && roleName !== "Client");
  const isActive = (path: string) =>
    path === "/" ? location.pathname === path : location.pathname.startsWith(path);

  const items = [
    { to: "/", label: "Accueil", icon: <LiaHomeSolid size={21} />, active: isActive("/") },
    { to: "/shop", label: "Explorer", icon: <LiaSearchSolid size={21} />, active: isActive("/shop") },
    { to: user ? "/profil" : "/login", label: "Compte", icon: <LiaUser size={21} />, active: isActive(user ? "/profil" : "/login") },
    {
      to: isProfessional ? "/espace_vendeur/dash" : "/vendeur",
      label: isProfessional ? "Mon espace" : "Vendre",
      icon: <LiaStoreSolid size={21} />,
      active: isProfessional ? isActive("/espace_vendeur") : isActive("/vendeur"),
    },
  ];

  return (
    <nav className="customer-mobile-nav" aria-label="Navigation mobile">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          aria-current={item.active ? "page" : undefined}
          className={`customer-mobile-nav-item${item.active ? " is-active" : ""}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default MobileCustomerNav;
