import { Outlet } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"


function Base() {
  return (
    <>
      <Navbar/>
      {/* Outlet est l'equivalent de yield de laravel c'est a dire qu'il definit le 
      layout de base */}
      <Outlet/>
      
      <Footer/>
    </>
  )
}

export default Base
