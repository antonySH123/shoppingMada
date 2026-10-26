import { createContext } from "react";
export type Theme = "light" | "dark";
export type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void; persistTheme: (theme: Theme) => Promise<boolean> };
export const ThemeContext = createContext<ThemeContextValue | null>(null);
