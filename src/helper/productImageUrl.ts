export function productImageUrl(photo?: string | null): string | undefined {
  if (!photo?.trim()) return undefined;
  const value = photo.trim();
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const filename = value.split(/[\\/]/).filter(Boolean).pop();
  if (!filename) return undefined;
  return `${import.meta.env.REACT_API_URL}uploads/${encodeURIComponent(filename)}`;
}
