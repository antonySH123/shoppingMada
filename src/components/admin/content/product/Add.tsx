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
const MAX_PRODUCT_IMAGE_BYTES = 20 * 1024 * 1024;
const supportedImageExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif", "heic", "heif", "gif", "tif", "tiff", "svg"]);
const supportedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", "image/gif", "image/tiff", "image/svg+xml"]);
const browserOptionalImageExtensions = new Set(["avif", "heic", "heif", "tif", "tiff", "svg"]);

function getImageExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

async function validateProductImage(file: File): Promise<{ valid: boolean; previewable: boolean; message?: string }> {
  const extension = getImageExtension(file);
  const supported = supportedImageMimeTypes.has(file.type.toLowerCase()) || supportedImageExtensions.has(extension);
  if (!supported) return { valid: false, previewable: false, message: `${file.name} : ce format d’image ne peut pas être converti.` };
  if (file.size <= 0) return { valid: false, previewable: false, message: `${file.name} : le fichier est vide.` };
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) return { valid: false, previewable: false, message: `${file.name} dépasse la limite de 20 Mo.` };

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      const valid = bitmap.width > 0 && bitmap.height > 0;
      bitmap.close();
      if (valid) return { valid: true, previewable: true };
    } else {
      const previewUrl = URL.createObjectURL(file);
      try {
        const image = new Image();
        image.src = previewUrl;
        await image.decode();
        if (image.naturalWidth > 0 && image.naturalHeight > 0) return { valid: true, previewable: true };
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    }
  } catch {
    // Le navigateur peut ne pas décoder les formats que le backend sait convertir.
  }

  if (browserOptionalImageExtensions.has(extension) || ["image/avif", "image/heic", "image/heif", "image/tiff", "image/svg+xml"].includes(file.type.toLowerCase())) {
    return { valid: true, previewable: false };
  }
  return { valid: false, previewable: false, message: `${file.name} semble endommagé ou impossible à lire.` };
}

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

function getProductSaveError(status: number, payload: any, responseText: string): string[] {
  const details = Array.isArray(payload?.errors)
    ? payload.errors.map((error: any) => String(error?.msg ?? error?.message ?? "").trim()).filter(Boolean)
    : [];
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (message || details.length) return [...new Set([message, ...details].filter(Boolean))];
  if (status === 413) return ["La requête est trop volumineuse. Le serveur ou Nginx a refusé les images avant leur traitement.", "Réduisez la taille des images ou demandez à l’administrateur d’augmenter client_max_body_size dans Nginx (par exemple 110m), puis de recharger sa configuration."];
  if (status === 415) return ["Le format d’une image n’est pas pris en charge ou le fichier est illisible. Utilisez JPEG, PNG, WebP, AVIF, HEIC/HEIF, GIF, TIFF ou SVG."];
  if (status === 401) return ["Votre session a expiré. Reconnectez-vous puis réessayez."];
  if (status === 403) return ["L’enregistrement a été refusé : votre session de sécurité a peut-être expiré, ou votre compte/forfait ne permet pas cette action. Actualisez la page et vérifiez votre forfait."];
  if (status === 404) return ["L’adresse du service produit est introuvable. Actualisez l’application; si le problème persiste, contactez le support."];
  if ([502, 503, 504].includes(status)) return ["Le serveur de l’API est momentanément indisponible ou n’a pas répondu à temps. Réessayez dans quelques instants; si l’erreur persiste, l’administrateur doit vérifier le backend et Nginx."];
  if (status >= 500) return ["Le serveur n’a pas pu enregistrer le produit. Vos informations restent dans le formulaire. Réessayez; si l’erreur persiste, transmettez le code HTTP à l’administrateur pour vérifier les journaux du backend."];
  if (/<html|<!doctype|nginx|bad gateway|request entity too large/i.test(responseText)) return ["Le serveur intermédiaire a refusé la requête sans fournir de détail. Vérifiez la limite d’envoi Nginx et l’état du backend."];
  return [`L’enregistrement a échoué (HTTP ${status || "inconnu"}). Vérifiez les champs obligatoires et les images, puis réessayez.`];
}

