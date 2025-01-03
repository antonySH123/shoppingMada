import { useEffect } from 'react';
import { useAuth } from '../../context/UserContext'
import Sidebar from './sidebar/Sidebar'
import { Outlet, useNavigate } from 'react-router-dom'

function AppAdmin() {

  return (
    <div className="flex">
      <div className="basis-[12%] h-[100vh] border">
       <Sidebar/>
      </div>
      <div className="basis-[88%] bg-gray-50 px-10 py-5">
          <Outlet/>
          
      </div>
    </div>
  )
}

export default AppAdmin
