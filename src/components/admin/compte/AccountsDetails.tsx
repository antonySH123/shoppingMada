import { Link } from "react-router-dom";

function AccountsDetails() {
  return (
    <div>
      <h1 className="text-2xl mb-3">Informations du compte</h1>
      <div className="border border-gray-300 py-5 px-5 flex justify-between gap-5 mb-7">
        <div className="flex gap-5">
          <img
            src="/src/assets/image/product/pharm.jpg"
            alt=""
            className="w-20 h-20 rounded-full"
          />
          <div>
            <strong>Lita be</strong>
            <p>Lita@gmail.com</p>
          </div>
        </div>

        <div>
          <strong>Vendeur</strong>
        </div>
      </div>
      <div className="border border-gray-300 flex flex-col py-5 px-5">
        <h3>Informations générales</h3>
        <form
          action=""
          method="post"
          className="w-full flex justify-center mt-5 gap-10"
        >
          <div className="w-full">
            <div className="mb-3">
              <label>Nom : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300"
              />
            </div>
            <div className="mb-3">
              <label>Email : </label>
              <input
                type="email"
                className="w-full px-2 py-2 border border-gray-300"
              />
            </div>
          </div>
          <div className="w-full">
            <div className="mb-3">
              <label>Prénom : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300"
              />
            </div>
            <div>
              <label>Numero Télephone : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300"
              />
            </div>
          </div>
        </form>
        <div className="mb-3 w-full">
          <label>Adresse : </label>
          <input
            type="text"
            className="w-full px-2 py-2 border border-gray-300"
          />
        </div>
      </div>
      <div className="border border-gray-300 py-5 px- mt-7 flex justify-end gap-5 mb-7">
        <div className="px-6">
          <Link to="" className="border border-red-500 bg-red-500 px-2 py-3 text-white font-semibold rounded">Desactiver</Link>
        </div>
      </div>
    </div>
  );
}

export default AccountsDetails;
