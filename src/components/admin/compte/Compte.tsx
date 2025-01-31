// import { useState } from 'react'
// import { FaToggleOff, FaToggleOn } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function Compte() {
    // const [shops] = useState([
    //     { id: 1, name: "Shop A", owner: "Owner A", status: "active" },
    //     { id: 2, name: "Shop B", owner: "Owner B", status: "inactive" },
    //     { id: 3, name: "Shop C", owner: "Owner C", status: "active" },
    //   ]);
  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-center text-3xl font-bold mb-6">Gestion des comptes de boutique</h1>
      <div className="shadow-md border rounded-lg overflow-auto">
        <table className="w-full border-collapse text-sm lg:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-3 border">#</th>
              <th className="py-3 border">Nom de la boutique</th>
              <th className="py-3 border">Propriétaire</th>
              <th className="py-3 border">Status</th>
              <th className="py-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
           
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-3 border text-center">1</td>
                <td className="py-3 px-3 border text-center">Suprême Center</td>
                <td className="py-3 px-3 border text-center">Lita</td>
                <td className="py-3 px-3 border text-center">Active</td>
                <td className="py-3 px-3 border text-center font-semibold">
                  <Link to="/espace_vendeur/accountsSettings" className='text-green-500'>Voir plus</Link>
                </td>
                 
              </tr>
           
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Compte
