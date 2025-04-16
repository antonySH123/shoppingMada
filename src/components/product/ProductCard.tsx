import React from "react";
import { Link } from "react-router-dom";
import IProduct from "../../Interface/IProduct";
import useFormatter from "../../helper/useFormatter";

interface IProductProps {
  product: IProduct
}

function ProductCard({ product }: IProductProps) {
  const {priceInArriary} = useFormatter();
  return (
    <React.Fragment>
      <Link to={`/product/${product._id}/details`} className="card shadow-lg  h-auto pb-5 w-full rounded-lg border-green-100 border cursor-pointer relative">
      <div className="bg-green-500 w-fit px-2 py-1 absolute right-0 top-0 rounded-se-lg rounded-bl-xl">
        <strong className="text-white text-wrap text-center" style={{fontSize:"10px"}}>{priceInArriary(product.price)}</strong>
      </div>
        <div className=" px-3 pt-3">
          <img
            src={`${import.meta.env.REACT_API_URL}uploads/${product.photos && product.photos[0]}`}
            alt=""
            className="w-full"
          />
        </div>
        <div className="mt-2 mb-3 px-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm">{product.description.length > 50 ? `${product.description.slice(0,50)} ...`: product.description} </p>
        </div>
        
      </Link>
    </React.Fragment>
  );
}

export default ProductCard;
