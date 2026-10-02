import { useContext } from "react";
import { ProductContext } from "./ProductContextDefinition";

export const useCategory = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useCategory must be used within ProductProvider");
  return context;
};
