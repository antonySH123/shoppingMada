import { createContext, useContext } from "react";
import Iuser from "../Interface/UserInterface";
interface AuthContextType {
  user: Iuser | null; 
  authReady: boolean;
  setUserInfo: (user: Iuser | null) => void;
  currencyRates: { EUR: number | null; USD: number | null; updatedAt: string | null; fresh: boolean };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
