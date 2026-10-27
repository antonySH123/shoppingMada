import { createContext } from "react";
export type Theme = "light" | "dark";
export type ThemeChoice = Theme | "system";
export type ThemeContextValue = { theme: ThemeChoice; resolvedTheme: Theme; setTheme: (theme: ThemeChoice) => Promise<boolean>; toggleTheme: () => void; persistTheme: (theme: ThemeChoice) => Promise<boolean> };
export const ThemeContext = createContext<ThemeContextValue | null>(null);
