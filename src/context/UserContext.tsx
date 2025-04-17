import React, { useState, ReactNode, useEffect, useCallback } from "react";
import { AuthContext } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";
import Iuser from "../Interface/UserInterface";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<Iuser | null>(null);
  const csrf = useCSRF();

  // Vérifie la session active sur le backend
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserState(data.userInfo); // ← basé sur ta réponse backend
      } else {
        setUserState(null); // déconnecté
      }
    } catch (error) {
      console.error("Erreur de session:", error);
      setUserState(null);
    }
  }, []);

  // Appel initial pour charger l'utilisateur
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Rafraîchissement du token
  const regenerateToken = useCallback(async () => {
    if (!csrf) return;
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "xsrf-token": csrf,
        },
      });

      if (response.status === 201) {
        const result = await response.json();
        setUserState(result.userInfo); // pas besoin de localStorage
      } else {
        setUserState(null); // session expirée
      }
    } catch (error) {
      console.error("Erreur lors du refresh :", error);
      setUserState(null);
    }
  }, [csrf]);

  // Refresh toutes les minutes si connecté
  useEffect(() => {
    if (user) {
      const interval = setInterval(regenerateToken, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [regenerateToken, user]);

  const setUserInfo = (newUser: Iuser | null) => {
    setUserState(newUser);
  };

  const value = { user, setUserInfo };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
