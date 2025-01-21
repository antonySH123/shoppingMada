import React, { useState, ReactNode, useEffect } from "react";
import { AuthContext } from "../helper/useAuth";
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<{ [key: string]: unknown } | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) setUserState(JSON.parse(savedUser)); 
    } catch (error) {
      console.error("Error accessing localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user)); 
      } else {
        sessionStorage.removeItem("user");
      }

    
    } catch (error) {
      console.error("Error updating sessionStorage", error);
    }
  }, [user]);

  const setUserInfo = (newUser: { [key: string]: unknown } | null) => {
    setUserState(newUser);
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
  };

  const value = { user, token, setUserInfo, setToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
