import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean; // Pour déterminer si le modal est ouvert
  onClose: () => void; // Fonction pour fermer le modal
  children: ReactNode; // Contenu dynamique du modal
}

const UserInfo: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture lorsque l'on clique dans le modal
      >
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default UserInfo;
