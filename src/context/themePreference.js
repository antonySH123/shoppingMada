export const isThemeChoice = (value) => value === "light" || value === "dark" || value === "system";

export function resolveTheme(theme, prefersDark) {
  if (theme === "system") return prefersDark ? "dark" : "light";
  return theme === "dark" ? "dark" : "light";
}

export function themeForSession(isAuthenticated, accountTheme, visitorTheme) {
  if (isAuthenticated) return isThemeChoice(accountTheme) ? accountTheme : "system";
  return isThemeChoice(visitorTheme) ? visitorTheme : "system";
}

export function shouldPersistThemeLocally(isAuthenticated) {
  return !isAuthenticated;
}
