import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./ThemeContextInstance";
import useCSRF from "../helper/useCSRF";
import { useAuth } from "../helper/useAuth";

import type { Theme } from "./ThemeContextInstance";
export type { Theme } from "./ThemeContextInstance";
const storageKey = "shopinmada.theme.v1";

function getInitialTheme(): Theme {
  try {
    return localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { user, authReady, setUserInfo } = useAuth();
  const csrf = useCSRF();
  const [initializedUserId, setInitializedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (user) {
      if (initializedUserId === user._id) return;
      const accountTheme = user.preferences?.theme;
      setTheme(accountTheme === "light" || accountTheme === "dark" ? accountTheme : getInitialTheme());
      setInitializedUserId(user._id);
      return;
    }
    if (initializedUserId !== null) {
      setTheme(getInitialTheme());
      setInitializedUserId(null);
    }
  }, [authReady, initializedUserId, user]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, theme); } catch { /* Keep theme for this session. */ }
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const persistTheme = useCallback(async (nextTheme: Theme) => {
    if (!user) { setTheme(nextTheme); return true; }
    const csrfToken = csrf;
    if (!csrfToken) return false;
    const previousTheme = theme;
    try {
      setTheme(nextTheme);
      const response = await fetch(`${import.meta.env.REACT_API_URL}user/preferences`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrfToken },
        body: JSON.stringify({ theme: nextTheme }),
      });
      if (!response.ok) { setTheme(previousTheme); return false; }
      const result = await response.json();
      setTheme(nextTheme);
      if (result.data) setUserInfo({ ...user, preferences: result.data });
      return true;
    } catch {
      setTheme(previousTheme);
      return false;
    }
  }, [csrf, setUserInfo, theme, user]);
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    void persistTheme(nextTheme);
  };
  const value = { theme, setTheme, toggleTheme, persistTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
