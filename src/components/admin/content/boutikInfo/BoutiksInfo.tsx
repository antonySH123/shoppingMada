import  { ChangeEvent, FormEvent, useState } from 'react'
import { FaSave } from 'react-icons/fa';
type ShopInfo = {
    name: string;
    address: string;
    phone: string;
    email: string;
    description: string;
  };
function BoutiksInfo() {
    const [shopInfo, setShopInfo] = useState<ShopInfo>({
        name: "",
        address: "",
        phone: "",
        email: "",
        description: "",
      });
    
      const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShopInfo({ ...shopInfo, [name]: value });
      };
    
      const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Logic to save the shop info (e.g., API call)
        console.log("Shop info saved:", shopInfo);
      };
    
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6"
          >
            <h1 className="text-2xl font-bold text-center mb-6">Modifier les informations de la boutique</h1>
    
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la boutique</label>
                <input
                  type="text"
                  name="name"
                  value={shopInfo.name}
                  onChange={handleChange}
                  placeholder="Entrez le nom de la boutique"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={shopInfo.address}
                  onChange={handleChange}
                  placeholder="Entrez l'adresse de la boutique"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shopInfo.phone}
                  onChange={handleChange}
                  placeholder="Entrez le numéro de téléphone"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={shopInfo.email}
                  onChange={handleChange}
                  placeholder="Entrez l'email de la boutique"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={shopInfo.description}
                  onChange={handleChange}
                  placeholder="Entrez une description de la boutique"
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                ></textarea>
              </div>
            </div>
    
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" /> Enregistrer
              </button>
            </div>
          </form>
        </div>
      );
}

export default BoutiksInfo
