import { useContext } from "react";
import { DialogContext } from "./DialogContextInstance";
import type { DialogContextValue } from "./dialogTypes";

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog doit être utilisé sous DialogProvider.");
  return context;
}
