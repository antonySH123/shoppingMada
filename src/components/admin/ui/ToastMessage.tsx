import { LiaTimesSolid } from "react-icons/lia";

export interface ToastMessageProps {
  title: string;
  message?: string;
  tone?: "success" | "warning" | "danger" | "info";
  onDismiss?: () => void;
}

function ToastMessage({
  title,
  message,
  tone = "info",
  onDismiss,
}: ToastMessageProps) {
  const role = tone === "danger" ? "alert" : "status";
  return (
    <div className={`admin-toast admin-toast--${tone}`} role={role}>
      <div className="min-w-0">
        <strong>{title}</strong>
        {message && <p>{message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="admin-button admin-button--ghost admin-button--icon"
          aria-label="Fermer le message"
          onClick={onDismiss}
        >
          <LiaTimesSolid size={17} />
        </button>
      )}
    </div>
  );
}

export default ToastMessage;
