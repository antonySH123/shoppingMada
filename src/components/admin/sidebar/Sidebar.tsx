import { FaChevronLeft, FaChevronRight, FaHome, FaRegSun, FaShoppingBag, FaTachometerAlt, FaWrench } from "react-icons/fa"
import { Link } from "react-router-dom"


function Sidebar() {
  return (
    <div className='bg-green-500 h-screen px-[25px] overflow-x-auto overflow-y-auto'>
      <div className="px-[15px] flex items-center justify-center py-5 border-b-[1px] border-[white]">
         <h1 className="text-white text-center">Administrateur</h1>
      </div>
      <div className="flex items-center gap-4 py-3">
        <FaTachometerAlt color="white"/>
        <p className="text-white text-[16px]">Tableau de bord</p>
      </div>
      <div className="pt-[15px] border-b-[1px] border-[white]">
        <p className="text-[14px] font-extrabold leading-[16px] text-white">Menu</p>
        <div className="flex flex-col justify-between gap-[15px] py-[15px]">
            <div className="flex items-center gap-[10px]">
                <FaHome color="white"/>
                <Link to='/espace_vendeur/dash' className="text-[14px] leading-[20px] text-white">Accueil</Link>
            </div>
            <div className="flex items-center gap-[10px]">
                <FaShoppingBag color="white"/>
                <Link to="/espace_vendeur/products" className="text-[14px] leading-[20px] text-white">Produits</Link>
            </div>
            
        </div>
        <div className="flex justify-between items-center gap-[15px] py-[15px]">
            <div className="flex items-center gap-[10px]">
                <FaWrench color="white"/>
                <p className="text-[14px] leading-[20px] text-white">Navigation</p>
            </div>
            <FaChevronRight color="white"/>
        </div>
      </div>
      <div className="pt-[15px] border-b-[1px] border-[white]">
        <p className="text-[14px] font-extrabold leading-[16px] text-white">Paramètres</p>
        <div className="flex justify-between items-center gap-[15px] py-[15px]">
            <div className="flex items-center gap-[10px]">
                <FaRegSun color="white"/>
                <p className="text-[14px] leading-[20px] text-white">Utilisateurs</p>
            </div>
            <FaChevronRight color="white"/>
        </div>
        <div className="flex justify-between items-center gap-[15px] py-[15px]">
            <div className="flex items-center gap-[10px]">
                <FaWrench color="white"/>
                <p className="text-[14px] leading-[20px] text-white">Déconnexion</p>
            </div>
            <FaChevronRight color="white"/>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-center pt-[15px]">
            <div className="h-[40px] w-[40px] bg-green-900 rounded-full flex justify-center items-center cursor-pointer">
                <FaChevronLeft color="white"/>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
