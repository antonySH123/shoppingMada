import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Définir les types pour les données du contexte
interface AuthContextType {
  user: { [key: string]: unknown } | null; // Utilisation d'un objet générique pour 'user'
  token: string | null;
  setUserInfo: (user: { [key: string]: unknown } | null) => void;
  setToken: (token: string | null) => void;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Définir les props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Créer le provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<{ [key: string]: unknown } | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem("user");
      const savedToken = sessionStorage.getItem("token");

      if (savedUser) setUserState(JSON.parse(savedUser)); // On parse l'objet JSON stocké
      if (savedToken) setTokenState(savedToken);
    } catch (error) {
      console.error("Error accessing localStorage", error);
    }
  }, []);

  // Synchroniser les données dans localStorage
  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user)); // On stringify l'objet avant de le stocker
      } else {
        sessionStorage.removeItem("user");
      }

      if (token) {
        sessionStorage.setItem("token", token);
      } else {
        sessionStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error updating sessionStorage", error);
    }
  }, [user, token]);

  // Méthodes pour mettre à jour le contexte et sessionStorage
  const setUserInfo = (newUser: { [key: string]: unknown } | null) => {
    setUserState(newUser);
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
  };

  const value = { user, token, setUserInfo, setToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
