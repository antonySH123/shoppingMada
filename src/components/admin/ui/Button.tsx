import { ButtonHTMLAttributes, ReactNode } from "react";

export type AdminButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type AdminButtonSize = "sm" | "md" | "lg";

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  tooltip?: string;
  children: ReactNode;
}

function AdminButton({
  variant = "secondary",
  size = "md",
  loading = false,
  iconOnly = false,
  tooltip,
  type = "button",
  disabled,
  className = "",
  children,
  ...props
}: AdminButtonProps) {
  const label = props["aria-label"];
  const title =
    tooltip ?? (iconOnly && typeof label === "string" ? label : undefined);

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={title}
      className={`admin-button admin-button--${variant} admin-button--${size}${iconOnly ? " admin-button--icon" : ""}${className ? ` ${className}` : ""}`}
    >
      {loading ? (
        <>
          <span className="admin-button__spinner" aria-hidden="true" />
          <span className="sr-only">Chargement…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AdminButton;
