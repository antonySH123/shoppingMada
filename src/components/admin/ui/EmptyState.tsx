import { ReactNode } from "react";
import { useLanguage } from "../../../context/useLanguage";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const { t } = useLanguage();
  return (
    <div className="admin-empty-state" role="status">
      {icon && (
        <span aria-hidden="true" className="mb-1 text-2xl">
          {icon}
        </span>
      )}
      <h2>{title ?? t("common.noResults")}</h2>
      {description !== undefined ? <p>{description}</p> : <p>{t("common.noData")}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
