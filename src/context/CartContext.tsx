import { ReactNode, useEffect, useState } from "react";
import { CartContext, type CartItem } from "./cart-context";

const storageKey = "shopinmada.cart.v1";

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
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === "object" && value !== null && !Array.isArray(value);

    const normalizeCartItem = (value: unknown): CartItem | null => {
      if (!isRecord(value) || !isRecord(value.variants)) return null;
      const {
        productId,
        name,
        unitPrice,
        quantity,
        image,
        shopId,
        shopName,
        stock,
      } = value;
      const variants = Object.fromEntries(
        Object.entries(value.variants).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      );
      if (
        typeof productId !== "string" ||
        !productId ||
        typeof name !== "string" ||
        typeof unitPrice !== "number" ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0 ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100 ||
        typeof shopId !== "string" ||
        !shopId ||
        typeof shopName !== "string" ||
        (image !== undefined && typeof image !== "string") ||
        (stock !== undefined &&
          (typeof stock !== "number" || !Number.isFinite(stock) || stock < 0))
      )
        return null;

      return {
        productId,
        name,
        unitPrice,
        quantity,
        image: typeof image === "string" ? image : undefined,
        shopId,
        shopName,
        variants,
        stock: typeof stock === "number" ? stock : undefined,
      };
    };
    return Array.isArray(parsed)
      ? parsed
          .map(normalizeCartItem)
          .filter((item): item is CartItem => item !== null)
      : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Keep cart actions usable when browser storage is unavailable or full.
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    let accepted = true;
    setItems((current) => {
      const matchingItem = current.find(
        (item) =>
          item.productId === newItem.productId &&
          variantKey(item.variants) === variantKey(newItem.variants),
      );
      const nextQuantity = (matchingItem?.quantity ?? 0) + newItem.quantity;
      if (
        !Number.isInteger(newItem.quantity) ||
        newItem.quantity < 1 ||
        (newItem.stock !== undefined && nextQuantity > newItem.stock)
      ) {
        accepted = false;
        return current;
      }
      if (!matchingItem) return [...current, newItem];
      return current.map((item) =>
        item === matchingItem ? { ...item, quantity: nextQuantity } : item,
      );
    });
    return accepted;
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
  const replaceItems = (nextItems: CartItem[]) => setItems(nextItems);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, addItem, setQuantity, removeItem, replaceItems, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
