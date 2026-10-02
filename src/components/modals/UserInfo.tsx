import React, { ReactNode } from "react";
import { LiaTimesSolid } from "react-icons/lia";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const UserInfo: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="market-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="market-modal-panel relative max-h-[88dvh] w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          aria-label="Fermer la fenêtre"
          className="market-modal-close absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <LiaTimesSolid size={20} />
        </button>

        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
};

export default UserInfo;
