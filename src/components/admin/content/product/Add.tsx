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
export interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  details: string;
  
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
  const [files, setFiles] = useState<File[]>([]);
  const [product, setProduct] = useState<IProduct>({
    name: "",
    price: 0.0,
    category: "",
    description: "",
    details: "",
    stock: 0,
    
  });
  const config = {
    height: "350",
  };

  const csrf = useCSRF();
  const handleFileRemove = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = createFormDataFromObject(product);
      files.forEach((image) => {
        formData.append("image", image);
      });
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}product`,
          {
            method: "POST",
            headers: {
              "xsrf-token": csrf,
            },
            credentials:"include",
            body: formData,
          }
        );

        if (!response.ok) {
          toast.error("Un erreur c'est produite!");
          setProduct({
            name: "",
            price: 0.0,
            category: "",
            description: "",
            details: "",
            stock: 0,
          });
          setSelectedCategoryId(null);
          setFiles([]);
        }

        if (response.status === 201) {
          const result = await response.json();
          toast.success(result.message);
          setProduct({
            name: "",
            price: 0.0,
            category: "",
            description: "",
            details: "",
            stock: 0,
          });
          setSelectedCategoryId(null);
          setFiles([]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedCategoryId) {
      setProduct((prev) => ({ ...prev, category: selectedCategoryId }));
    }
  }, [selectedCategoryId]);

  return (
    <div className="px-10">
      <h1 className="text-center text-4xl uppercase my-5">Nouveau produit</h1>
      <div className="w-full h-full">
        <form
          action=""
          method="post"
          className="w-full shadow-md p-10 bg-white rounded-md "
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex w-full  gap-5">
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
                    {files &&
                      files.map((file, index) => (
                        <li key={index} className="mb-2 relative">
                          <div
                            onClick={() => handleFileRemove(index)}
                            className="w-6 absolute cursor-pointer -right-2 -top-2 h-6 rounded-full bg-slate-100 shadow flex justify-center items-center"
                          >
                            <LiaTimesSolid size={10} />
                          </div>
                          {file.type.startsWith("image/") && (
                            <div className="flex items-center space-x-2">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-[100px] h-[100px]  object-cover rounded"
                              />
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
                {files.length < 5 && (
                  <div
                    className=" w-[100px] h-[100px] border-2 shadow rounded-sm flex flex-col justify-center items-center"
                    onClick={() => {
                      inputFile?.current?.click();
                    }}
                  >
                    <LiaImageSolid size={30} />{" "}
                    <span className="text-[10px]">choisir une fichier</span>
                  </div>
                )}
                <input
                  ref={inputFile}
                  hidden
                  type="file"
                  name="image"
                  id=""
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
                value={product.details}
                config={config}
                onBlur={(newContent) =>
                  setProduct({ ...product, details: newContent })
                }
              />
            </div>
          </div>

          <div className="w-full mt-10">
            <button className="bg-green-500 w-1/2 px-10 py-3 mx-auto text-white rounded-md flex justify-center items-center gap-2 uppercase">
              <LiaDatabaseSolid size={20} /> <strong>valider</strong>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Add;
