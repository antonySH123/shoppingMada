
import { LiaTimesSolid } from "react-icons/lia"


function Commande() {
  return (
    <div className="overflow-x-auto">
         <h1 className="font-semibold text-3xl mb-5 mt-5">
              Listes de vos achats
            </h1>
            <p>Produit que vous aviez commander </p>
  <table className="min-w-full table-auto border-collapse border border-gray-200 text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="border border-gray-300 px-4 py-2 text-left">#</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Produit</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Boutique</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Quantité</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Total d&apos;achat</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr className="bg-white">
        <td className="border border-gray-300 px-4 py-2">1</td>
        <td className="border border-gray-300 px-4 py-2">Casque</td>
        <td className="border border-gray-300 px-4 py-2">Suprême Center</td>
        <td className="border border-gray-300 px-4 py-2">1</td>
        <td className="border border-gray-300 px-4 py-2">2000000 Ar</td>
        <td className="border border-gray-300 px-4 py-2"><div className="bg-green-500 rounded-lg py-2 text-white text-center w-[100px] mx-auto">En attente</div></td>
        <td className="border border-gray-300 px-4 py-2">
          <div className="flex justify-center"><a href="" className=" hover:bg-green-500 hover:text-white rounded-full p-2"><LiaTimesSolid size={25}/></a></div>
        </td>
      </tr>
      
    </tbody>
  </table>
</div>

  )
}

export default Commande
