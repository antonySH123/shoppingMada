import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { FaShoppingCart, FaSun, FaUsers } from "react-icons/fa";
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

function Dash() {
  const { user } = useAuth();
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
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (!result.data.cin) setIsModalOpen(true);
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

      if (response.status === 200) setUsers(result.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    getPersonnalInfo();
    getProduct();
    fetchCommand();
  }, [fetchCommand, fetchUsers, getPersonnalInfo, getProduct, user]);

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="admin-dashboard">
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="market-card flex min-h-40 w-full flex-col items-start justify-center gap-2 p-6">
          <div>
            {users ? (
              <FaShoppingCart className="text-3xl text-emerald-700" />
            ) : (
              <FaUsers className="text-3xl text-emerald-700" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {user &&
              user.userGroupMember_id.usergroup_id.name === "Super Admin"
                ? users?.length
                : products?.length}
            </h1>
          </div>
          <div>
            <h1 className="text-sm font-medium text-gray-500">
              {user &&
              user.userGroupMember_id.usergroup_id.name === "Super Admin"
                ? "Utilisateurs"
                : "Product"}
            </h1>
          </div>
        </div>
        <div className="market-card flex min-h-40 w-full flex-col items-start justify-center gap-2 p-6">
          <div>
            <FaSun className="text-3xl text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {user &&
              user.userGroupMember_id.usergroup_id.name === "Super Admin"
                ? users?.filter(
                    (item) =>
                      item.userGroupMember_id?.usergroup_id.name === "Boutiks",
                  ).length
                : commandes?.filter((item) => item.status === "Pending").length}
            </h1>
          </div>
          <div>
            <h1 className="text-sm font-medium text-gray-500">
              {user &&
              user.userGroupMember_id.usergroup_id.name === "Super Admin"
                ? "Nombres des boutiques"
                : "Commande en Attente"}
            </h1>
          </div>
        </div>
        <div className="market-card flex min-h-40 w-full flex-col items-start justify-center gap-2 p-6">
          <div>
            <FaUsers className="text-3xl text-sky-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {user &&
              user.userGroupMember_id.usergroup_id.name === "Super Admin"
                ? users?.filter(
                    (item) =>
                      item.userGroupMember_id?.usergroup_id.name === "Client",
                  ).length
                : commandes?.length}
            </h1>
          </div>
          <div>
            <h1 className="text-sm font-medium text-gray-500">
              {user &&
              user.userGroupMember_id.usergroup_id.name === "Super Admin"
                ? "Nombres des Abonné"
                : "Tous les commandes"}
            </h1>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 py-3">
        <div className="market-card min-w-0 p-4 sm:p-6">
          {user && user.userGroupMember_id.usergroup_id.name === "Boutiks" ? (
            <>
              <div className="py-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Commandes en attente
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Suivez les commandes à traiter par votre boutique.
                </p>
              </div>
              <div className="overflow-auto">
                <table className="w-full border-2">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-3 px-3 border">#</th>
                      <th className="py-3 border">Produits</th>
                      <th className="py-3 border">Prix</th>
                      <th className="py-3 border">Quantité</th>
                      <th className="py-3 border">Variantes</th>
                      <th className="py-3 border">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500">
                    {commandes
                      ?.filter((element) => element.status === "Pending")
                      .map((element, index) => (
                        <tr className="hover:bg-gray-50" key={index + 1}>
                          <td className="py-3 px-3 border text-center">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3 border text-center">
                            {element.product_id && element.product_id.name}
                          </td>
                          <td className="py-3 px-3 border text-center">
                            {element.product_id && element.product_id.price}
                          </td>
                          <td className="py-3 px-3 border text-center">
                            {element.quantity}
                          </td>
                          <td className="py-3 px-3 border text-center">
                            <ul>
                              {Object.entries(element.variants).map(
                                ([key, value]) => (
                                  <li key={key + 1}>
                                    {key} : {value}
                                  </li>
                                ),
                              )}
                            </ul>
                          </td>
                          <td className="py-3 px-3 border text-center text-yellow-500">
                            {formatStatus(element.status)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ListAbonnement />
          )}
        </div>
      </div>

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
