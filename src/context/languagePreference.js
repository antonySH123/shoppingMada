export const isLanguage = (value) => value === "fr" || value === "en";

export function languageForSession(isAuthenticated, accountLanguage, visitorLanguage) {
  if (isAuthenticated) return isLanguage(accountLanguage) ? accountLanguage : isLanguage(visitorLanguage) ? visitorLanguage : "fr";
  return isLanguage(visitorLanguage) ? visitorLanguage : "fr";
}

export function shouldPersistLanguageLocally(isAuthenticated) {
  return !isAuthenticated;
}
