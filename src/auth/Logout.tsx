import { useCallback, useEffect} from "react";
import { useNavigate } from "react-router-dom";

import useCSRF from "../helper/useCSRF";

function Logout() {
  const navigate = useNavigate();
 const csrf = useCSRF();

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
