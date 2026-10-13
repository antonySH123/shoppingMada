import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Iuser from "../../../Interface/UserInterface";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import { LiaAtSolid, LiaPhoneAltSolid, LiaUser } from "react-icons/lia";
import useCSRF from "../../../helper/useCSRF";
import { useAuth } from "../../../helper/useAuth";
import Preloader from "../../loading/Preloader";
import { requestAdminStepUp, requestAdminStepUpChallenge, verifyAdminStepUpCode } from "../../../helper/adminStepUp";
import { AdminButton, AdminModal, PageHeader } from "../ui";
import { useCallback as useCallbackData } from "react";

interface IState {
  user: Iuser | null;
  isActive: boolean | null;
}

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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState("");
  const [deleteStepUpCode, setDeleteStepUpCode] = useState("");
  const [deleteStep, setDeleteStep] = useState<"email" | "code">("email");
  const [isRequestingDeleteCode, setIsRequestingDeleteCode] = useState(false);
  const [seller360, setSeller360] = useState<any>(null);
  const [commission, setCommission] = useState("0");
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

  const loadSeller360 = useCallbackData(async () => {
    if (!state.user?.boutiks_id) return;
    const shopId = typeof state.user.boutiks_id === "string" ? state.user.boutiks_id : state.user.boutiks_id._id;
    try { const response = await fetch(`${import.meta.env.REACT_API_URL}admin/sellers/${shopId}/360`, { credentials: "include" }); const result = await response.json(); if (response.ok) { setSeller360(result.data); setCommission(String(result.data.shop.commissionPercent ?? 0)); } }
    catch { toast.error("Impossible de charger la fiche vendeur 360Â°."); }
  }, [state.user?.boutiks_id]);

  useEffect(() => {
    checkAccount();
    fetchData();
  }, [checkAccount, fetchData, id]);
  useEffect(() => { void loadSeller360(); }, [loadSeller360]);

  const saveCommission = async () => {
    if (!csrf || !state.user?.boutiks_id) return;
    const shopId = typeof state.user.boutiks_id === "string" ? state.user.boutiks_id : state.user.boutiks_id._id;
    try { const stepUp = await requestAdminStepUp(csrf); if (!stepUp) return; const response = await fetch(`${import.meta.env.REACT_API_URL}admin/sellers/${shopId}/commission`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp }, body: JSON.stringify({ commissionPercent: Number(commission) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); toast.success("Commission enregistrÃ©e."); void loadSeller360(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Enregistrement impossible."); }
  };

  const handleRoleChange = useCallback(async () => {
    try {
      if (csrf && id) {
        const stepUp = await requestAdminStepUp(csrf);
        if (!stepUp) return;
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}account/${id}/admin`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "xsrf-token": csrf,
              "x-admin-step-up": stepUp,
            },
          },
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Impossible dâ€™attribuer le rÃ´le Admin.");
        toast.success(result.message);
        await fetchData();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible dâ€™attribuer le rÃ´le Admin.");
    }
  }, [csrf, fetchData, id]);

  const handleAccountStatus = useCallback(async () => {
    if (!csrf || !id || state.isActive === null || isUpdatingStatus) return;
    const activate = !state.isActive;
    if (
      !activate &&
      !window.confirm(
        "DÃ©sactiver ce compte ? Lâ€™utilisateur ne pourra plus se connecter.",
      )
    )
      return;
    const reason = !activate
      ? window.prompt("Motif de dÃ©sactivation (facultatif)") ?? undefined
      : undefined;
    if (!activate && reason === undefined) return;

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
  }, [csrf, fetchData, id, isUpdatingStatus, state.isActive]);

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
      navigate("/espace_vendeur/comptes", { replace: true });
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
        description="Consultez le profil, le rÃ´le et les informations de contact de lâ€™utilisateur."
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
                "Compte dÃ©sactivÃ©"}
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
                      ? "Mise Ã  jourâ€¦"
                      : state.isActive
                        ? "DÃ©sactiver le compte"
                        : "Activer le compte"}
                  </AdminButton>
                  {state.user?.userGroupMember_id?.usergroup_id?.name !== "Admin" && <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={handleRoleChange}
                  >
                    DÃ©finir comme Admin
                  </AdminButton>}
                  {(user?.userGroupMember_id?.usergroup_id?.name === "Super Admin" || user?.adminPermissions?.includes("accounts.delete")) && <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={openDeleteDialog}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "Suppressionâ€¦" : "Supprimer dÃ©finitivement"}
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
            <label>PrÃ©noms</label>
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
            <label>TÃ©lÃ©phone</label>
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
                  ? "VÃ©rification en coursâ€¦"
                  : state.isActive
                    ? "Actif"
                    : "DÃ©sactivÃ©"
              }
              readOnly
            />
          </div>
        </div>
      </section>

      {state.user?.boutiks_id && (
        <section className="admin-panel p-5">
          <div className="admin-panel-heading -mx-5 -mt-5 mb-5">
            <div>
              <p className="admin-panel-kicker">Boutique associÃ©e</p>
              <h2 className="admin-panel-title">
                {state.user.boutiks_id.name}
              </h2>
              <p className="admin-panel-subtitle">
                CoordonnÃ©es et liens publics gÃ©rÃ©s par ce vendeur.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <p className="text-sm text-[var(--admin-muted)]">
              TÃ©lÃ©phone :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.phoneNumber || "â€”"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              E-mail :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.email || "â€”"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              Adresse :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.adresse || "â€”"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              Plan :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.plan || "â€”"}
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
        <div className="admin-panel-heading"><div><p className="admin-panel-kicker">Vue consolidÃ©e vendeur</p><h2 className="admin-panel-title">ActivitÃ© de la boutique</h2><p className="admin-panel-subtitle">Publications, conformitÃ©, activitÃ© commerciale et cycle dâ€™abonnement.</p></div><Link className="admin-button admin-button--outline admin-button--sm" to="/espace_vendeur/products">Catalogue</Link></div>
        <div className="seller-360-metrics">
          <article className="seller-360-metric"><span>Publications</span><strong>{seller360.publications?.total ?? seller360.productCount ?? 0}</strong><small>{seller360.publications?.approved ?? 0} publiÃ©es</small></article>
          <article className="seller-360-metric"><span>En modÃ©ration</span><strong>{seller360.publications?.pending ?? 0}</strong><small>Ã€ examiner</small></article>
          <article className="seller-360-metric"><span>RefusÃ©es</span><strong>{seller360.publications?.rejected ?? 0}</strong><small>Statut de publication</small></article>
          <article className="seller-360-metric"><span>Commandes rÃ©centes</span><strong>{seller360.orders.length}</strong><small>Sur les derniÃ¨res commandes</small></article>
        </div>
        <div className="seller-360-columns">
          <section className="seller-360-card">
            <div className="seller-360-section-heading"><div><h3>Forfait et abonnement</h3><p>Ã‰tat actuel et Ã©chÃ©ances connus</p></div><span className="admin-status-badge admin-status-badge--primary">{seller360.shop.subscription_id?.plan ?? seller360.shop.plan ?? "Gratuit"}</span></div>
            {seller360.shop.subscription_id ? <dl className="seller-360-facts">
              <div><dt>Statut</dt><dd>{seller360.shop.subscription_id.lifecycleStatus ?? seller360.shop.subscription_id.payementStatus ?? "â€”"}</dd></div>
              <div><dt>PÃ©riode payÃ©e jusquâ€™au</dt><dd>{seller360.shop.subscription_id.endDate ? new Date(seller360.shop.subscription_id.endDate).toLocaleDateString("fr-FR") : "â€”"}</dd></div>
              <div><dt>Renouvellement automatique</dt><dd>{seller360.shop.subscription_id.autoRenew ? "ActivÃ©" : "DÃ©sactivÃ©"}</dd></div>
              <div><dt>RÃ©siliation programmÃ©e</dt><dd>{seller360.shop.subscription_id.cancelAtPeriodEnd ? "Oui" : "Non"}</dd></div>
              {seller360.shop.subscription_id.graceUntil && <div><dt>Fin de pÃ©riode de grÃ¢ce</dt><dd>{new Date(seller360.shop.subscription_id.graceUntil).toLocaleDateString("fr-FR")}</dd></div>}
            </dl> : <p className="seller-360-empty">Aucun abonnement liÃ© Ã  cette boutique.</p>}
            {seller360.subscriptionHistory?.length > 0 && <div className="seller-360-history"><strong>Historique rÃ©cent</strong>{seller360.subscriptionHistory.map((subscription: any) => <div key={subscription._id}><span>{subscription.plan} Â· {subscription.payementStatus}</span><time>{new Date(subscription.createdAt).toLocaleDateString("fr-FR")}</time></div>)}</div>}
          </section>
          <section className="seller-360-card">
            <div className="seller-360-section-heading"><div><h3>Publications rÃ©centes</h3><p>Derniers produits ajoutÃ©s Ã  la boutique</p></div></div>
            {seller360.recentProducts?.length ? <div className="seller-360-products">{seller360.recentProducts.map((product: any) => <article key={product._id}><div className="min-w-0"><Link to={`/espace_vendeur/products/${product._id}`} className="seller-360-product-name">{product.name}</Link><small>{new Date(product.createdAt).toLocaleDateString("fr-FR")} Â· Stock {product.stock}</small></div><span className={`admin-status-badge ${product.publicationStatus === "Approved" ? "admin-status-badge--success" : product.publicationStatus === "Rejected" ? "admin-status-badge--danger" : "admin-status-badge--pending"}`}>{product.publicationStatus === "Approved" ? "PubliÃ©e" : product.publicationStatus === "Rejected" ? "RefusÃ©e" : "En attente"}</span></article>)}</div> : <p className="seller-360-empty">Aucune publication enregistrÃ©e.</p>}
          </section>
        </div>
        <div className="seller-360-footer"><div><strong>KYC</strong><span>{seller360.kyc?.verificationStatus ?? "Non soumis"}</span></div><div><strong>Commission marketplace</strong><label><input type="number" min="0" max="50" step="0.1" value={commission} onChange={(event) => setCommission(event.target.value)} aria-label="Commission marketplace en pourcentage" /><span>%</span></label><button type="button" className="admin-button admin-button--primary admin-button--sm" onClick={() => void saveCommission()}>Enregistrer le taux</button></div></div>
        <div className="seller-360-columns seller-360-activity"><section className="seller-360-card"><h3>Commandes rÃ©centes</h3>{seller360.orders.length ? seller360.orders.map((order: any) => <p key={order._id}>{new Date(order.createdAt).toLocaleDateString("fr-FR")} Â· {order.customer?.name} Â· {order.subOrders.map((line: any) => line.status).join(", ")}</p>) : <p className="seller-360-empty">Aucune commande rÃ©cente.</p>}</section><section className="seller-360-card"><h3>Actions administratives</h3>{seller360.audit.length ? seller360.audit.map((entry: any) => <p key={entry._id}>{new Date(entry.createdAt).toLocaleString("fr-FR")} Â· {entry.actorName} Â· {entry.action}</p>) : <p className="seller-360-empty">Aucune action rÃ©cente.</p>}</section></div>
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
