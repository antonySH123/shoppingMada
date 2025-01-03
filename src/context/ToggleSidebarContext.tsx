import React, { ReactNode, useContext, useState, createContext } from 'react';

// Définir le type pour les attributs du toggle
interface ToggleAttribut {
  isOpen: boolean;
  toggler: () => void;
}

// Créer le contexte pour stocker l'état du toggle
const ToggleProvider = createContext<ToggleAttribut | undefined>(undefined);

// Créer le composant de contexte qui fournira les valeurs du toggle
function ToggleSidebarContext({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggler = () => {
    setIsOpen((prevState) => !prevState); // Basculer l'état entre ouvert et fermé
  };

  return (
    <ToggleProvider.Provider value={{ isOpen, toggler }}>
      {children}
    </ToggleProvider.Provider>
  );
}

// Créer un hook personnalisé pour accéder facilement au contexte
export const useSidebar = () => {
  const context = useContext(ToggleProvider);
  if (!context) {
    throw new Error('useSidebar must be used within a ToggleSidebarContext');
  }
  return context;
};

export default ToggleSidebarContext;
