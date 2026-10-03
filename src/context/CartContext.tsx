import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  clearCart: () => void;
}

const storageKey = "shopinmada.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

const variantKey = (variants: Record<string, string>) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(variants).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(storageKey);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            item &&
            typeof item.productId === "string" &&
            typeof item.shopId === "string" &&
            Number.isFinite(item.unitPrice) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        )
      : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    const existing = items.find(
      (item) =>
        item.productId === newItem.productId &&
        variantKey(item.variants) === variantKey(newItem.variants),
    );
    const nextQuantity = (existing?.quantity ?? 0) + newItem.quantity;
    if (newItem.stock !== undefined && nextQuantity > newItem.stock)
      return false;

    setItems((current) => {
      const matchingItem = current.find(
        (item) =>
          item.productId === newItem.productId &&
          variantKey(item.variants) === variantKey(newItem.variants),
      );
      if (!matchingItem) return [...current, newItem];
      return current.map((item) =>
        item === matchingItem ? { ...item, quantity: nextQuantity } : item,
      );
    });
    return true;
  };

  const setQuantity = (
    productId: string,
    variants: Record<string, string>,
    quantity: number,
  ) => {
    const safeQuantity = Math.max(1, Math.min(100, Math.floor(quantity)));
    setItems((current) =>
      current.map((item) => {
        if (
          item.productId !== productId ||
          variantKey(item.variants) !== variantKey(variants)
        )
          return item;
        return {
          ...item,
          quantity:
            item.stock === undefined
              ? safeQuantity
              : Math.min(safeQuantity, item.stock),
        };
      }),
    );
  };

  const removeItem = (productId: string, variants: Record<string, string>) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.productId !== productId ||
          variantKey(item.variants) !== variantKey(variants),
      ),
    );
  };

  const clearCart = () => setItems([]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, addItem, setQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans CartProvider.");
  return context;
}
