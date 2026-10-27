import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext } from "./ThemeContextInstance";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";
import { resolveTheme, shouldPersistThemeLocally, themeForSession } from "./themePreference.js";
import type { ThemeChoice } from "./ThemeContextInstance";
export type { Theme, ThemeChoice } from "./ThemeContextInstance";

const storageKey = "shopinmada.theme.v1";
const systemPreference = window.matchMedia?.("(prefers-color-scheme: dark)");

function getInitialTheme(): ThemeChoice {
  try {
    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeChoice] = useState<ThemeChoice>(getInitialTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(systemPreference?.matches ?? false);
  const [initialized, setInitialized] = useState(false);
  const { user, authReady, setUserInfo } = useAuth();
  const csrf = useCSRF();
  const userId = user?._id;
  const accountTheme = user?.preferences?.theme;
  const isAuthenticated = userId !== undefined;
  const resolvedTheme = resolveTheme(theme, systemPrefersDark);

  useLayoutEffect(() => {
    if (!authReady) return;
    const nextTheme = themeForSession(isAuthenticated, accountTheme, getInitialTheme());
    setThemeChoice(nextTheme);
    setInitialized(true);
  }, [accountTheme, authReady, isAuthenticated, userId]);

  useLayoutEffect(() => {
    const applyResolvedTheme = () => {
      const nextResolvedTheme = resolveTheme(theme, systemPrefersDark);
      document.documentElement.dataset.theme = nextResolvedTheme;
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      document.documentElement.style.colorScheme = nextResolvedTheme;
    };
    applyResolvedTheme();
    const handleSystemChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    systemPreference?.addEventListener("change", handleSystemChange);
    return () => systemPreference?.removeEventListener("change", handleSystemChange);
  }, [systemPrefersDark, theme]);

  const setTheme = useCallback(async (nextTheme: ThemeChoice) => {
    if (!user) {
      setThemeChoice(nextTheme);
      if (shouldPersistThemeLocally(false)) {
        try {
          if (nextTheme === "system") localStorage.removeItem(storageKey);
          else localStorage.setItem(storageKey, nextTheme);
        } catch { /* The theme remains active for the current session. */ }
      }
      return true;
    }
    if (!csrf) return false;

    const previousTheme = theme;
    setThemeChoice(nextTheme);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}user/profile/theme`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf },
        body: JSON.stringify({ theme: nextTheme }),
      });
      const result = await response.json();
      if (!response.ok) {
        setThemeChoice(previousTheme);
        return false;
      }
      setUserInfo({ ...user, preferences: { ...user.preferences, ...result.data } });
      return true;
    } catch {
      setThemeChoice(previousTheme);
      return false;
    }
  }, [csrf, setUserInfo, theme, user]);

  const toggleTheme = useCallback(() => {
    void setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggleTheme, persistTheme: setTheme }), [resolvedTheme, setTheme, theme, toggleTheme]);
  if (!initialized) return <div className="theme-bootstrap" aria-hidden="true" />;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
