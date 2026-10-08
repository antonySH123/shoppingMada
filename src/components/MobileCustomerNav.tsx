import {
  LiaHomeSolid,
  LiaSearchSolid,
  LiaShoppingBagSolid,
  LiaStoreSolid,
  LiaUser,
} from "react-icons/lia";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../helper/useAuth";
import { useCart } from "../context/useCart";
import { useLanguage } from "../context/useLanguage";

function MobileCustomerNav() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const roleName = user?.userGroupMember_id?.usergroup_id?.name;
  const isProfessional = Boolean(roleName && roleName !== "Client");
  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const items = [
    {
      to: "/",
      label: t("nav.mobileHome"),
      icon: <LiaHomeSolid size={21} />,
      active: isActive("/"),
    },
    {
      to: "/shop",
      label: t("nav.mobileExplore"),
      icon: <LiaSearchSolid size={21} />,
      active: isActive("/shop"),
    },
    {
      to: "/panier",
      label: itemCount
        ? `${t("nav.mobileCart")} ${itemCount > 99 ? "99+" : itemCount}`
        : t("nav.mobileCart"),
      icon: <LiaShoppingBagSolid size={21} />,
      active: isActive("/panier"),
    },
    {
      to: user ? "/profil" : "/login",
      label: t("nav.mobileAccount"),
      icon: <LiaUser size={21} />,
      active: isActive(user ? "/profil" : "/login"),
    },
    {
      to: isProfessional ? "/espace_vendeur/dash" : "/vendeur",
      label: isProfessional ? t("nav.sellerSpace") : t("nav.mobileSell"),
      icon: <LiaStoreSolid size={21} />,
      active: isProfessional
        ? isActive("/espace_vendeur")
        : isActive("/vendeur"),
    },
  ];

  return (
    <nav className="customer-mobile-nav" aria-label={t("nav.mobileNavigation")}>
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
