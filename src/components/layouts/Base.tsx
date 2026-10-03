import { Outlet } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"
import MobileCustomerNav from "../MobileCustomerNav"


function Base() {
  return (
    <div className="customer-app">
      <Navbar/>
      <Outlet/>
      <Footer/>
      <MobileCustomerNav />
    </div>
  )
}

export default Base
