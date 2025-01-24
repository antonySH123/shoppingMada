import React from "react";
import { LiaShoppingCartSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import IProduct from "../../Interface/IProduct";

interface IProductProps {
  product: IProduct
}

function ProductCard({ product }: IProductProps) {
  return (
    <React.Fragment>
      <div className="card shadow-lg h-auto pb-5 w-full rounded-lg bg-gray-100">
        <div className=" bg-gray-100 px-3 pt-3">
          <img
            src={`${import.meta.env.REACT_API_URL}uploads/${product.photos && product.photos[0]}`}
            alt=""
            className="w-full"
          />
        </div>
        <div className="mt-2 mb-3 px-4">
          <h3>T{product.name}</h3>
          <p className="font-semibold">{product.description.length > 50 && `${product.description.slice(0,50)} ...`} </p>
        </div>
        <div className="px-4 flex gap-2">
          <Link
            to={`/product/${product._id}/details`}
            className="rounded-md text-gray-500 border-2 border-solid border-gray-500 bg-white w-full flex items-center justify-center py-1 transition-all ease-in hover:bg-green-500 hover:text-white hover:border-solid hover:border-2 hover:border-white"
          >
            Détails
          </Link>
          <Link
            to=""
            className="bg-green-500 rounded-md text-white border-2 border-solid border-white flex-shrink-0 w-11 h-11 flex items-center justify-center py-1 transition-all ease-in  hover:text-white hover:border-solid hover:border-2 hover:border-white "
          >
            <LiaShoppingCartSolid />
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ProductCard;
