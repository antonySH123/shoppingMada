import React from 'react'
import { Link } from 'react-router-dom'

function CompteDesactiver() {
  return (
    <React.Fragment>
         <section className="flex flex-col items-center justify-center h-screen">
           <h1 className="text-2xl font-semibold text-gray-600">ShoppingMada</h1>
           <h2 className="text-4xl font-semibold text-gray-600">Votre compte est desactivé.</h2>
           <p className="text-gray-600">Veuillez contacter l'adminitrateur du plateforme</p>
           <p className="text-gray-600">03256222000</p>
           <p className="text-gray-600">Merci!</p>
           <div className='flex items-center gap-3'>
            <Link to={"/"}>Accueil</Link>
            <Link to={"/logout"}>Se deconnécter</Link>
           </div>
         </section>
       </React.Fragment>
  )
}

export default CompteDesactiver