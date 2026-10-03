import { LiaShoppingBagSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartHeaderLink() {
  const { itemCount } = useCart();

  return (
    <Link
      to="/panier"
      aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}
      className="customer-cart-link relative inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
    >
      <LiaShoppingBagSolid size={21} />
      <span className="hidden lg:inline">Panier</span>
      {itemCount > 0 && (
        <span className="customer-cart-count">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

export default CartHeaderLink;
