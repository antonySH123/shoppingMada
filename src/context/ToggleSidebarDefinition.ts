import { createContext } from "react";

export interface ToggleAttribut {
  isOpen: boolean;
  toggler: () => void;
}

export const ToggleProvider = createContext<ToggleAttribut | undefined>(undefined);
