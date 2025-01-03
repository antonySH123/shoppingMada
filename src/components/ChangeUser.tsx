import React, { useCallback, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/UserContext'

function ChangeUser() {
    const {token, setToken, setUserInfo} = useAuth()
    const regenerate = useCallback(async()=>{
        const regenerateToken = await fetch(`${import.meta.env.REACT_API_URL}auth/refresh`,{
            method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420",
              },
          })
          const response = await regenerateToken.json();
          const tokenUser = response.userInfo.token;
          setToken(tokenUser);
          setUserInfo(response.userInfo);
    },[setToken, setUserInfo, token])
    useEffect(()=>{
        if(token) regenerate()
    },[regenerate, token])
  return (
    <Navigate to={"/dash"}/>
  )
}

export default ChangeUser
