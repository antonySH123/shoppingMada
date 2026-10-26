import { useContext } from "react";
import { ThemeContext, type ThemeContextValue } from "./ThemeContextInstance";

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export type { ThemeContextValue };
