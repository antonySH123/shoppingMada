import type { ThemeChoice } from "./ThemeContextInstance";
import type { Theme } from "./ThemeContextInstance";

export function isThemeChoice(value: unknown): value is ThemeChoice;
export function resolveTheme(theme: ThemeChoice, prefersDark: boolean): Theme;
export function themeForSession(isAuthenticated: boolean, accountTheme?: ThemeChoice, visitorTheme?: ThemeChoice): ThemeChoice;
export function shouldPersistThemeLocally(isAuthenticated: boolean): boolean;
