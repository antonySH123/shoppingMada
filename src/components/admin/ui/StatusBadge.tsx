import { ReactNode } from "react";

export type StatusTone =
  | "pending"
  | "progress"
  | "success"
  | "danger"
  | "neutral";

const statusTones: Record<string, StatusTone> = {
  pending: "pending",
  Pending: "pending",
  en_attente_vendeur: "pending",
  en_attente_paiement: "pending",
  paiement_declare: "progress",
  paiement_confirme: "success",
  Accepted: "success",
  Completed: "success",
  terminee: "success",
  livree: "success",
  expediee: "progress",
  en_preparation: "progress",
  Rejected: "danger",
  Refused: "danger",
  annulee: "neutral",
  Canceled: "neutral",
  expiree: "neutral",
  litige: "danger",
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: StatusTone;
  icon?: ReactNode;
}

function StatusBadge({ status, label = status, tone, icon }: StatusBadgeProps) {
  const statusTone = tone ?? statusTones[status] ?? "neutral";
  return (
    <span className={`admin-status-badge admin-status-badge--${statusTone}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}

export default StatusBadge;
