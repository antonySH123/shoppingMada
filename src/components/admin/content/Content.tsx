import { FaEyeSlash, FaTrashAlt } from "react-icons/fa"
import { Link } from "react-router-dom"

function Content() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 py-5">
      <div className="py-5">
        <h1 className="text-3xl">Nos produits</h1>
      </div>
      <div className="py-5 w-full flex justify-end">
        <Link to='/espace_vendeur/admin/addProduct' className="border px-3 py-3 bg-green-500 text-white rounded-md">Nouveau produit</Link>
      </div>
      <div className="overflow-auto">
        <table className="w-full border-2">
            <thead>
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3">Produits</th>
                <th className="py-3">Categorie</th>
                <th className="py-3">Prix</th>
                <th className="py-3">Photo</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3 text-center">1</td>
                <td className="py-3 pr-6 whitespace-nowrap text-center">Telephone samsung</td>
                <td className="py-3 pr-6 whitespace-nowrap text-center">High tech</td>
                <td className="py-3 pr-6 whitespace-nowrap text-center">1 000 0000 (MGA)</td>
                <td className="py-3 pr-6 whitespace-nowrap text-center">
                  <img src="/src/assets/image/product/pharm.jpg" alt="" className="w-20 h-20 rounded-full mx-auto" />
                </td>
                <td className="flex justify-center items-center py-5 gap-1">
                  <a href="" className="px-3 py-2 border border-white bg-red-500 text-white rounded-md flex justify-center items-center gap-3"><FaTrashAlt/>Supprimer</a>
                  <a href="" className="px-3 py-2 border border-white bg-blue-500 text-white rounded-md flex justify-center items-center gap-3"><FaEyeSlash/>Voir</a>
                </td>
              </tr>
            </tbody>
        </table>
      </div>
    </div>
  )
}

export default Content
