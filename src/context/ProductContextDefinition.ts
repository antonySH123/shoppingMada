import { createContext } from "react";

export interface IProductContext {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
}

export const ProductContext = createContext<IProductContext | undefined>(undefined);
