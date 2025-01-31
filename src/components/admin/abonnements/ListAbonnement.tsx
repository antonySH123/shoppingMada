
import { FaRegEdit } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function ListAbonnement() {
  return (
    <div className="flex flex-col gap-5 p-4">
    <h1 className="text-center text-3xl font-bold mb-6">Listes des abonnements</h1>
    <div className="shadow-md border rounded-lg overflow-auto">
      <table className="w-full border-collapse text-sm lg:text-base">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-3 border">#</th>
            <th className="py-3 border">Nom</th>
            <th className="py-3 border">Prix</th>
            <th className="py-3 border">Durée</th>
            <th className="py-3 border">Fonctionnalités</th>
            <th className="py-3 border">Status</th>
            <th className="py-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-3 border text-center">1</td>
            <td className="py-3 px-3 border text-center">Free Plan</td>
            <td className="py-3 px-3 border text-center">0 Ar</td>
            <td className="py-3 px-3 border text-center">1 Month</td>
            <td className="py-3 px-3 border text-center">
              <ul className="list-disc list-inside">
                <li>Feature A</li>
                <li>Feature B</li>
              </ul>
            </td>
            <td className="py-3 px-3 border text-center text-green-500">Active</td>
            <td className="py-3 px-3 border text-center">
              <Link
                title="Modifier"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200"
                to="/edit-subscription/1"
              >
                <FaRegEdit size={20} />
              </Link>
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-3 border text-center">2</td>
            <td className="py-3 px-3 border text-center">Pro Plan</td>
            <td className="py-3 px-3 border text-center">50,000 Ar</td>
            <td className="py-3 px-3 border text-center">1 Year</td>
            <td className="py-3 px-3 border text-center">
              <ul className="list-disc list-inside">
                <li>Feature A</li>
                <li>Feature B</li>
                <li>Feature C</li>
              </ul>
            </td>
            <td className="py-3 px-3 border text-center text-red-500">Inactive</td>
            <td className="py-3 px-3 border text-center">
              <Link
                title="Modifier"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200"
                to="/edit-subscription/2"
              >
                <FaRegEdit size={20} />
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  )
}

export default ListAbonnement
