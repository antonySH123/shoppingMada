import React, { ReactNode } from 'react';
import { LiaTimesSolid } from 'react-icons/lia';

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
          className="absolute -top-3 text-xl -right-3 text-gray-600 hover:text-gray-800 rounded-full bg-gray-300 p-1 shadow-white "
          onClick={onClose}
        >
          <LiaTimesSolid size={20}/>
        </button>
        {children}
      </div>
    </div>
  );
};

export default UserInfo;
