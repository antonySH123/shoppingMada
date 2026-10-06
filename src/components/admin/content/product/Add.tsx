import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Categorie from "../../../categorie/Categorie";
import {
  LiaDatabaseSolid,
  LiaImageSolid,
  LiaTimesSolid,
} from "react-icons/lia";
import { useCategory } from "../../../../context/useCategory";
import { toast } from "react-toastify";
import useCSRF from "../../../../helper/useCSRF";
import { useParams } from "react-router-dom";
import { useContent } from "../../../../context/JoditEditorContext";
import Preloader from "../../../loading/Preloader";
import { Link } from "react-router-dom";
import { AdminButton, AdminField, AdminInput, PageHeader } from "../../ui";

const Editor = lazy(() => import("./Editor"));

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
    if (key === "photos") return;
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
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<(File | string)[]>([]); // Existing names and newly selected files
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const filePreviewsRef = useRef(filePreviews);
  filePreviewsRef.current = filePreviews;
  const [product, setProduct] = useState<IProduct>({
    name: "",
    price: 0.0,
    category: "",
    description: "",
    details: "",
    stock: 0,
    photos: [], // Initialiser les photos à un tableau vide
  });

  const { content, setNewContent } = useContent();

  useEffect(() => {
    setProduct((prevProduct) => ({ ...prevProduct, details: content }));
  }, [content]);
  useEffect(
    () => () =>
      Object.values(filePreviewsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      ),
    [],
  );
  const { productId } = useParams();

  const csrf = useCSRF();
  const handleFileRemove = (index: number) => {
    const removed = files[index];
    if (removed instanceof File) {
      const key = `${removed.name}-${removed.lastModified}`;
      if (filePreviews[key]) URL.revokeObjectURL(filePreviews[key]);
      setFilePreviews((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour envoyer le formulaire (ajouter ou éditer)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = createFormDataFromObject(product);
      formData.set("details", content);
      files.forEach((photo) => {
        if (photo instanceof File) formData.append("image", photo);
      });
      formData.append(
        "photos",
        JSON.stringify(
          files.filter((photo): photo is string => typeof photo === "string"),
        ),
      );

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

        const result = await response.json().catch(() => null);
        if (!response.ok) {
          toast.error(result?.message || "Une erreur s'est produite!");
          return;
        }

        toast.success(result?.message || "Produit enregistré avec succès.");
        resetForm();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer le produit.",
      );
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
    Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews({});
    setNewContent("");
  };
  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}shop/product/${productId}`,
        { credentials: "include" },
      );
      if (response.ok) {
        const { data } = await response.json();

        setProduct(data);
        setFiles(data.photos || []);
        setNewContent(data.details);
        setSelectedCategoryId(data.category);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, setSelectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      setProduct((prev) => ({ ...prev, category: selectedCategoryId }));
    }

    if (productId) {
      fetchProduct();
    }
  }, [selectedCategoryId, productId, fetchProduct]);

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Catalogue boutique"
        title={productId ? "Modifier le produit" : "Ajouter un produit"}
        description="Présentez votre article avec des informations claires, un prix et un stock à jour."
        action={
          <Link
            to="/espace_vendeur/products"
            className="admin-button admin-button--outline admin-button--md"
          >
            Retour au catalogue
          </Link>
        }
      />

      <form
        action=""
        method="post"
        className="admin-panel grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        onSubmit={handleSubmit}
      >
        <div className="grid min-w-0 content-start gap-4">
          <section className="grid min-w-0 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Nom du produit"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              required
            />
            <AdminField label="Catégorie" required>
              <Categorie />
            </AdminField>
            <AdminInput
              label="Prix (Ar)"
              type="number"
              min="0"
              step="1"
              name="price"
              value={product.price}
              onChange={handleInputChange}
              required
            />
            <AdminInput
              label="Stock disponible"
              type="number"
              min="0"
              step="1"
              name="stock"
              value={product.stock}
              onChange={handleInputChange}
              required
            />
          </section>

          <AdminInput
            label="Description courte"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            required
          />

          <section className="admin-product-images">
            <div>
              <h2 className="admin-subsection-title">Images du produit</h2>
              <p className="admin-helper-text">
                Jusqu’à 5 images, au format JPEG, PNG ou WebP.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {files && files.length > 0 && (
                <ul className="flex gap-2">
                  {files.map((file, index) => (
                    <li
                      key={
                        typeof file === "string"
                          ? file
                          : `${file.name}-${file.lastModified}`
                      }
                      className="relative"
                    >
                      <button
                        type="button"
                        aria-label={`Retirer l’image ${index + 1}`}
                        onClick={() => handleFileRemove(index)}
                        className="absolute -right-2 -top-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm"
                      >
                        <LiaTimesSolid size={10} />
                      </button>

                      {typeof file === "string" ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${import.meta.env.REACT_API_URL}uploads/${file}`}
                            alt={file}
                            className="admin-product-preview"
                          />
                        </div>
                      ) : (
                        file.type.startsWith("image/") && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={
                                filePreviews[
                                  `${file.name}-${file.lastModified}`
                                ]
                              }
                              alt={file.name}
                              className="admin-product-preview"
                            />
                          </div>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {files.length < 5 && (
                <button
                  type="button"
                  className="flex h-[100px] w-[100px] flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-raised)] text-[var(--admin-muted)] shadow-sm transition hover:border-[var(--admin-accent-solid)] hover:text-[var(--admin-accent-solid)]"
                  onClick={() => {
                    inputFile?.current?.click();
                  }}
                >
                  <LiaImageSolid size={30} />
                  <span className="text-[10px]">Choisir une image</span>
                </button>
              )}

              <input
                ref={inputFile}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                name="photos"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  const acceptedFiles = selectedFiles.slice(
                    0,
                    Math.max(0, 5 - files.length),
                  );
                  setFiles((prevFiles) =>
                    [...prevFiles, ...acceptedFiles].slice(0, 5),
                  );
                  setFilePreviews((prev) => {
                    const next = { ...prev };
                    acceptedFiles.forEach((file) => {
                      const key = `${file.name}-${file.lastModified}`;
                      if (!next[key]) next[key] = URL.createObjectURL(file);
                    });
                    return next;
                  });
                  e.target.value = "";
                }}
                multiple
              />
            </div>
          </section>
        </div>

        <section className="admin-editor-panel min-w-0">
          <h2 className="admin-subsection-title">Description détaillée</h2>
          <Suspense
            fallback={
              <p role="status" className="text-sm text-[var(--admin-muted)]">
                Chargement de l’éditeur…
              </p>
            }
          >
            <Editor />
          </Suspense>
        </section>

        <footer className="admin-form-footer xl:col-span-2">
          <p>
            Les modifications seront visibles sur la page de votre boutique.
          </p>
          <AdminButton type="submit" variant="primary" size="lg">
            <LiaDatabaseSolid size={18} />
            {productId ? "Enregistrer les modifications" : "Publier le produit"}
          </AdminButton>
        </footer>
      </form>
    </div>
  );
}

export default Add;
