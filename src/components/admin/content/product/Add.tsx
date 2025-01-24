import React, { useEffect, useRef, useState } from "react";
import JodiEditor from "jodit-react";
import Categorie from "../../../categorie/Categorie";
import {
  LiaDatabaseSolid,
  LiaImageSolid,
  LiaTimesSolid,
} from "react-icons/lia";
import { useCategory } from "../../../../context/ProductContext";
import { toast } from "react-toastify";
import useCSRF from "../../../../helper/useCSRF";
import { useParams } from "react-router-dom";

export interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  details: string;
  photos: File[]; // Liste des fichiers photo
  [key: string]: string | number | boolean | object | null;
}

function createFormDataFromObject(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value)); // Convertir les autres types en chaîne
    }
  });
  return formData;
}

function Add() {
  const editor = useRef(null);
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]); // Liste des fichiers photo
  const [product, setProduct] = useState<IProduct>({
    name: "",
    price: 0.0,
    category: "",
    description: "",
    details: "",
    stock: 0,
    photos: [], // Initialiser les photos à un tableau vide
  });

  const [content,setContent] = useState("");

  useEffect(()=>{
    setProduct((prevProduct)=>({...prevProduct, details:content}))
  },[content])
  const { productId } = useParams();
  const config = {
    height: "350",
    pastePlainText:false
  };
  const csrf = useCSRF();

  // Fonction pour supprimer un fichier
  const handleFileRemove = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Fonction pour gérer les changements des champs du formulaire
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour envoyer le formulaire (ajouter ou éditer)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = createFormDataFromObject(product);
      files.forEach((photo) => {
        formData.append("image", photo); // Changer de "image" à "photos"
      });

      if (csrf) {
        const method = productId ? "PUT" : "POST"; // Utiliser PUT si productId existe (modification)
        const url = productId
          ? `${import.meta.env.REACT_API_URL}product/${productId}`
          : `${import.meta.env.REACT_API_URL}product`;

        const response = await fetch(url, {
          method: method,
          headers: {
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          toast.error("Une erreur s'est produite!");
          resetForm();
        }

        if (response.status === 201 || response.status === 200) {
          const result = await response.json();
          toast.success(result.message);
          resetForm();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Réinitialisation du formulaire après succès
  const resetForm = () => {
    setProduct({
      name: "",
      price: 0.0,
      category: "",
      description: "",
      details: "",
      stock: 0,
      photos: [], // Réinitialiser aussi les photos
    });
    setSelectedCategoryId(null);
    setFiles([]);
  };

  // Remplir le formulaire avec les données du produit existant si productId est fourni
  useEffect(() => {
    if (selectedCategoryId) {
      setProduct((prev) => ({ ...prev, category: selectedCategoryId }));
    }

    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.REACT_API_URL}shop/product/${productId}`,
            { credentials: "include" }
          );
          if (response.ok) {
            const { data } = await response.json();

            setProduct(data);
            setFiles(data.photos || []); // Utiliser "photos" au lieu de "images"
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchProduct();
    }
  }, [selectedCategoryId, productId]);

  return (
    <div className="px-10">
      <h1 className="text-center text-4xl uppercase my-5">
        {productId ? "Modifier le produit" : "Ajouter un nouveau produit"}
      </h1>
      <div className="w-full h-full">
        <form
          action=""
          method="post"
          className="w-full shadow-md p-10 bg-white rounded-md "
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex w-full gap-5">
                <div className="w-full flex gap-3 flex-col">
                  <label>Nom du produit</label>
                  <input
                    type="text"
                    className="w-full border border-green-500 py-2"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full flex gap-3 flex-col">
                  <label>Prix</label>
                  <input
                    type="number"
                    className="w-full border border-green-500 py-2"
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full flex gap-3 flex-col">
                  <label>Stock</label>
                  <input
                    type="number"
                    className="w-full border border-green-500 py-2"
                    name="stock"
                    value={product.stock}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="w-full py-5">
                <div className="">
                  <label>Categorie</label>
                  <Categorie />
                </div>
              </div>
              <div className="w-full flex gap-3 flex-col mb-3">
                <label>Description</label>
                <input
                  type="text"
                  className="w-full border border-green-500 py-2"
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {files && files.length > 0 && (
                  <ul className="flex gap-2">
                    {files.map((file, index) => (
                      <li key={index} className="mb-2 relative">
                        <div
                          onClick={() => handleFileRemove(index)}
                          className="w-6 absolute cursor-pointer -right-2 -top-2 h-6 rounded-full bg-slate-100 shadow flex justify-center items-center"
                        >
                          <LiaTimesSolid size={10} />
                        </div>
                        {typeof file === "string" ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={`${
                                import.meta.env.REACT_API_URL
                              }uploads/${file}`} // Replace with your image URL structure
                              alt={file}
                              className="w-[100px] h-[100px] object-cover rounded"
                            />
                          </div>
                        ) : (
                          file.type.startsWith("image/") && (
                            <div className="flex items-center space-x-2">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-[100px] h-[100px] object-cover rounded"
                              />
                            </div>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {files.length < 5 && (
                  <div
                    className="w-[100px] h-[100px] border-2 shadow rounded-sm flex flex-col justify-center items-center"
                    onClick={() => {
                      inputFile?.current?.click();
                    }}
                  >
                    <LiaImageSolid size={30} />
                    <span className="text-[10px]">Choisir un fichier</span>
                  </div>
                )}
                <input
                  ref={inputFile}
                  hidden
                  type="file"
                  name="photos"
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
                  }}
                  multiple
                />
              </div>
            </div>
            <div className="w-full flex gap-3 flex-col">
              <label>Détails</label>
              <JodiEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) =>setContent(newContent)
                }
              />
            </div>
          </div>

          <div className="w-full mt-10">
            <button className="bg-green-500 w-1/2 px-10 py-3 mx-auto text-white rounded-md flex justify-center items-center gap-2 uppercase">
              <LiaDatabaseSolid size={20} /> <strong>Valider</strong>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Add;
