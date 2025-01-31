
import { Link } from "react-router-dom";

function List() {
  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-5 p-4">
      {/* Liste des commandes */}
      <div className="w-full lg:w-2/3 flex-grow">
        <h1 className="text-center text-3xl font-bold mb-6">Listes des commandes</h1>
        <div className="shadow-md border rounded-lg overflow-auto">
          <table className="w-full border-collapse text-sm lg:text-base">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-3 border">#</th>
                <th className="py-3 border">Produits</th>
                <th className="py-3 border">Prix</th>
                <th className="py-3 border">Quantité</th>
                <th className="py-3 border">Variant</th>
                <th className="py-3 border">Status</th>
                <th className="py-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-3 border text-center">1</td>
                <td className="py-3 px-3 border text-center">Casquette</td>
                <td className="py-3 px-3 border text-center">20,000 Ar</td>
                <td className="py-3 px-3 border text-center">5</td>
                <td className="py-3 px-3 border text-center">Rouge</td>
                <td className="py-3 px-3 border text-center text-yellow-500">En attente</td>
                <td className="py-3 px-3 border text-center">
                  <Link
                    title="Valider"
                    className="w-10 h-10 flex items-center justify-center text-green-500"
                    to="/espace_vendeur/commandeDetails"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Produits les plus commandés */}
      <div className="w-full lg:w-1/3 flex-grow">
        <div className="shadow-md border rounded-lg p-5">
          <h1 className="text-center text-xl font-semibold mb-4">Produits les plus commandés</h1>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="font-semibold">Casquette</p>
              <div className="text-gray-600">20,000 Ar</div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="font-semibold">T-shirt</p>
              <div className="text-gray-600">25,000 Ar</div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="font-semibold">Sac à dos</p>
              <div className="text-gray-600">50,000 Ar</div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="font-semibold">Chaussures</p>
              <div className="text-gray-600">80,000 Ar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default List;
