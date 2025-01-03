import { useEffect } from "react";
import { useAuth } from "../context/UserContext"
import { useNavigate } from "react-router-dom";

function Logout() {
    const {token} = useAuth();
    const navigate = useNavigate();
    useEffect(()=>{
        if(!token){
            navigate("/login");
        }
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.clear()
        navigate("/login")
    },[navigate, token])
  return (
    <div>
      <h1>Logout...</h1>
    </div>
  )
}

export default Logout
