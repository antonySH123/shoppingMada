import { useContext } from "react";
import { CartContext } from "./cart-context";

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans CartProvider.");
  return context;
}