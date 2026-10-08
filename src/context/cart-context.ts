import { createContext } from "react";

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  shopId: string;
  shopName: string;
  variants: Record<string, string>;
  stock?: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (item: CartItem) => boolean;
  setQuantity: (
    productId: string,
    variants: Record<string, string>,
    quantity: number,
  ) => void;
  removeItem: (productId: string, variants: Record<string, string>) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
