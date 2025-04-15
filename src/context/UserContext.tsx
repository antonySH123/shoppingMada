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
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUserState(JSON.parse(savedUser)); 
    } catch (error) {
      console.error("Error accessing localStorage", error);
    }
  }, []);

  const regenerateToken = useCallback(async()=>{
    if(!csrf) return null;
    const response = await fetch(`${import.meta.env.REACT_API_URL}auth/refresh`,{
      method:"POST",
      credentials:"include",
      headers:{
        "Content-Type":"application/json",
        "xsrf-token":csrf
      }
    })

    if(response.status === 201){
      const result = await response.json();
      localStorage.setItem("user", JSON.stringify(result.userInfo));
    }
  },[csrf])

  useEffect(()=>{
    if( user){
      const intervale= setInterval(regenerateToken,60*1000);
      return ()=>  clearInterval(intervale)
    }
  },[regenerateToken, user])

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user)); 
      } else {
        localStorage.removeItem("user");
      }

    
    } catch (error) {
      console.error("Error updating localStorage", error);
    }
  }, [user]);

  const setUserInfo = (newUser: Iuser | null) => {
    setUserState(newUser);
  };



  const value = { user, setUserInfo};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
