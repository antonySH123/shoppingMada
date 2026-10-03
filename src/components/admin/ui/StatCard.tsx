import { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}

function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <article className="admin-stat-card">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="admin-stat-card__label">{label}</span>
        {icon && (
          <span
            className="shrink-0 text-[var(--admin-accent-solid)]"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <strong className="admin-stat-card__value">{value}</strong>
      {hint && <span className="admin-stat-card__hint">{hint}</span>}
    </article>
  );
}

export default StatCard;
