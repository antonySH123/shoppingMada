const API_URL = String(import.meta.env.REACT_API_URL ?? "").replace(/\/$/, "");

export function productImageUrl(photo?: string | null): string | undefined {
  const value = photo?.trim();
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const filename = value.split(/[\\/]/).filter(Boolean).pop();
  if (!filename || !API_URL) return undefined;

  return `${API_URL}/uploads/${encodeURIComponent(filename)}`;
}
