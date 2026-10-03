import { ReactNode } from "react";
import AdminButton from "./Button";

export type RowActionId =
  | "view"
  | "edit"
  | "approve"
  | "reject"
  | "delete"
  | "custom";
export interface RowAction {
  id: RowActionId;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
  confirmationMessage?: string;
  confirmBeforeAction?: boolean;
}

const actionOrder: Record<RowActionId, number> = {
  view: 0,
  edit: 1,
  approve: 2,
  reject: 3,
  custom: 4,
  delete: 5,
};

export interface RowActionsProps {
  actions: RowAction[];
  label?: string;
}

function RowActions({ actions, label = "Actions de ligne" }: RowActionsProps) {
  const ordered = [...actions].sort(
    (left, right) => actionOrder[left.id] - actionOrder[right.id],
  );
  const visible = ordered.length > 3 ? ordered.slice(0, 2) : ordered;
  const overflow = ordered.length > 3 ? ordered.slice(2) : [];
  const runAction = (action: RowAction) => {
    if (
      action.destructive &&
      action.confirmBeforeAction !== false &&
      !window.confirm(
        action.confirmationMessage ?? `Confirmer « ${action.label} » ?`,
      )
    )
      return;
    action.onSelect();
  };

  return (
    <div className="admin-row-actions" role="group" aria-label={label}>
      {visible.map((action) => (
        <AdminButton
          key={action.id}
          size="sm"
          variant={action.destructive ? "danger" : "ghost"}
          iconOnly
          tooltip={action.label}
          aria-label={action.label}
          disabled={action.disabled}
          onClick={() => runAction(action)}
        >
          {action.icon}
        </AdminButton>
      ))}
      {overflow.length > 0 && (
        <details className="admin-row-actions__menu">
          <summary aria-label="Autres actions" title="Autres actions">
            ⋯
          </summary>
          <div role="menu">
            {overflow.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                className={action.destructive ? "is-danger" : ""}
                onClick={() => runAction(action)}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default RowActions;
