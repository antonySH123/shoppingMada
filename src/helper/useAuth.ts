import { createContext, useContext } from "react";
import Iuser from "../Interface/UserInterface";
interface AuthContextType {
  user: Iuser | null; 
  setUserInfo: (user: Iuser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}