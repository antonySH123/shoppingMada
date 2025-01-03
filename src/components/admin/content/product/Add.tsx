
import Categorie from "../../../categorie/Categorie";
function Add() {

  return (

    
    <div className="px-10">
      <h1 className="text-center text-4xl uppercase my-5">Nouveau produit</h1>
      <div className="w-full h-full">
        <form action="" method="post" className="w-full">
          <div className="flex w-full  gap-5">
            <div className="w-full flex gap-3 flex-col">
              <label>Nom du produit</label>
              <input
                type="text"
                className="w-full border border-green-500 py-2"
              />
            </div>
            <div className="w-full flex gap-3 flex-col">
              <label>Prix</label>
              <input
                type="number"
                className="w-full border border-green-500 py-2"
              />
            </div>
          </div>
          <div className="w-full py-5">
            <div className="">
              <label>Categorie</label>
              <Categorie/>            
            </div>
          </div>
          <div className="w-full flex gap-3 flex-col">
              <label>Description</label>
              <input
                type="text"
                className="w-full border border-green-500 py-2"
              />
            </div>
            <div className="w-full flex gap-3 flex-col">
              <label>Détails</label>
              <input
                type="number"
                className="w-full border border-green-500 py-2"
              />
            </div>
        </form>
      </div>
    </div>
  );
}

export default Add;
