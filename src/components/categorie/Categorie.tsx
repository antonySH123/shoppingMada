import { useCallback, useEffect, useState } from "react";
import {
  FaChevronDown,
  FaArrowLeft,
  FaAngleRight,
  FaPlus,
} from "react-icons/fa";

import { toast } from "react-toastify";
import { useCategory } from "../../context/ProductContext";
import useCSRF from "../../helper/useCSRF";

// Types pour les catégories
interface Category {
  _id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface BoutikInfo {
  product_category: string;
}

interface NewCategory {
  name: string;
  slug: string;
  parent: string | null;
}

function Categorie() {
  const [boutikInfo, setBoutikInfo] = useState<BoutikInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<Category[][]>([]); // Historique des niveaux
  const [display, setDisplay] = useState(false);
  const [displayForm, setDisplayForm] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {setSelectedCategoryId} = useCategory();
  const csrf = useCSRF();
  const [selectedCategoryDisplay, setSelectedDisplay] = useState<string | null>(
    null
  );
  const [newCategory, setNewCategory] = useState<NewCategory>();

  // Récupération des catégories
  const getCategory = useCallback(async () => {
    if (!boutikInfo) return;

    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_CATEGORY_URL}find/category`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify(boutikInfo.product_category),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories");
      }

      const data = await response.json();
      setCategories(data.category || []);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [boutikInfo]);

  // Récupération des informations sur la boutique
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/info`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials:"include"
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des informations de la boutique"
        );
      }

      const result = await response.json();
      setBoutikInfo(result.boutiks || null);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, []);

  // Afficher/Masquer la liste des catégories
  const handleClick = () => {
    setDisplay((prev) => !prev);
  };
  // pour les ajouter les autre categorie
  const handleClickOther = () => {
    setDisplayForm((prev) => !prev);
  };

  // Gestion de l'affichage des sous-catégories
  const handleCategoryClick = (children?: Category[], id?: string) => {
    if (children) {
      setHistory((prevHistory) => [...prevHistory, categories]); // Ajouter l'état actuel à l'historique
      setCategories(children);
      setParentId(id as string);
    }
  };

  // Revenir au parent
  const goBack = () => {
    if (history.length > 0) {
      const previousCategories = history[history.length - 1]; // Dernier état
      setHistory((prevHistory) => prevHistory.slice(0, -1)); // Supprimer le dernier niveau de l'historique
      setCategories(previousCategories);
    }
  };

  const handleCheckboxChange = (categoryId: string, categoryName: string) => {
    setSelectedCategory((prevSelected) =>
      prevSelected === categoryId ? null : categoryId
    );
    setSelectedDisplay((prevSelected) =>
      prevSelected === categoryName ? null : categoryName
    );
  };

  const handleAddNewCategory = async () => {
    try {
      const sendFrom = await fetch(
        `${import.meta.env.REACT_API_CATEGORY_URL}${
          parentId ? parentId + "/add" : "store/category"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify(newCategory),
        }
      );

      if (!sendFrom.ok) {
        console.log("error");
      }

      if (sendFrom.status === 201) {
        const response = await sendFrom.json();
        setNewCategory({ ...newCategory, name: "", slug: "", parent: null });
        setSelectedCategoryId(response.category.name);
        console.log(response.category._id);
        
        if(csrf){
        const update = await fetch(`${import.meta.env.REACT_API_URL}boutiks/newCategories`,{
          method:"PUT",
          credentials:"include",
          headers:{
            "Content-Type": "application/json",
            "xsrf-token":csrf
          },
          
          
          body:JSON.stringify({category_id:response.category._id})
        })
        if(update.status === 200){
          fetchData();
        }
        toast.success(response.message);
      
      }
        
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Effet pour récupérer les données de la boutique
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effet pour récupérer les catégories lorsque les informations de la boutique sont disponibles
  useEffect(() => {
    if (boutikInfo) {
      getCategory();
    }
  }, [boutikInfo, getCategory]);

  useEffect(()=>{
    if(selectedCategory){
      setSelectedCategoryId(selectedCategory);
    }
  },[selectedCategory, setSelectedCategoryId])

  return (
    <div className="w-full">
      {/* Bouton principal pour afficher les catégories */}
      <div
        className="w-full py-2 border border-green-500 bg-white mb-3 px-5 flex justify-between items-center cursor-pointer"
        onClick={handleClick}
      >
        {selectedCategoryDisplay
          ? selectedCategoryDisplay
          : "Choisir votre catégorie"}{" "}
        <FaChevronDown />
      </div>

      {/* Liste des catégories */}
      {display && (
        <div className="bg-white border-none px-5 py-5 shadow-lg rounded-md">
          {categories.map((element, index) => (
            <div
              key={index}
              className="w-full py-2 px-5 cursor-pointer mb-3 hover:shadow-md rounded-md flex gap-3"
            >
              {/* Checkbox pour la catégorie */}
              <input
                type="checkbox"
                name="category"
                value={element.slug}
                checked={selectedCategory === element.slug}
                onChange={() => handleCheckboxChange(element.slug, element.name)}
              />

              {/* Conteneur pour le texte et l'icône */}
              <div
                className="w-full flex justify-between"
                onClick={() =>
                  element.children &&
                  element.children.length > 0 &&
                  handleCategoryClick(element.children, element.slug)
                }
              >
                {element.name}

                {/* Affichage de l'icône si des enfants existent */}
                {element.children && element.children.length > 0 && (
                  <FaAngleRight />
                )}
              </div>
            </div>
          ))}

          <div
            className="w-full py-2 border border-gray-50 bg-white mb-3 px-5 flex items-center cursor-pointer"
            onClick={handleClickOther}
          >
            <FaPlus className="mr-2" />
            Autres
          </div>
          {displayForm && (
            <div className="w-full">
              <div className="w-full flex items-center gap-5">
                <div className="w-full">
                  <input
                    type="text"
                    name="name"
                    className="w-full px-5 py-2 border border-green-500"
                    placeholder="Ajouter votre categorie"
                    value={newCategory?.name}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        name: e.target.value,
                        slug: e.target.value,
                        parent: parentId,
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="border border-green-500 px-3 py-2 text-gray-800 hover:bg-green-500 hover:text-white"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}
          {history.length > 0 && (
            <div
              className="w-full py-2 border border-gray-50 bg-white mb-3 px-5 flex items-center cursor-pointer"
              onClick={goBack}
            >
              <FaArrowLeft className="mr-2" />
              Revenir en arrière
            </div>
          )}
        </div>
      )}
      {/* Bouton pour revenir au parent */}

      {/* Message si aucune catégorie n'est disponible */}
      {categories.length === 0 && display && (
        <div className="w-full py-5 border border-gray-500 px-5">
          Aucune sous-catégorie disponible.
        </div>
      )}
    </div>
  );
}

export default Categorie;
