import { ReactNode, useEffect, useId, useRef } from "react";
import { LiaTimesSolid } from "react-icons/lia";

export interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div
      className="admin-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`admin-dialog admin-dialog--${size}`}
      >
        <header className="admin-dialog__header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-button--icon"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
          >
            <LiaTimesSolid size={18} />
          </button>
        </header>
        <div className="admin-dialog__body">{children}</div>
        {footer && <footer className="admin-dialog__footer">{footer}</footer>}
      </section>
    </div>
  );
}

export default AdminModal;
