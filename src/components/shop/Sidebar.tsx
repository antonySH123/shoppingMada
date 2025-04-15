import React, { useEffect, useState } from "react";
import { AccordionItem } from "../product/AccordionItem";
import { LiaAngleRightSolid } from "react-icons/lia";

interface ICategory {
  name: string;
  slug: string;
  children: Array<ICategory>;
}

const Sidebar: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Détection initiale de la largeur d'écran
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setIsSidebarOpen(false); // mobile/tablette = fermé
      } else {
        setIsSidebarOpen(true); // desktop = ouvert
      }
    };

    handleResize(); // au montage

    // (optionnel) Met à jour dynamiquement si tu veux
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className={`bg-white fixed md:relative transition-all duration-300 shadow-md ${isSidebarOpen ? "w-64" : "w-14"}`}>
      <div className={`flex justify-between items-center py-3 bg-gray-100 ${isSidebarOpen ? "px-4" : "px-2"}`}>
        <h1 className="text-lg font-bold text-gray-700">
          {isSidebarOpen ? "Catégories" : ""}
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-800"
        >
          {isSidebarOpen ? "×" : <LiaAngleRightSolid />}
        </button>
      </div>
      <div className={`space-y-2 px-2 py-3 ${isSidebarOpen ? "block" : "hidden"}`}>
        {categories.map((category) => (
          <AccordionItem key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
