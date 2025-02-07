import React from "react";
import { Link } from "react-router-dom";
import IProduct from "../../Interface/IProduct";

interface IProductProps {
  product: IProduct
}

function ProductCard({ product }: IProductProps) {
  return (
    <React.Fragment>
      <Link to={`/product/${product._id}/details`} className="card shadow-lg h-auto pb-5 w-full rounded-lg  cursor-pointer">
        <div className=" px-3 pt-3">
          <img
            src={`${import.meta.env.REACT_API_URL}uploads/${product.photos && product.photos[0]}`}
            alt=""
            className="w-full"
          />
        </div>
        <div className="mt-2 mb-3 px-4">
          <h3>{product.name}</h3>
          <p className="font-semibold">{product.description.length > 50 && `${product.description.slice(0,50)} ...`} </p>
        </div>
        
      </Link>
    </React.Fragment>
  );
}

export default ProductCard;
