const statusLabels: Record<string, string> = {
  Pending: "En attente",
  Accepted: "Acceptée",
  Rejected: "Refusée",
  Canceled: "Annulée",
  Completed: "Terminée",
};

export const formatStatus = (status?: string | null): string =>
  status ? statusLabels[status] ?? status : "—";

export const formatFrenchDateTime = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

export const formatFrenchDate = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
};
