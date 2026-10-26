import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Iuser from "../../../Interface/UserInterface";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import { LiaAtSolid, LiaPhoneAltSolid, LiaUser } from "react-icons/lia";
import useCSRF from "../../../helper/useCSRF";
import { useAuth } from "../../../helper/useAuth";
import Preloader from "../../loading/Preloader";
import { requestAdminStepUpChallenge, verifyAdminStepUpCode, useAdminStepUp } from "../../../helper/adminStepUp";
import { useDialog } from "../../../context/useDialog";
import { AdminButton, AdminModal, PageHeader } from "../ui";

interface IState {
  user: Iuser | null;
  isActive: boolean | null;
}

type Seller360Subscription = { _id: string; plan?: string; payementStatus?: string; lifecycleStatus?: string; endDate?: string; autoRenew?: boolean; cancelAtPeriodEnd?: boolean; graceUntil?: string; createdAt: string };
type Seller360Product = { _id: string; name: string; stock: number; publicationStatus?: string; createdAt: string };
type Seller360Order = { _id: string; createdAt: string; customer?: { name?: string }; subOrders: Array<{ status: string }> };
type Seller360Data = {
  productCount?: number;
  publications?: { total?: number; approved?: number; pending?: number; rejected?: number };
  shop: { plan?: string; commissionPercent?: number; subscription_id?: (Seller360Subscription & { refundedMGA?: number; priceMGA?: number; startDate?: string; canceledAt?: string; paymentCompletedAt?: string }) | null };
  kyc?: { verificationStatus?: string };
  subscriptionHistory: Seller360Subscription[];
  recentProducts: Seller360Product[];
  orders: Seller360Order[];
  audit: Array<{ _id: string; createdAt: string; actorName?: string; action: string }>;
  role?: string;
};

const adminPermissionOptions = [
  ["support.read", "Consulter les tickets support"],
  ["support.reply", "RÃ©pondre aux tickets"],
  ["support.manage", "GÃ©rer les tickets"],
  ["moderation.review", "ModÃ©rer les contenus"],
  ["finance.read", "Consulter les finances"],
  ["finance.refund", "Enregistrer les remboursements"],
  ["finance.payout", "Consigner les reversements"],
  ["accounts.delete", "Supprimer dÃ©finitivement des comptes"],
] as const;

type Action =
  | { type: "FETCH_START"; payload: Iuser }
  | { type: "CHECK_ACCOUNT"; payload: boolean };

const initialState: IState = {
  user: null,
  isActive: null,
};

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, user: action.payload };
    case "CHECK_ACCOUNT":
      return { ...state, isActive: action.payload };
    default:
      throw new Error();
  }
};

function AccountsDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const csrf = useCSRF();
  const adminStepUp = useAdminStepUp();
  const dialog = useDialog();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState("");
  const [deleteStepUpCode, setDeleteStepUpCode] = useState("");
  const [deleteStep, setDeleteStep] = useState<"email" | "code">("email");
  const [isRequestingDeleteCode, setIsRequestingDeleteCode] = useState(false);
  const [seller360, setSeller360] = useState<Seller360Data | null>(null);
  const [commission, setCommission] = useState("0");
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [savingAdminPermissions, setSavingAdminPermissions] = useState(false);
  const navigate = useNavigate();

  const checkAccount = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}account/status/${id}`,
        {
          credentials: "include",
        },
      );

      if (response.status === 400) {
        dispatch({ type: "CHECK_ACCOUNT", payload: false });
      }

      if (response.status === 200) {
        dispatch({ type: "CHECK_ACCOUNT", payload: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [id]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}user/${id}`,
        {
          credentials: "include",
        },
      );
      const result = await response.json();
      if ((result.status as string).toLocaleLowerCase() === "success") {
        dispatch({ type: "FETCH_START", payload: result.data });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [id]);

  const loadSeller360 = useCallback(async () => {
    if (!state.user?.boutiks_id) return;
    const shopId = typeof state.user.boutiks_id === "string" ? state.user.boutiks_id : state.user.boutiks_id._id;
    try { const response = await fetch(`${import.meta.env.REACT_API_URL}admin/sellers/${shopId}/360`, { credentials: "include" }); const result = await response.json(); if (response.ok) { setSeller360(result.data); setCommission(String(result.data.shop.commissionPercent ?? 0)); } }
    catch { toast.error("Impossible de charger la fiche vendeur 360Ã‚Â°."); }
  }, [state.user?.boutiks_id]);

  useEffect(() => {
    checkAccount();
    fetchData();
  }, [checkAccount, fetchData, id]);
  useEffect(() => { void loadSeller360(); }, [loadSeller360]);
  useEffect(() => {
    setAdminPermissions(state.user?.userGroupMember_id?.adminPermissions ?? []);
  }, [state.user]);

  const saveAdminPermissions = async () => {
    if (!csrf || !id || savingAdminPermissions) return;
    setSavingAdminPermissions(true);
    try {
      const stepUp = await adminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/staff/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp },
        body: JSON.stringify({ permissions: adminPermissions }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Impossible dâ€™enregistrer les accÃ¨s.");
      toast.success("AccÃ¨s administrateur enregistrÃ©s.");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible dâ€™enregistrer les accÃ¨s.");
    } finally {
      setSavingAdminPermissions(false);
    }
  };

  const saveCommission = async () => {
    if (!csrf || !state.user?.boutiks_id) return;
    const shopId = typeof state.user.boutiks_id === "string" ? state.user.boutiks_id : state.user.boutiks_id._id;
    try { const stepUp = await adminStepUp(csrf); if (!stepUp) return; const response = await fetch(`${import.meta.env.REACT_API_URL}admin/sellers/${shopId}/commission`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp }, body: JSON.stringify({ commissionPercent: Number(commission) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); toast.success("Commission enregistrÃƒÂ©e."); void loadSeller360(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Enregistrement impossible."); }
  };

  const handleRoleChange = useCallback(async () => {
    try {
      if (csrf && id) {
        const stepUp = await adminStepUp(csrf);
        if (!stepUp) return;
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}account/${id}/admin`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
              "x-admin-step-up": stepUp,
            },
            body: JSON.stringify({ permissions: adminPermissions }),
          },
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Impossible dÃ¢â‚¬â„¢attribuer le rÃƒÂ´le Admin.");
        toast.success(result.message);
        await fetchData();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible dÃ¢â‚¬â„¢attribuer le rÃƒÂ´le Admin.");
    }
  }, [adminPermissions, adminStepUp, csrf, fetchData, id]);

  const handleAccountStatus = useCallback(async () => {
    if (!csrf || !id || state.isActive === null || isUpdatingStatus) return;
    const activate = !state.isActive;
    if (!activate) {
      const confirmed = await dialog.confirm(
        "La connexion sera bloquée pour ce compte.",
        { title: "Désactiver ce compte", confirmLabel: "Désactiver", destructive: true },
      );
      if (!confirmed) return;
    }
    const reason = !activate
      ? await dialog.prompt("Vous pouvez ajouter un motif pour le journal administratif.", {
          title: "Motif de désactivation",
          input: { label: "Motif facultatif", required: false, maxLength: 500 },
          confirmLabel: "Continuer",
        })
      : undefined;
    if (!activate && reason === null) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}account/${id}/${activate ? "active" : "block"}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          credentials: "include",
          body: JSON.stringify({ ...(reason ? { reason } : {}) }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de modifier le statut du compte.",
        );
      dispatch({ type: "CHECK_ACCOUNT", payload: activate });
      toast.success(result.message);
      if (activate) void fetchData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut du compte.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [csrf, dialog, fetchData, id, isUpdatingStatus, state.isActive]);

  const openDeleteDialog = () => {
    setDeleteConfirmationEmail("");
    setDeleteStepUpCode("");
    setDeleteStep("email");
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = useCallback(() => {
    if (isDeletingAccount || isRequestingDeleteCode) return;
    setIsDeleteDialogOpen(false);
  }, [isDeletingAccount, isRequestingDeleteCode]);

  const handleSendDeleteCode = async () => {
    if (!csrf || !state.user || deleteConfirmationEmail.trim() !== state.user.email) {
      toast.error("L'adresse e-mail saisie ne correspond pas au compte.");
      return;
    }
    setIsRequestingDeleteCode(true);
    try {
      await requestAdminStepUpChallenge(csrf);
      setDeleteStepUpCode("");
      setDeleteStep("code");
      toast.success("Le code de confirmation a ete envoye par e-mail.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'envoyer le code de confirmation.");
    } finally {
      setIsRequestingDeleteCode(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!csrf || !id || !state.user || isDeletingAccount) return;
    if (deleteConfirmationEmail.trim() !== state.user.email) {
      toast.error("L'adresse e-mail saisie ne correspond pas au compte.");
      setDeleteStep("email");
      return;
    }
    if (!/^\d{6}$/.test(deleteStepUpCode.trim())) {
      toast.error("Saisissez le code de confirmation a 6 chiffres.");
      return;
    }
    setIsDeletingAccount(true);
    try {
      const stepUp = await verifyAdminStepUpCode(csrf, deleteStepUpCode);
      const response = await fetch(`${import.meta.env.REACT_API_URL}account/${id}/permanent`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp },
        body: JSON.stringify({ confirmation: state.user.email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "La suppression definitive a echoue.");
      toast.success(result.message);
      navigate("/espace_vendeur/shopaccounts", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La suppression definitive a echoue.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (user?.userGroupMember_id.usergroup_id.name !== "Super Admin") {
    return <Navigate to="/espace_vendeur/dash" />;
  }

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comptes"
        title="Informations du compte"
        description="Consultez le profil, le rÃƒÂ´le et les informations de contact de lÃ¢â‚¬â„¢utilisateur."
      />

      <section className="admin-panel p-5">
        <div className="flex flex-col gap-4 border-b border-[var(--admin-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--admin-surface-raised)] text-2xl text-[var(--admin-accent-solid)]">
              <LiaUser />
            </div>
            <div>
              <strong className="flex items-center gap-2 text-lg text-[var(--admin-text)]">
                {state.user?.username}
              </strong>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <LiaAtSolid /> {state.user?.email}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <LiaPhoneAltSolid /> {state.user?.phonenumber}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <strong className="text-sm uppercase tracking-[0.08em] text-[var(--admin-muted)]">
              {state.user?.userGroupMember_id?.usergroup_id?.name ??
                "Compte dÃƒÂ©sactivÃƒÂ©"}
            </strong>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {state.user?.userGroupMember_id?.usergroup_id?.name !== "Super Admin" && (
                <>
                  <AdminButton
                    variant={state.isActive ? "danger" : "primary"}
                    size="sm"
                    onClick={() => void handleAccountStatus()}
                    disabled={isUpdatingStatus || state.isActive === null}
                  >
                    {isUpdatingStatus
                      ? "Mise ÃƒÂ  jourÃ¢â‚¬Â¦"
                      : state.isActive
                        ? "DÃƒÂ©sactiver le compte"
                        : "Activer le compte"}
                  </AdminButton>
                  {state.user?.userGroupMember_id?.usergroup_id?.name !== "Admin" && <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById("admin-access-panel")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  >
                    DÃƒÂ©finir comme Admin
                  </AdminButton>}
                  {(user?.userGroupMember_id?.usergroup_id?.name === "Super Admin" || user?.adminPermissions?.includes("accounts.delete")) && <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={openDeleteDialog}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "SuppressionÃ¢â‚¬Â¦" : "Supprimer dÃƒÂ©finitivement"}
                  </AdminButton>}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="admin-field">
            <label>Nom</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.firstName ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field">
            <label>PrÃƒÂ©noms</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.lastName ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field md:col-span-2">
            <label>Adresse</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.adresse ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field">
            <label>TÃƒÂ©lÃƒÂ©phone</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.phoneNumber ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field">
            <label>Statut du compte</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={
                state.isActive === null
                  ? "VÃƒÂ©rification en coursÃ¢â‚¬Â¦"
                  : state.isActive
                    ? "Actif"
                    : "DÃƒÂ©sactivÃƒÂ©"
              }
              readOnly
            />
          </div>
        </div>
      </section>

      {user?.userGroupMember_id?.usergroup_id?.name === "Super Admin" && state.user?.userGroupMember_id?.usergroup_id?.name !== "Super Admin" && (
        <section id="admin-access-panel" className="admin-panel p-5">
          <div className="admin-panel-heading -mx-5 -mt-5 mb-4">
            <div>
              <p className="admin-panel-kicker">Gestion des comptes</p>
              <h2 className="admin-panel-title">AccÃ¨s administrateur</h2>
              <p className="admin-panel-subtitle">Attribuez uniquement les permissions nÃ©cessaires Ã  ce compte. Le rÃ´le Admin sans permission ne donne pas accÃ¨s aux modules protÃ©gÃ©s.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {adminPermissionOptions.map(([permission, label]) => (
              <label key={permission} className="flex items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-3 text-sm">
                <input type="checkbox" checked={adminPermissions.includes(permission)} onChange={(event) => setAdminPermissions((current) => event.target.checked ? [...current, permission] : current.filter((item) => item !== permission))} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            {state.user?.userGroupMember_id?.usergroup_id?.name === "Admin" ? (
              <AdminButton variant="primary" size="md" onClick={() => void saveAdminPermissions()} disabled={savingAdminPermissions}>
                {savingAdminPermissions ? "Enregistrementâ€¦" : "Enregistrer les accÃ¨s"}
              </AdminButton>
            ) : (
              <AdminButton variant="primary" size="md" onClick={() => void handleRoleChange()}>
                DÃ©finir comme Admin avec ces accÃ¨s
              </AdminButton>
            )}
          </div>
        </section>
      )}

      {state.user?.boutiks_id && (
        <section className="admin-panel p-5">
          <div className="admin-panel-heading -mx-5 -mt-5 mb-5">
            <div>
              <p className="admin-panel-kicker">Boutique associÃƒÂ©e</p>
              <h2 className="admin-panel-title">
                {state.user.boutiks_id.name}
              </h2>
              <p className="admin-panel-subtitle">
                CoordonnÃƒÂ©es et liens publics gÃƒÂ©rÃƒÂ©s par ce vendeur.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <p className="text-sm text-[var(--admin-muted)]">
              TÃƒÂ©lÃƒÂ©phone :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.phoneNumber || "Ã¢â‚¬â€"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              E-mail :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.email || "Ã¢â‚¬â€"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              Adresse :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.adresse || "Ã¢â‚¬â€"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              Plan :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.plan || "Ã¢â‚¬â€"}
              </strong>
            </p>
            {[
              ["Site web", state.user.boutiks_id.websiteUrl],
              ["Facebook", state.user.boutiks_id.facebookUrl],
              ["Instagram", state.user.boutiks_id.instagramUrl],
              ["TikTok", state.user.boutiks_id.tiktokUrl],
              ["YouTube", state.user.boutiks_id.youtubeUrl],
            ]
              .filter(([, url]) => url)
              .map(([label, url]) => (
                <p key={label} className="text-sm text-[var(--admin-muted)]">
                  {label} :{" "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-[var(--admin-accent-solid)] hover:underline"
                  >
                    {url}
                  </a>
                </p>
              ))}
            {state.user.boutiks_id.description && (
              <p className="text-sm leading-6 text-[var(--admin-muted)] sm:col-span-2">
                {state.user.boutiks_id.description}
              </p>
            )}
          </div>
        </section>
      )}
      {seller360 && <section className="admin-panel seller-360-overview p-5">
        <div className="admin-panel-heading"><div><p className="admin-panel-kicker">Vue consolidÃƒÂ©e vendeur</p><h2 className="admin-panel-title">ActivitÃƒÂ© de la boutique</h2><p className="admin-panel-subtitle">Publications, conformitÃƒÂ©, activitÃƒÂ© commerciale et cycle dÃ¢â‚¬â„¢abonnement.</p></div><Link className="admin-button admin-button--outline admin-button--sm" to="/espace_vendeur/products">Catalogue</Link></div>
        <div className="seller-360-metrics">
          <article className="seller-360-metric"><span>Publications</span><strong>{seller360.publications?.total ?? seller360.productCount ?? 0}</strong><small>{seller360.publications?.approved ?? 0} publiÃƒÂ©es</small></article>
          <article className="seller-360-metric"><span>En modÃƒÂ©ration</span><strong>{seller360.publications?.pending ?? 0}</strong><small>Ãƒâ‚¬ examiner</small></article>
          <article className="seller-360-metric"><span>RefusÃƒÂ©es</span><strong>{seller360.publications?.rejected ?? 0}</strong><small>Statut de publication</small></article>
          <article className="seller-360-metric"><span>Commandes rÃƒÂ©centes</span><strong>{seller360.orders.length}</strong><small>Sur les derniÃƒÂ¨res commandes</small></article>
        </div>
        <div className="seller-360-columns">
          <section className="seller-360-card">
            <div className="seller-360-section-heading"><div><h3>Forfait et abonnement</h3><p>Ãƒâ€°tat actuel et ÃƒÂ©chÃƒÂ©ances connus</p></div><span className="admin-status-badge admin-status-badge--primary">{seller360.shop.subscription_id?.plan ?? seller360.shop.plan ?? "Gratuit"}</span></div>
            {seller360.shop.subscription_id ? <dl className="seller-360-facts">
              <div><dt>Statut</dt><dd>{seller360.shop.subscription_id.lifecycleStatus ?? seller360.shop.subscription_id.payementStatus ?? "Ã¢â‚¬â€"}</dd></div>
              <div><dt>PÃƒÂ©riode payÃƒÂ©e jusquÃ¢â‚¬â„¢au</dt><dd>{seller360.shop.subscription_id.endDate ? new Date(seller360.shop.subscription_id.endDate).toLocaleDateString("fr-FR") : "Ã¢â‚¬â€"}</dd></div>
              <div><dt>Renouvellement automatique</dt><dd>{seller360.shop.subscription_id.autoRenew ? "ActivÃƒÂ©" : "DÃƒÂ©sactivÃƒÂ©"}</dd></div>
              <div><dt>RÃƒÂ©siliation programmÃƒÂ©e</dt><dd>{seller360.shop.subscription_id.cancelAtPeriodEnd ? "Oui" : "Non"}</dd></div>
              {seller360.shop.subscription_id.graceUntil && <div><dt>Fin de pÃƒÂ©riode de grÃƒÂ¢ce</dt><dd>{new Date(seller360.shop.subscription_id.graceUntil).toLocaleDateString("fr-FR")}</dd></div>}
            </dl> : <p className="seller-360-empty">Aucun abonnement liÃƒÂ© ÃƒÂ  cette boutique.</p>}
            {seller360.subscriptionHistory?.length > 0 && <div className="seller-360-history"><strong>Historique rÃƒÂ©cent</strong>{seller360.subscriptionHistory.map((subscription) => <div key={subscription._id}><span>{subscription.plan} Ã‚Â· {subscription.payementStatus}</span><time>{new Date(subscription.createdAt).toLocaleDateString("fr-FR")}</time></div>)}</div>}
          </section>
          <section className="seller-360-card">
            <div className="seller-360-section-heading"><div><h3>Publications rÃƒÂ©centes</h3><p>Derniers produits ajoutÃƒÂ©s ÃƒÂ  la boutique</p></div></div>
            {seller360.recentProducts?.length ? <div className="seller-360-products">{seller360.recentProducts.map((product) => <article key={product._id}><div className="min-w-0"><Link to={`/espace_vendeur/products/${product._id}`} className="seller-360-product-name">{product.name}</Link><small>{new Date(product.createdAt).toLocaleDateString("fr-FR")} Ã‚Â· Stock {product.stock}</small></div><span className={`admin-status-badge ${product.publicationStatus === "Approved" ? "admin-status-badge--success" : product.publicationStatus === "Rejected" ? "admin-status-badge--danger" : "admin-status-badge--pending"}`}>{product.publicationStatus === "Approved" ? "PubliÃƒÂ©e" : product.publicationStatus === "Rejected" ? "RefusÃƒÂ©e" : "En attente"}</span></article>)}</div> : <p className="seller-360-empty">Aucune publication enregistrÃƒÂ©e.</p>}
          </section>
        </div>
        <div className="seller-360-footer"><div><strong>KYC</strong><span>{seller360.kyc?.verificationStatus ?? "Non soumis"}</span></div><div><strong>Commission marketplace</strong><label><input type="number" min="0" max="50" step="0.1" value={commission} onChange={(event) => setCommission(event.target.value)} aria-label="Commission marketplace en pourcentage" /><span>%</span></label><button type="button" className="admin-button admin-button--primary admin-button--sm" onClick={() => void saveCommission()}>Enregistrer le taux</button></div></div>
        <div className="seller-360-columns seller-360-activity"><section className="seller-360-card"><h3>Commandes rÃƒÂ©centes</h3>{seller360.orders.length ? seller360.orders.map((order) => <p key={order._id}>{new Date(order.createdAt).toLocaleDateString("fr-FR")} Ã‚Â· {order.customer?.name} Ã‚Â· {order.subOrders.map((line) => line.status).join(", ")}</p>) : <p className="seller-360-empty">Aucune commande rÃƒÂ©cente.</p>}</section><section className="seller-360-card"><h3>Actions administratives</h3>{seller360.audit.length ? seller360.audit.map((entry) => <p key={entry._id}>{new Date(entry.createdAt).toLocaleString("fr-FR")} Ã‚Â· {entry.actorName} Ã‚Â· {entry.action}</p>) : <p className="seller-360-empty">Aucune action rÃƒÂ©cente.</p>}</section></div>
      </section>}
      <AdminModal
        open={isDeleteDialogOpen}
        title="Confirmer la suppression du compte"
        onClose={closeDeleteDialog}
        size="sm"
        footer={
          <>
            <AdminButton variant="secondary" size="sm" onClick={closeDeleteDialog} disabled={isDeletingAccount || isRequestingDeleteCode}>
              Annuler
            </AdminButton>
            {deleteStep === "email" ? (
              <AdminButton variant="danger" size="sm" onClick={() => void handleSendDeleteCode()} disabled={deleteConfirmationEmail.trim() !== state.user?.email || isRequestingDeleteCode}>
                {isRequestingDeleteCode ? "Envoi du code..." : "Continuer"}
              </AdminButton>
            ) : (
              <AdminButton variant="danger" size="sm" onClick={() => void handlePermanentDelete()} disabled={!/^\d{6}$/.test(deleteStepUpCode.trim()) || isDeletingAccount}>
                {isDeletingAccount ? "Suppression..." : "Confirmer la suppression"}
              </AdminButton>
            )}
          </>
        }
      >
        {state.user && <div className="space-y-4">
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-[var(--admin-text)]">
            <strong className="block text-rose-500">Action irreversible</strong>
            <p className="mt-1">Les donnees du compte seront supprimees et les commandes conservees seront anonymisees.</p>
          </div>
          <div className="rounded-xl border border-[var(--admin-border)] p-3 text-sm">
            <span className="text-[var(--admin-muted)]">Compte concerne</span>
            <strong className="mt-1 block break-all text-[var(--admin-text)]">{state.user.email}</strong>
          </div>
          {deleteStep === "email" ? (
            <label className="admin-field">
              <span>Retapez l'adresse e-mail exacte pour continuer</span>
              <input className="admin-field__control" type="email" autoComplete="off" value={deleteConfirmationEmail} onChange={(event) => setDeleteConfirmationEmail(event.target.value)} />
            </label>
          ) : (
            <div className="space-y-3">
              <label className="admin-field">
                <span>Code de securite envoye a votre e-mail</span>
                <input className="admin-field__control" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={deleteStepUpCode} onChange={(event) => setDeleteStepUpCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
              </label>
              <button type="button" className="text-sm font-semibold text-[var(--admin-accent-solid)] hover:underline" onClick={() => void handleSendDeleteCode()} disabled={isRequestingDeleteCode || isDeletingAccount}>
                {isRequestingDeleteCode ? "Envoi du code..." : "Renvoyer le code"}
              </button>
            </div>
          )}
        </div>}
      </AdminModal>
    </div>
  );
}

export default AccountsDetails;
