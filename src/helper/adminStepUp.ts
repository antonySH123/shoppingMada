import { useDialog } from "../context/useDialog";

const stepUpHeaders = (csrf: string) => ({ "Content-Type": "application/json", "xsrf-token": csrf });

export const requestAdminStepUpChallenge = async (csrf: string): Promise<void> => {
  const response = await fetch(`${import.meta.env.REACT_API_URL}admin/step-up/request`, {
    method: "POST",
    credentials: "include",
    headers: stepUpHeaders(csrf),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Impossible d'envoyer le code de confirmation.");
};

export const verifyAdminStepUpCode = async (csrf: string, code: string): Promise<string> => {
  const response = await fetch(`${import.meta.env.REACT_API_URL}admin/step-up/verify`, {
    method: "POST",
    credentials: "include",
    headers: stepUpHeaders(csrf),
    body: JSON.stringify({ code: code.trim() }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Code de confirmation invalide.");
  if (typeof result.token !== "string" || !result.token) throw new Error("Le serveur n'a pas fourni de confirmation utilisable.");
  return result.token;
};

export const useAdminStepUp = () => {
  const dialog = useDialog();
  return async (csrf: string): Promise<string | null> => {
    await requestAdminStepUpChallenge(csrf);
    const code = await dialog.prompt("Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.", {
      title: "Confirmation de sécurité",
      input: { label: "Code de confirmation", placeholder: "000000", required: true, minLength: 6, maxLength: 6, pattern: "\\d{6}" },
      confirmLabel: "Vérifier le code",
    });
    if (!code) return null;
    return verifyAdminStepUpCode(csrf, code);
  };
};
