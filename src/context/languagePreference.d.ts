import type { Language } from "./LanguageContext";

export function isLanguage(value: unknown): value is Language;
export function languageForSession(isAuthenticated: boolean, accountLanguage?: Language, visitorLanguage?: Language): Language;
export function shouldPersistLanguageLocally(isAuthenticated: boolean): boolean;