function Add() {
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<(File | string)[]>([]); // Existing names and newly selected files
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [previewableFiles, setPreviewableFiles] = useState<Record<string, boolean>>({});
  const [validatingFiles, setValidatingFiles] = useState(false);
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
  const [quota, setQuota] = useState<{ name: string; quota: number; used: number; remaining: number | null } | null>(null);
  const [submitError, setSubmitError] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const quotaReached = Boolean(!productId && quota && quota.remaining !== null && quota.remaining <= 0);

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
      setPreviewableFiles((prev) => {
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

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files || []);
    input.value = "";
    if (selectedFiles.length === 0) return;

    setValidatingFiles(true);
    try {
      const remainingSlots = Math.max(0, 5 - files.length);
      const acceptedFiles: File[] = [];
      const previewStatus: Record<string, boolean> = {};
      for (const file of selectedFiles) {
        const result = await validateProductImage(file);
        if (!result.valid) {
          toast.error(result.message || `${file.name} ne peut pas être utilisé.`);
          continue;
        }
        if (acceptedFiles.length >= remainingSlots) {
          toast.info("Vous pouvez ajouter jusqu’à 5 images au total.");
          break;
        }
        acceptedFiles.push(file);
        previewStatus[`${file.name}-${file.lastModified}`] = result.previewable;
      }

      if (acceptedFiles.length > 0) {
        setFiles((previous) => [...previous, ...acceptedFiles].slice(0, 5));
        setFilePreviews((previous) => {
          const next = { ...previous };
          acceptedFiles.forEach((file) => {
            const key = `${file.name}-${file.lastModified}`;
            if (!next[key]) next[key] = URL.createObjectURL(file);
          });
          return next;
        });
        setPreviewableFiles((previous) => ({ ...previous, ...previewStatus }));
      }
    } finally {
      setValidatingFiles(false);
    }
  };

  // Fonction pour envoyer le formulaire (ajouter ou éditer)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError([]);
    if (!selectedCategoryId) {
      toast.error("Choisissez une catégorie pour le produit.");
      return;
    }
    if (quotaReached) {
      toast.info("Votre forfait a atteint sa limite de produits. Passez à un forfait supérieur pour publier davantage.");
      return;
    }
    if (validatingFiles) {
      toast.info("Attendez la fin de la vérification des images avant de publier.");
      return;
    }
    if (!csrf) {
      const messages = ["Le jeton de sécurité n’est pas disponible. Actualisez la page et reconnectez-vous si nécessaire."];
      setSubmitError(messages);
      toast.error(messages[0]);
      return;
    }
    setIsSubmitting(true);
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

      {
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

        const responseText = await response.text();
        let result: any = null;
        try {
          result = responseText ? JSON.parse(responseText) : null;
        } catch {
          // Les proxys peuvent renvoyer une page HTML au lieu du JSON de l’API.
        }
        if (!response.ok) {
          const messages = getProductSaveError(response.status, result, responseText);
          setSubmitError(messages);
          toast.error(messages[0]);
          return;
        }

        toast.success(result?.message || "Produit enregistré avec succès.");
        resetForm();
      }
    } catch (error) {
      const message = error instanceof TypeError
        ? "Connexion impossible au serveur. Vérifiez votre connexion Internet et l’adresse de l’API, puis réessayez."
        : error instanceof Error ? error.message : "Impossible d’enregistrer le produit pour une raison inconnue.";
      setSubmitError([message]);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
    setPreviewableFiles({});
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

  useEffect(() => {
    if (productId) return;
    void fetch(`${import.meta.env.REACT_API_URL}seller/entitlements`, { credentials: "include" }).then(async (response) => {
      const result = await response.json();
      if (response.ok) setQuota(result.data);
    }).catch(() => undefined);
  }, [productId]);

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
      {!productId && quota && <div className={`admin-panel grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center ${quotaReached ? "border-amber-400/40" : ""}`}><div><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>Forfait <strong>{quota.name}</strong></span><span className="text-[var(--admin-muted)]">{quota.used} produit(s) utilisé(s){quota.quota > 0 ? ` sur ${quota.quota}` : " · sans limite"}</span></div>{quota.quota > 0 && <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${quotaReached ? "bg-amber-400" : "bg-[var(--admin-accent-solid)]"}`} style={{ width: `${Math.min(100, quota.used / quota.quota * 100)}%` }} /></div>}{quotaReached && <p className="mt-2 text-xs text-[var(--admin-warning)]">La limite du forfait est atteinte. Vous pouvez toujours modifier vos produits existants.</p>}</div>{quotaReached && <Link to="/espace_vendeur/upgrade-pro" className="admin-button admin-button--primary admin-button--md">Découvrir un forfait supérieur</Link>}</div>}

      <form
        action=""
        method="post"
        className="admin-panel grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        onSubmit={handleSubmit}
      >
        {submitError.length > 0 && (
          <div role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 xl:col-span-2">
            <p className="font-semibold">Le produit n’a pas été enregistré</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {submitError.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}
            </ul>
          </div>
        )}
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
                Jusqu’à 5 images · JPEG, PNG, WebP, AVIF, HEIC/HEIF, GIF, TIFF, SVG · 20 Mo maximum par image. Les fichiers sont optimisés en WebP.
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
                      ) : previewableFiles[`${file.name}-${file.lastModified}`] ? (
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
                        ) : <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] px-2 text-center text-xs text-[var(--admin-muted)]"><LiaImageSolid size={24} /><span className="mt-1 w-full truncate">{file.name}</span><span className="text-[10px]">{file.type.split("/").pop()?.toUpperCase() || getImageExtension(file).toUpperCase()}</span></div>}
                    </li>
                  ))}
                </ul>
              )}

              {files.length < 5 && (
                <button
                  type="button"
                  className="flex h-[100px] w-[100px] flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-raised)] text-[var(--admin-muted)] shadow-sm transition hover:border-[var(--admin-accent-solid)] hover:text-[var(--admin-accent-solid)]"
                  disabled={validatingFiles}
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
                accept="image/*"
                name="photos"
                onChange={(event) => void handleFilesSelected(event)}
                multiple
              />
              {validatingFiles && <p role="status" className="text-xs text-[var(--admin-muted)]">Vérification et lecture des images…</p>}
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
          <AdminButton type="submit" variant="primary" size="lg" disabled={quotaReached || validatingFiles || isSubmitting}>
            <LiaDatabaseSolid size={18} />
            {isSubmitting ? "Enregistrement…" : productId ? "Enregistrer les modifications" : "Publier le produit"}
          </AdminButton>
        </footer>
      </form>
    </div>
  );
}

export default Add;
