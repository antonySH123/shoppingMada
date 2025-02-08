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
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) setUserState(JSON.parse(savedUser)); 
    } catch (error) {
      console.error("Error accessing localStorage", error);
    }
  }, []);

  const regenerateToken = useCallback(async()=>{
    if(csrf){
      const response = await fetch(`${import.meta.env.REACT_API_URL}auth/refresh`,{
        method:"POST",
        credentials:"include",
        headers:{
          "Content-Type":"application/json",
          "xsrf-token":csrf
        }
      })

      if(response.ok && response.status === 201){
        const result = await response.json();
        sessionStorage.setItem("user", JSON.stringify(result.userInfo));
      }
    }
  },[csrf])

  useEffect(()=>{
    if(csrf && user){
      const intervale= setInterval(regenerateToken,60*1000);
      return ()=>  clearInterval(intervale)
    }
  },[csrf, regenerateToken, user])

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

  const setUserInfo = (newUser: Iuser | null) => {
    setUserState(newUser);
  };



  const value = { user, setUserInfo};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
