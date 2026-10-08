export const requestAdminStepUp = async (csrf: string): Promise<string | null> => {
  const baseUrl = import.meta.env.REACT_API_URL;
  const headers = { "Content-Type": "application/json", "xsrf-token": csrf };
  const challengeResponse = await fetch(`${baseUrl}admin/step-up/request`, {
    method: "POST",
    credentials: "include",
    headers,
  });
  const challenge = await challengeResponse.json();
  if (!challengeResponse.ok) throw new Error(challenge.message || "Impossible d’envoyer le code de confirmation.");

  const code = window.prompt("Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.");
  if (!code) return null;
  const verifyResponse = await fetch(`${baseUrl}admin/step-up/verify`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ code: code.trim() }),
  });
  const verification = await verifyResponse.json();
  if (!verifyResponse.ok) throw new Error(verification.message || "Code de confirmation invalide.");
  if (typeof verification.token !== "string" || !verification.token) {
    throw new Error("Le serveur n’a pas fourni de confirmation utilisable.");
  }
  return verification.token;
};
