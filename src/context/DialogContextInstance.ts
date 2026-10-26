import { createContext } from "react";
import type { DialogContextValue } from "./dialogTypes";

export const DialogContext = createContext<DialogContextValue | null>(null);
