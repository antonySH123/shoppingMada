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
      <Link to={`/product/${product._id}/details`} className="market-card group flex h-full w-full flex-col cursor-pointer">
      <div className="relative m-3 mb-0 overflow-hidden rounded-xl bg-gray-50">
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
          {priceInArriary(product.price)}
        </span>
          <img
            src={product.photos?.[0] ? `${import.meta.env.REACT_API_URL}uploads/${product.photos[0]}` : "/logo.png"}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <h3 className="line-clamp-1 font-semibold text-gray-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{product.description.length > 80 ? `${product.description.slice(0,80)} ...`: product.description} </p>
        </div>
        
      </Link>
    </React.Fragment>
  );
}

export default ProductCard;
