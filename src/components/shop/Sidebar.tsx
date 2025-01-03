

import React from "react";
import { Link } from "react-router-dom"
import { useSidebar } from "../../context/ToggleSidebarContext";

const Sidebar:React.FC=()=> {
  const {isOpen} = useSidebar();
  return (
    <div className={`'w-full flex flex-col justify-center overflow-y-auto transition-all ${isOpen ? 'w-0 overflow-x-hidden ' : 'w-72'}`}>
    <div className="w-full h-20 flex justify-center items-center bg-green-500">
        <h1 className="text-white text-lg">Toutes les catégories</h1>
    </div>
    <div className="h-full overflow-y-auto flex flex-col gap-3 ml-10 py-10">
        <h3 className="font-bold">High tech</h3>
        <Link to="">Telephone</Link> 
        <Link to="">Ordinateur portable</Link>
        <Link to="">Smartwatch</Link> 
        <h3 className="font-bold">Electroménagère</h3>
        <Link to="">Ricecoocker</Link>
        <Link to="">Frigo</Link>
        <Link to="">Cuisinière a gaz</Link>
        <h3 className="font-bold">Vestimentaire</h3>
        <Link to="">T-shirt</Link>
        <Link to="">Veste</Link>
        <Link to="">Pantalon</Link>
        <Link to="">Sac</Link>
    </div>
</div>
  )
}

export default Sidebar
