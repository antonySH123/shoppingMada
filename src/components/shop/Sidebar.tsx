import React, { useEffect, useState } from "react";
import { AccordionItem } from "../product/AccordionItem";

interface ICategory {
  name: string;
  slug: string;
  children: Array<ICategory>;
}

const Sidebar: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Gérer l'ouverture/fermeture de la sidebar

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_API_CATEGORY_URL}all/category`);
        const data = await response.json();
        setCategories(data.category);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories", error);
      }
    };

    fetchCategory();
  }, []);

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-16"} overflow-hidden`}>
      <div className="flex justify-between items-center px-4 py-3 bg-gray-100">
        <h1 className="text-lg font-bold text-gray-700">
          {isSidebarOpen ? "Catégories" : ""}
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-800"
        >
          {isSidebarOpen ? "×" : "☰"}
        </button>
      </div>
      <div className={`space-y-2 ${isSidebarOpen ? "block" : "hidden"}`}>
        {categories.map((category) => (
          <AccordionItem key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
