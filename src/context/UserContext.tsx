import React, { useState, ReactNode, useEffect, useCallback } from "react";
import { AuthContext } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";
import Iuser from "../Interface/UserInterface";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<Iuser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const csrf = useCSRF();

  // Vérifie la session active sur le backend
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        setUserState(null);
        return;
      }

      const data = await response.json();
      const currentUser = data.userInfo as Iuser | null;
      setUserState(
        currentUser?.userGroupMember_id?.usergroup_id ? currentUser : null,
      );
    } catch {
      setUserState(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  // /auth/me is read-only and does not need to wait for a CSRF token.
  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Rafraîchissement du token
  const regenerateToken = useCallback(async () => {
    if (!csrf) return;
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
        },
      );

      if (response.status === 201) {
        const result = await response.json();
        setUserState(result.userInfo); // pas besoin de localStorage
      } else if (response.status === 401 || response.status === 403) {
        setUserState(null); // session expirée
      }
    } catch (error) {
      console.warn("Le renouvellement de session a échoué :", error);
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
    setAuthReady(true);
  };

  const value = { user, authReady, setUserInfo };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
