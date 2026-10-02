import { ReactNode, useState } from 'react';
import { ToggleProvider } from './ToggleSidebarDefinition';

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

export default ToggleSidebarContext;
