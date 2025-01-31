import React from "react";
import { Link } from "react-router-dom";

const order = {
  id: 1,
  customer: "Jean Dupont",
  date: "2025-01-30",
  total: "$250.00",
  status: "Livré",
  items: [
    { name: "Produit A", quantity: 2, price: "$50.00" },
    { name: "Produit B", quantity: 1, price: "$150.00" },
  ],
};

const CommandeDetails: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Détails de la commande #{order.id}
        </h2>
        <p className="text-gray-600">
          <strong>Client:</strong> {order.customer}
        </p>
        <p className="text-gray-600">
          <strong>Date:</strong> {order.date}
        </p>
        <p className="text-gray-600">
          <strong>Total:</strong> {order.total}
        </p>
        <p className="text-gray-600">
          <strong>Status:</strong> {order.status}
        </p>
        <h3 className="text-xl font-semibold text-gray-700 mt-4">Articles</h3>
        <ul className="mt-2">
          {order.items.map((item, index) => (
            <li key={index} className="border-b py-2">
              {item.quantity} x {item.name} - {item.price}
            </li>
          ))}
        </ul>
        <div className="my-5">
          <Link to="" className="border border-green-500 px-3 py-3 hover:bg-green-500 hover:text-white rounded">
            Valider
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommandeDetails;
