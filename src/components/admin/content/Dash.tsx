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
import {
  DataTable,
  PageHeader,
  StatCard,
  StatusBadge,
  type AdminDataColumn,
} from "../ui";

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
  const [isSavingCin, setIsSavingCin] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [cin, setCIN] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputFile = useRef<HTMLInputElement | null>(null);
  const csrf = useCSRF();
  const [products, setProduct] = useState<IProduct[]>();
  const [commandes, setCommandes] = useState<ICommande[]>();
  const [users, setUsers] = useState<Iuser[]>();
  const dashboardMetrics = isSuperAdmin
    ? [
        {
          label: "Comptes",
          value: users?.length,
          icon: <FaUsers />,
        },
        {
          label: "Boutiques",
          value: users?.filter(
            (item) => item.userGroupMember_id?.usergroup_id.name === "Boutiks",
          ).length,
          icon: <FaStore />,
        },
        {
          label: "Clients",
          value: users?.filter(
            (item) => item.userGroupMember_id?.usergroup_id.name === "Client",
          ).length,
          icon: <FaUsers />,
        },
      ]
    : [
        {
          label: "Produits",
          value: products?.length,
          icon: <FaBox />,
        },
        {
          label: "Commandes à traiter",
          value: commandes?.filter((item) => item.status === "Pending").length,
          icon: <FaShoppingCart />,
        },
        {
          label: "Commandes reçues",
          value: commandes?.length,
          icon: <FaShoppingCart />,
        },
        {
          label: "Produits à réapprovisionner",
          value: products?.filter(
            (item) => typeof item.stock === "number" && item.stock <= 5,
          ).length,
          icon: <FaExclamationTriangle />,
        },
      ];

  const pendingCommands =
    commandes?.filter((item) => item.status === "Pending") ?? [];
  const orderColumns: AdminDataColumn<ICommande>[] = [
    {
      id: "reference",
      header: "Référence",
      render: (item) => (
        <span className="font-mono text-xs">
          #{item._id.slice(-7).toUpperCase()}
        </span>
      ),
      sortValue: (item) => item._id,
    },
    {
      id: "client",
      header: "Client",
      render: (item) =>
        item.owner_id?.username || item.owner_id?.email || "Client",
      sortValue: (item) =>
        item.owner_id?.username || item.owner_id?.email || "Client",
    },
    {
      id: "product",
      header: "Produit",
      render: (item) => (
        <strong>{item.product_id?.name || "Produit supprimé"}</strong>
      ),
      sortValue: (item) => item.product_id?.name || "Produit supprimé",
    },
    {
      id: "quantity",
      header: "Qté",
      render: (item) => item.quantity,
      sortValue: (item) => item.quantity,
    },
    {
      id: "total",
      header: "Total",
      render: (item) => (
        <strong className="tabular-nums">{formatAriary(item.total)}</strong>
      ),
      sortValue: (item) => item.total,
    },
    {
      id: "status",
      header: "Statut",
      render: (item) => (
        <StatusBadge status={item.status} label={formatStatus(item.status)} />
      ),
      sortValue: (item) => item.status,
    },
    {
      id: "action",
      header: "Action",
      render: (item) => (
        <Link
          className="admin-button admin-button--ghost admin-button--sm"
          to={`/espace_vendeur/commande/${item._id}`}
        >
          Ouvrir
        </Link>
      ),
    },
  ];
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!csrf || isSavingCin) return;
    if (!cin.trim() || files.length !== 2) {
      toast.warning(
        "Saisissez le numéro CIN et ajoutez les photos du recto et du verso.",
      );
      return;
    }
    const formData = new FormData();
    formData.append("cin", cin);
    files.forEach((image) => {
      formData.append("image", image);
    });
    setIsSavingCin(true);
    try {
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
      const result = await response.json();
      if (!response.ok || result.status !== "Success") {
        throw new Error(
          result.message ||
            "Impossible d’enregistrer la vérification du compte.",
        );
      }
      toast.success(result.message || "Informations enregistrées.");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer la vérification du compte.",
      );
    } finally {
      setIsSavingCin(false);
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
    <div className="admin-dashboard space-y-5">
      <PageHeader
        eyebrow={
          isSuperAdmin
            ? "Administration de la marketplace"
            : "Pilotage de la boutique"
        }
        title={`Bonjour ${user?.username || ""}`}
        description={
          isSuperAdmin
            ? "Suivez les comptes et les demandes de la plateforme."
            : "Suivez votre activité et traitez les commandes en attente."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isSeller ? (
              <>
                <Link
                  to="/espace_vendeur/admin/addProduct"
                  className="admin-button admin-button--primary admin-button--md"
                >
                  <FaPlus aria-hidden="true" /> Ajouter un produit
                </Link>
                <Link
                  to="/espace_vendeur/commandes"
                  className="admin-button admin-button--secondary admin-button--md"
                >
                  Voir les commandes <FaArrowRight aria-hidden="true" />
                </Link>
              </>
            ) : isSuperAdmin ? (
              <>
                <Link
                  to="/espace_vendeur/shopaccounts"
                  className="admin-button admin-button--primary admin-button--md"
                >
                  <FaUsers aria-hidden="true" /> Gérer les comptes
                </Link>
                <Link
                  to="/espace_vendeur/abonnements"
                  className="admin-button admin-button--secondary admin-button--md"
                >
                  Demandes d’abonnement <FaArrowRight aria-hidden="true" />
                </Link>
              </>
            ) : null}
          </div>
        }
      />

      <section
        aria-label="Indicateurs de l’activité"
        className="admin-dashboard-metrics grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardMetrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value ?? "—"}
            icon={metric.icon}
          />
        ))}
      </section>

      {isSeller ? (
        <section className="admin-dashboard-orders admin-panel min-w-0">
          <div className="admin-panel-heading">
            <div>
              <h3>Commandes à traiter</h3>
              <p>Les commandes clients en attente de confirmation.</p>
            </div>
            <Link to="/espace_vendeur/commandes" className="admin-panel-link">
              Toutes les commandes <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            <DataTable
              columns={orderColumns}
              rows={pendingCommands}
              getRowKey={(item) => item._id}
              emptyTitle="Aucune commande en attente"
              emptyDescription="Les prochaines demandes client apparaîtront dans ce tableau."
            />
          </div>
        </section>
      ) : isSuperAdmin ? (
        <ListAbonnement />
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
                  disabled={isSavingCin || files.length >= 2}
                  className="cin-info-upload-button"
                  aria-label="Choisir une image de votre CIN"
                  onClick={() => {
                    inputFile?.current?.click();
                  }}
                >
                  <LiaUploadSolid size={22} />
                  <span>Ajouter une photo</span>
                  <small>
                    Recto et verso · JPG, PNG ou WebP · 5 Mo max. par image
                  </small>
                </button>
                <input
                  ref={inputFile}
                  hidden
                  type="file"
                  name="image"
                  id="cin-images"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const selectedFiles = Array.from(
                      e.target.files || [],
                    ).slice(0, 2 - files.length);
                    const oversized = selectedFiles.some(
                      (file) => file.size > 5 * 1024 * 1024,
                    );
                    if (oversized) {
                      toast.error("Chaque image doit faire 5 Mo maximum.");
                      e.currentTarget.value = "";
                      return;
                    }
                    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
                    e.currentTarget.value = "";
                  }}
                  disabled={isSavingCin}
                  multiple
                />
              </div>
            </div>

            <div className="cin-info-actions">
              <button
                type="submit"
                disabled={isSavingCin}
                className="market-button-primary disabled:opacity-60"
              >
                {isSavingCin
                  ? "Enregistrement…"
                  : "Enregistrer mes informations"}
              </button>
            </div>
          </form>
        </div>
      </UserInfo>
    </div>
  );
}

export default Dash;
