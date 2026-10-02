import React from "react";
type Props = {
  title: string;
  message: string;
  ok: () => void;
  onClose: (params: boolean) => void;
  isOpen: boolean;
};
const Dialog: React.FC<Props> = ({ title, message, ok, onClose, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div
      className="market-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-5"
      onClick={() => onClose(false)}
      role="presentation"
    >
      <div
        className="market-modal-panel relative w-full max-w-md p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <div className="mb-3">
          <h1 id="confirmation-title" className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
        </div>
        <div className="mb-3">
          <p>{message}</p>
        </div>
        <div className="flex flex-row justify-end gap-3 pt-3">
          <button type="button" onClick={ok} className="market-button-primary">OK</button>
          <button type="button" onClick={() => onClose(false)} className="market-button-secondary">Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
