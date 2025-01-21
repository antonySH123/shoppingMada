import { createContext, useContext } from "react";
interface AuthContextType {
  user: { [key: string]: unknown } | null; 
  token: string | null;
  setUserInfo: (user: { [key: string]: unknown } | null) => void;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}