import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";

interface ICategory {
  name: string;
  slug: string;
  children: Array<ICategory>;
}

export const AccordionItem = ({ category }: { category: ICategory }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page lors du clic sur un lien
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b border-gray-200">
      {/* --- Catégorie Principale --- */}
      <div
        className="flex justify-between items-center py-3 px-4 cursor-pointer hover:bg-gray-100 transition"
        onClick={toggleAccordion}
      >
        <Link to={`/shop/${category.slug}`} className="text-gray-800 font-semibold text-sm">
          {category.name}
        </Link>
        {category.children.length > 0 && (
          <span className="text-gray-600">
            {isOpen ? <FaMinus size={12} /> : <FaPlus size={12} />}
          </span>
        )}
      </div>

      {/* --- Sous-catégories --- */}
      {isOpen && category.children.length > 0 && (
        <div className="pl-5 py-2 border-l border-gray-300">
          {category.children.map((child) => (
            <AccordionItem key={child.slug} category={child} />
          ))}
        </div>
      )}
    </div>
  );
};

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
          {isSidebarOpen ? "Catégories" : "☰"}
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-800"
        >
          {isSidebarOpen ? "×" : "☰"}
        </button>
      </div>

      {/* --- Liste des Catégories --- */}
      <div className={`space-y-2 ${isSidebarOpen ? "block" : "hidden"}`}>
        {categories.map((category) => (
          <AccordionItem key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
