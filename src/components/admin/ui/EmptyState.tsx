import { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="admin-empty-state" role="status">
      {icon && (
        <span aria-hidden="true" className="mb-1 text-2xl">
          {icon}
        </span>
      )}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
