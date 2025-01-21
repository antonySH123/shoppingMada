import { LiaShoppingBagSolid } from "react-icons/lia";

function ProductDetails() {
  return (
    <div className="px-10 py-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5">
      <div className="py-10">
        <img
          src="/src/assets/image/product/pharm.jpg"
          alt=""
          className="w-full mt-10 rounded-md"
        />
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4">
          <img src="/src/assets/image/product/pharm.jpg" alt="" />
          <img src="/src/assets/image/product/pharm.jpg" alt="" />
          <img src="/src/assets/image/product/pharm.jpg" alt="" />
          <img src="/src/assets/image/product/pharm.jpg" alt="" />
        </div>
      </div>
      <div className="py-10">
        <div className="py-10 flex flex-col gap-5">
          <h1 className="text-3xl">Informations sur le produit</h1>
          <p><strong>produit milay</strong></p>
          <p>200000 Ar</p>
          <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis quae porro a dolorem, reiciendis itaque laborum atque, quo ducimus asperiores quidem aperiam quis facilis ullam vitae laudantium libero velit eligendi!</p>
          <p><strong>Variant</strong></p>
          <p><strong>Quantité</strong></p>
          <p><input type="number" name="" id="" value={1} /></p>
          <div className="w-1/4">
          <a href="" className="rounded-md  border border-green-500 px-5 py-3 flex gap-3 hover:bg-green-500 hover:text-white"><LiaShoppingBagSolid size={30}/>commander</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
