import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Logout() {
  const navigate = useNavigate();
  const [csrf, setcsrf] = useState<string | null>(null);

  const getCSRF = useCallback(async () => {
    const response = await fetch(`${import.meta.env.REACT_API_URL}csrf-token`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      toast.error("Une erreur est survenu!");
    } else {
      const result = await response.json();
      setcsrf(result.csrfToken);
    }
  }, []);

  useEffect(() => {
    getCSRF();
  }, [getCSRF]);

  const logout = useCallback(async()=>{
    if(csrf){
      const response = await fetch(`${import.meta.env.REACT_API_URL}auth/logout`,{
        method:"post",
        headers:{
          "Content-Type":"application/json",
          "xsrf-token": csrf
        },
        credentials:"include"
      })
      if(response.status === 200){
        sessionStorage.removeItem("user");
        sessionStorage.clear();
        navigate("/login");
      }
    }
  },[csrf, navigate])
  useEffect(() => {
    logout();
  }, [logout]);
  return (
    <div>
      <h1>Logout...</h1>
    </div>
  );
}

export default Logout;
