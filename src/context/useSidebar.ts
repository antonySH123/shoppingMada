import { useContext } from "react";
import { ToggleProvider } from "./ToggleSidebarDefinition";

export const useSidebar = () => {
  const context = useContext(ToggleProvider);
  if (!context) throw new Error("useSidebar must be used within ToggleSidebarContext");
  return context;
};
