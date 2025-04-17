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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md sm:max-w-lg md:max-w-xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button inside modal */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 rounded-full bg-gray-200 hover:bg-gray-300 p-1 z-10"
          onClick={onClose}
        >
          <LiaTimesSolid size={20} />
        </button>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
