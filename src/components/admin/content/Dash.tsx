import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  FaArrowRight,
  FaBox,
  FaExclamationTriangle,
  FaPlus,
  FaShoppingCart,
  FaStore,
  FaUsers,
  FaUserCheck,
  FaHeadset,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import UserInfo from "../../modals/UserInfo";
import { LiaUploadSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import { useLanguage } from "../../../context/useLanguage";
import useCSRF from "../../../helper/useCSRF";
import ICommande from "../../../Interface/command.interfaces";
import Preloader from "../../loading/Preloader";
import { formatStatus } from "../../../helper/locale";
import {
  DataTable,
  PageHeader,
  StatCard,
  StatusBadge,
  type AdminDataColumn,
} from "../ui";

const formatAriary = (amount: number, language: "fr" | "en") =>
  new Intl.NumberFormat(language === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(amount);

interface SellerMarketplaceOrder {
  _id: string;
  createdAt: string;
  customer?: { name?: string };
  subOrders: Array<{ _id: string; status: string; payableTotal: number; items?: Array<{ name: string; quantity: number }> }>;
}

interface AdminActivityItem {
  _id: string;
  actorName?: string;
  action: string;
  targetLabel?: string;
  createdAt: string;
}

function Dash() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
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
  const [catalogStats, setCatalogStats] = useState<{ plan: string; name: string; quota: number; used: number; remaining: number | null; lowStock: number }>({ plan: "free", name: "Gratuit", quota: 0, used: 0, remaining: null, lowStock: 0 });
  const [commandes, setCommandes] = useState<ICommande[]>();
  const [accountStats, setAccountStats] = useState<{ active: number; sellers: number }>({ active: 0, sellers: 0 });
  const [pendingSubscriptions, setPendingSubscriptions] = useState<number>();
  const [openDisputes, setOpenDisputes] = useState<number>();
  const [pendingKyc, setPendingKyc] = useState<number>();
  const [openTickets, setOpenTickets] = useState<number>();
  const [confirmedSubscriptionVolume, setConfirmedSubscriptionVolume] = useState<number>();
  const [overdueTickets, setOverdueTickets] = useState(0);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState(0);
  const [unverifiedPayments, setUnverifiedPayments] = useState(0);
  const [sellerOrderStats, setSellerOrderStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, confirmedSalesMGA: 0 });
  const [recentMarketplaceOrders, setRecentMarketplaceOrders] = useState<SellerMarketplaceOrder[]>([]);
  const [adminActivity, setAdminActivity] = useState<AdminActivityItem[]>([]);
  const dashboardMetrics: Array<{
    label: string;
    value: string | number | undefined;
    icon: React.ReactNode;
    href?: string;
  }> = isSuperAdmin
    ? [
        {
          label: t("admin.activeAccounts"),
          value: accountStats.active,
          icon: <FaUsers />,
          href: "/espace_vendeur/shopaccounts",
        },
        {
          label: t("admin.activeSellers"),
          value: accountStats.sellers,
          icon: <FaStore />,
          href: "/espace_vendeur/shopaccounts",
        },
        {
          label: t("admin.pendingSubscriptions"),
          value: pendingSubscriptions,
          icon: <FaShoppingCart />,
          href: "/espace_vendeur/abonnements",
        },
        {
          label: t("admin.openDisputes"),
          value: openDisputes,
          icon: <FaExclamationTriangle />,
          href: "/espace_vendeur/litiges",
        },
        {
          label: t("admin.kycToReview"),
          value: pendingKyc,
          icon: <FaUserCheck />,
          href: "/espace_vendeur/verification-vendeurs",
        },
        {
          label: t("admin.openSupportTickets"),
          value: openTickets,
          icon: <FaHeadset />,
          href: "/espace_vendeur/support",
        },
      ]
    : [
        {
          label: t("admin.products"),
          value: catalogStats.used,
          icon: <FaBox />,
          href: "/espace_vendeur/products",
        },
        {
          label: t("admin.productsToRestock"),
          value: catalogStats.lowStock,
          icon: <FaExclamationTriangle />,
          href: "/espace_vendeur/products",
        },
        {
          label: t("admin.marketOrdersToProcess"),
          value: sellerOrderStats.pending,
          icon: <FaShoppingCart />,
          href: "/espace_vendeur/marketplace-orders",
        },
        {
          label: t("admin.ordersInProgress"),
          value: sellerOrderStats.inProgress,
          icon: <FaShoppingCart />,
          href: "/espace_vendeur/marketplace-orders",
        },
        {
          label: t("admin.confirmedSales"),
          value: formatAriary(sellerOrderStats.confirmedSalesMGA, language),
          icon: <FaMoneyBillWave />,
          href: "/espace_vendeur/marketplace-orders",
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
        <strong className="tabular-nums">{formatAriary(item.total, language)}</strong>
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

  const fetchCatalogStats = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}seller/entitlements`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Impossible de charger les indicateurs du catalogue.");
      setCatalogStats(result.data);
    } catch (error) {
      console.error("Seller catalogue summary could not be loaded", error);
    }
  }, []);

  const fetchCommand = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}command?page=1&limit=5&status=Pending`, {
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
  const fetchSellerMarketplace = useCallback(async () => {
    try {
      const [summaryResponse, ordersResponse] = await Promise.all([
        fetch(`${import.meta.env.REACT_API_URL}marketplace/orders/seller/summary`, { credentials: "include" }),
        fetch(`${import.meta.env.REACT_API_URL}marketplace/orders?page=1&limit=5`, { credentials: "include" }),
      ]);
      if (summaryResponse.ok) setSellerOrderStats((await summaryResponse.json()).data);
      if (ordersResponse.ok) setRecentMarketplaceOrders((await ordersResponse.json()).data ?? []);
    } catch (error) {
      console.error("Impossible de charger le résumé vendeur", error);
    }
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}users?page=1&limit=1`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) setAccountStats(result.stats ?? { active: 0, sellers: 0 });
      else
        toast.error(result.message || "Impossible de récupérer les comptes.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  const fetchSuperAdminQueues = useCallback(async () => {
    const [overviewResponse, financeResponse, activityResponse] = await Promise.all([
      fetch(`${import.meta.env.REACT_API_URL}admin/operations-overview`, { credentials: "include" }),
      fetch(`${import.meta.env.REACT_API_URL}admin/finance`, { credentials: "include" }),
      fetch(`${import.meta.env.REACT_API_URL}admin/audit?page=1&limit=6`, { credentials: "include" }),
    ]);
    if (overviewResponse.ok) {
      const { data } = await overviewResponse.json();
      setPendingSubscriptions(Number(data.pendingSubscriptions ?? 0));
      setOpenDisputes(Number(data.openDisputes ?? 0));
      setPendingKyc(Number(data.pendingKyc ?? 0));
      setOpenTickets(Number(data.openTickets ?? 0));
      setOverdueTickets(Number(data.overdueTickets ?? 0));
      setExpiringSubscriptions(Number(data.expiringSubscriptions ?? 0));
      setUnverifiedPayments(Number(data.unverifiedPayments ?? 0));
    }
    if (financeResponse.ok) { const finance = await financeResponse.json(); setConfirmedSubscriptionVolume(Number(finance.data?.subscriptionRevenueMGA ?? 0)); }
    if (activityResponse.ok) setAdminActivity((await activityResponse.json()).data ?? []);
  }, []);

  useEffect(() => {
    if (role === "Boutiks") {
      getPersonnalInfo();
      void fetchCatalogStats();
      fetchCommand();
      void fetchSellerMarketplace();
    } else if (role === "Super Admin") {
      fetchUsers();
      void fetchSuperAdminQueues();
    }
  }, [fetchCommand, fetchUsers, fetchSellerMarketplace, fetchSuperAdminQueues, getPersonnalInfo, fetchCatalogStats, role]);

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="admin-dashboard space-y-5">
      <PageHeader
        eyebrow={
          isSuperAdmin
            ? t("admin.marketplaceAdministration")
            : t("admin.shopOverview")
        }
        title={`${t("admin.greeting")} ${user?.username || ""}`}
        description={
          isSuperAdmin
            ? t("admin.dashboardSuperAdminIntro")
            : t("admin.dashboardSellerIntro")
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isSeller ? (
              <>
                <Link
                  to="/espace_vendeur/admin/addProduct"
                  className="admin-button admin-button--primary admin-button--md"
                >
                  <FaPlus aria-hidden="true" /> {t("admin.addProduct")}
                </Link>
                <Link
                  to="/espace_vendeur/commandes"
                  className="admin-button admin-button--secondary admin-button--md"
                >
                  {t("admin.viewOrders")} <FaArrowRight aria-hidden="true" />
                </Link>
              </>
            ) : isSuperAdmin ? (
              <>
                <Link
                  to="/espace_vendeur/shopaccounts"
                  className="admin-button admin-button--primary admin-button--md"
                >
                  <FaUsers aria-hidden="true" /> {t("admin.manageAccounts")}
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
            className="admin-dashboard-metrics grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {dashboardMetrics.map((metric) => (
          <Link
            key={metric.label}
            to={metric.href ?? "/espace_vendeur/dash"}
            className="admin-dashboard-metric-link"
            aria-label={`Ouvrir ${metric.label}`}
          >
            <StatCard
              label={metric.label}
              value={metric.value ?? "—"}
              icon={metric.icon}
            />
          </Link>
        ))}
      </section>

      {isSeller ? (
        <>
        <section className="admin-panel admin-dashboard-orders min-w-0">
          <div className="admin-panel-heading">
            <div><h3>Activité marketplace récente</h3><p>{sellerOrderStats.total} commande(s) au total · {sellerOrderStats.completed} terminée(s)</p></div>
            <Link to="/espace_vendeur/marketplace-orders" className="admin-panel-link">Gérer les commandes <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {recentMarketplaceOrders.length ? <div className="divide-y divide-[var(--admin-border)] px-4">{recentMarketplaceOrders.flatMap((order) => order.subOrders.map((subOrder) => <Link key={`${order._id}-${subOrder._id}`} to="/espace_vendeur/marketplace-orders" className="admin-dashboard-order-row"><span className="min-w-0"><strong className="block truncate">{subOrder.items?.[0]?.name ?? order.customer?.name ?? "Commande client"}</strong><small className="text-[var(--admin-muted)]">#{order._id.slice(-7).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString(language === "en" ? "en-GB" : "fr-FR")}</small></span><span className="flex items-center gap-3"><StatusBadge status={subOrder.status} label={formatStatus(subOrder.status)} /><strong className="whitespace-nowrap tabular-nums">{formatAriary(subOrder.payableTotal, language)}</strong></span></Link>))}</div> : <div className="p-6 text-sm text-[var(--admin-muted)]">Aucune commande marketplace récente. Les nouvelles demandes apparaîtront ici.</div>}
          <div className="mx-4 mb-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">Forfait {catalogStats.name}</span><span className="text-xs text-[var(--admin-muted)]">{catalogStats.used} produit(s){catalogStats.quota > 0 ? ` sur ${catalogStats.quota}` : " · sans limite"}</span></div>{catalogStats.quota > 0 && <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--admin-accent-solid)]" style={{ width: `${Math.min(100, catalogStats.used / catalogStats.quota * 100)}%` }} /></div>}<Link to={catalogStats.plan === "pro" ? "/espace_vendeur/abonnements" : "/espace_vendeur/upgrade-pro"} className="admin-panel-link mt-2 inline-flex">{catalogStats.plan === "pro" ? "Gérer mon abonnement" : "Découvrir le forfait Pro"} <FaArrowRight aria-hidden="true" /></Link></div>
          <div className="admin-dashboard-shortcuts"><Link to="/espace_vendeur/products"><FaBox aria-hidden="true" /> Gérer le catalogue</Link><Link to="/espace_vendeur/paiement-livraison"><FaMoneyBillWave aria-hidden="true" /> Paiement et livraison</Link><Link to="/espace_vendeur/boutiksInfo"><FaStore aria-hidden="true" /> Profil boutique</Link></div>
        </section>
        <section className="admin-dashboard-orders admin-panel min-w-0">
          <div className="admin-panel-heading">
            <div>
              <h3>Commandes classiques</h3>
              <p>Demandes issues de l’ancien parcours de commande.</p>
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
        </>
      ) : isSuperAdmin ? (
        <section className="grid gap-4 xl:grid-cols-2">
                    <article className="admin-panel p-5 xl:col-span-2"><div className="admin-panel-heading"><div><h3>Tour de contrôle des opérations</h3><p>Files prioritaires avec accès direct aux dossiers à traiter.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/marketplace-orders">Paiements à vérifier · {unverifiedPayments}</Link><Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/support">Tickets ouverts · {openTickets ?? 0} · hors délai {overdueTickets}</Link><Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/abonnements">Demandes d’abonnement · {pendingSubscriptions ?? 0}</Link><Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/abonnements">Abonnements expirant · {expiringSubscriptions}</Link><Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/litiges">Litiges · {openDisputes ?? 0}</Link><Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/verification-vendeurs">Dossiers KYC à vérifier · {pendingKyc ?? 0}</Link></div></article>
          <article className="admin-panel p-5">
            <div className="admin-panel-heading">
              <div>
                <h3>À traiter en priorité</h3>
                <p>Accédez directement aux files opérationnelles.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/abonnements">
                Demandes d’abonnement <FaArrowRight aria-hidden="true" />
              </Link>
              <Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/litiges">
                Litiges marketplace <FaArrowRight aria-hidden="true" />
              </Link>
              <Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/moderation">
                Modération <FaArrowRight aria-hidden="true" />
              </Link>
              <Link className="admin-button admin-button--secondary admin-button--md" to="/espace_vendeur/shopaccounts">
                Gestion des vendeurs <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
          </article>
                    <article className="admin-panel p-5">
            <div className="admin-panel-heading"><div><h3>Activité administrative récente</h3><p>Actions récentes consignées dans le journal sécurisé.</p></div></div>
            {adminActivity.length ? <ol className="mt-3 divide-y divide-[var(--admin-border)]">{adminActivity.map((item) => <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span><strong>{item.targetLabel || item.action}</strong><small className="ml-2 text-[var(--admin-muted)]">{item.actorName || "Équipe admin"} · {item.action}</small></span><time className="text-xs text-[var(--admin-muted)]">{new Date(item.createdAt).toLocaleString("fr-FR")}</time></li>)}</ol> : <p className="py-5 text-sm text-[var(--admin-muted)]">Aucune action administrative récente.</p>}
            <Link className="admin-panel-link mt-2 inline-flex" to="/espace_vendeur/journal-activite">Ouvrir le journal complet <FaArrowRight aria-hidden="true" /></Link>
            <div className="mt-5 border-t border-[var(--admin-border)] pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Revenus d’abonnements confirmés · cumul historique</p><p className="mt-1 text-2xl font-extrabold text-[var(--admin-text)]">{confirmedSubscriptionVolume === undefined ? "—" : formatAriary(confirmedSubscriptionVolume, language)}</p><Link className="admin-panel-link mt-2 inline-flex" to="/espace_vendeur/finances">Ouvrir le pilotage financier <FaArrowRight aria-hidden="true" /></Link></div>
          </article>
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
