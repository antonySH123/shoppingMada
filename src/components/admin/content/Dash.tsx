import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  FaArrowRight,
  FaBox,
  FaExclamationTriangle,
  FaPlus,
  FaShoppingCart,
  FaStore,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import UserInfo from "../../modals/UserInfo";
import { LiaUploadSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import IProduct from "../../../Interface/IProduct";
import ICommande from "../../../Interface/command.interfaces";
import ListAbonnement from "../abonnements/ListAbonnement";
import Iuser from "../../../Interface/UserInterface";
import Preloader from "../../loading/Preloader";
import { formatStatus } from "../../../helper/locale";

const formatAriary = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(amount);

function Dash() {
  const { user } = useAuth();
  const role = user?.userGroupMember_id?.usergroup_id?.name;
  const isSeller = role === "Boutiks";
  const isSuperAdmin = role === "Super Admin";
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const closeModal = () => setIsModalOpen(false);
  const [cin, setCIN] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputFile = useRef<HTMLInputElement | null>(null);
  const csrf = useCSRF();
  const [products, setProduct] = useState<IProduct[]>();
  const [commandes, setCommandes] = useState<ICommande[]>();
  const [users, setUsers] = useState<Iuser[]>();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("cin", cin);
    files.forEach((image) => {
      formData.append("image", image);
    });
    if (csrf) {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}personnal/info`,
        {
          method: "PUT",
          headers: {
            "xsrf-token": csrf,
          },
          body: formData,
          credentials: "include",
        },
      );

      if (!response.ok) {
        toast.error("Une erreur s'est produite! ");
      }

      const success = await response.json();
      toast.success(success.message);
      setIsModalOpen(false);
    }
  };

  const getPersonnalInfo = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.REACT_API_URL}personnal/info`,
      {
        headers: {
          "Content-Type": "application/json",
          // Accept: "application/json",
        },
        credentials: "include",
      },
    );
    if (!response.ok)
      throw new Error(
        "Impossible de récupérer les informations de la boutique.",
      );
    const result = await response.json();
    if (!result.data?.cin) setIsModalOpen(true);
  }, []);

  const getProduct = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/product`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }
      if (response.status == 200) {
        const result = await response.json();
        setProduct(result.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, []);

  const fetchCommand = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}command`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.status === 200) setCommandes(result.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}users`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) setUsers(result.data ?? []);
      else
        toast.error(result.message || "Impossible de récupérer les comptes.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  useEffect(() => {
    if (role === "Boutiks") {
      getPersonnalInfo();
      getProduct();
      fetchCommand();
    } else if (role === "Super Admin") {
      fetchUsers();
    }
  }, [fetchCommand, fetchUsers, getPersonnalInfo, getProduct, role]);

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="admin-dashboard space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            {isSuperAdmin
              ? "Administration de la marketplace"
              : "Pilotage de la boutique"}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
            Bonjour {user?.username || ""}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {isSuperAdmin
              ? "Suivez les comptes et les demandes de la plateforme."
              : "Suivez votre activité et traitez les commandes en attente."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSeller ? (
            <>
              <Link
                to="/espace_vendeur/admin/addProduct"
                className="admin-action-primary"
              >
                <FaPlus aria-hidden="true" /> Ajouter un produit
              </Link>
              <Link
                to="/espace_vendeur/commandes"
                className="admin-action-secondary"
              >
                Voir les commandes <FaArrowRight aria-hidden="true" />
              </Link>
            </>
          ) : isSuperAdmin ? (
            <>
              <Link
                to="/espace_vendeur/shopaccounts"
                className="admin-action-primary"
              >
                <FaUsers aria-hidden="true" /> Gérer les comptes
              </Link>
              <Link
                to="/espace_vendeur/abonnements"
                className="admin-action-secondary"
              >
                Demandes d’abonnement <FaArrowRight aria-hidden="true" />
              </Link>
            </>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Indicateurs de l’activité"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {(isSuperAdmin
          ? [
              {
                label: "Comptes",
                value: users?.length,
                icon: <FaUsers />,
                tone: "text-sky-700 bg-sky-50",
              },
              {
                label: "Boutiques",
                value: users?.filter(
                  (item) =>
                    item.userGroupMember_id?.usergroup_id.name === "Boutiks",
                ).length,
                icon: <FaStore />,
                tone: "text-emerald-800 bg-emerald-50",
              },
              {
                label: "Clients",
                value: users?.filter(
                  (item) =>
                    item.userGroupMember_id?.usergroup_id.name === "Client",
                ).length,
                icon: <FaUsers />,
                tone: "text-indigo-700 bg-indigo-50",
              },
            ]
          : [
              {
                label: "Produits",
                value: products?.length,
                icon: <FaBox />,
                tone: "text-emerald-800 bg-emerald-50",
              },
              {
                label: "Commandes à traiter",
                value: commandes?.filter((item) => item.status === "Pending")
                  .length,
                icon: <FaShoppingCart />,
                tone: "text-amber-700 bg-amber-50",
              },
              {
                label: "Commandes reçues",
                value: commandes?.length,
                icon: <FaShoppingCart />,
                tone: "text-sky-700 bg-sky-50",
              },
              {
                label: "Produits à réapprovisionner",
                value: products?.filter(
                  (item) => typeof item.stock === "number" && item.stock <= 5,
                ).length,
                icon: <FaExclamationTriangle />,
                tone: "text-rose-700 bg-rose-50",
              },
            ]
        ).map((metric) => (
          <article key={metric.label} className="admin-metric-card">
            <span className={`admin-metric-icon ${metric.tone}`}>
              {metric.icon}
            </span>
            <span className="mt-4 text-2xl font-bold tabular-nums text-gray-950">
              {metric.value ?? "—"}
            </span>
            <span className="mt-1 text-sm text-gray-600">{metric.label}</span>
          </article>
        ))}
      </section>

      {isSeller ? (
        <section className="admin-panel min-w-0">
          <div className="admin-panel-heading">
            <div>
              <h3>Commandes à traiter</h3>
              <p>Les commandes clients en attente de confirmation.</p>
            </div>
            <Link to="/espace_vendeur/commandes" className="admin-panel-link">
              Toutes les commandes <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {commandes
                  ?.filter((item) => item.status === "Pending")
                  .map((item) => (
                    <tr key={item._id}>
                      <td className="font-mono text-xs">
                        #{item._id.slice(-7).toUpperCase()}
                      </td>
                      <td>
                        {item.owner_id?.username ||
                          item.owner_id?.email ||
                          "Client"}
                      </td>
                      <td className="font-semibold text-gray-900">
                        {item.product_id?.name || "Produit supprimé"}
                      </td>
                      <td>{item.quantity}</td>
                      <td className="font-semibold tabular-nums">
                        {formatAriary(item.total)}
                      </td>
                      <td>
                        <span className="admin-status-pending">
                          {formatStatus(item.status)}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="admin-panel-link"
                          to={`/espace_vendeur/commande/${item._id}`}
                        >
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                {commandes &&
                  commandes.filter((item) => item.status === "Pending")
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-gray-500"
                      >
                        Aucune commande en attente.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      ) : isSuperAdmin ? (
        <section className="admin-panel min-w-0">
          <ListAbonnement />
        </section>
      ) : null}

      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <div className="cin-info-modal">
          <header className="cin-info-modal-heading">
            <span className="cin-info-modal-icon">
              <LiaUploadSolid size={22} />
            </span>
            <div>
              <p className="cin-info-modal-eyebrow">Vérification du compte</p>
              <h2>Informations personnelles</h2>
              <p>
                Ajoutez votre numéro CIN et une photo lisible de votre pièce.
              </p>
            </div>
          </header>
          <form
            action=""
            method="post"
            encType="multpart/form-data"
            onSubmit={handleSubmit}
            className="cin-info-form"
          >
            <div>
              <label className="cin-info-field">
                Numéro CIN
                <input
                  type="text"
                  placeholder="Saisissez votre numéro CIN"
                  name="cin"
                  value={cin}
                  onChange={(e) => setCIN(e.target.value)}
                />
              </label>

              <div className="cin-info-upload-row">
                {files.length > 0 && (
                  <ul className="cin-info-previews">
                    {files &&
                      files.map((file, index) => (
                        <li key={index}>
                          {file.type.startsWith("image/") && (
                            <div className="cin-info-preview">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
                <button
                  type="button"
                  className="cin-info-upload-button"
                  aria-label="Choisir une image de votre CIN"
                  onClick={() => {
                    inputFile?.current?.click();
                  }}
                >
                  <LiaUploadSolid size={22} />
                  <span>Ajouter une photo</span>
                  <small>JPG, PNG ou autre image</small>
                </button>
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

            <div className="cin-info-actions">
              <button type="submit" className="market-button-primary">
                Enregistrer mes informations
              </button>
            </div>
          </form>
        </div>
      </UserInfo>
    </div>
  );
}

export default Dash;
