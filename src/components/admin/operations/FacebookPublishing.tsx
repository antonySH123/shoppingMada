import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { requestAdminStepUp } from "../../../helper/adminStepUp";
import { productImageUrl } from "../../../helper/productImageUrl";
import { PageHeader } from "../ui";

type FacebookPage = { pageId: string; pageName: string; connectedAt: string };
type FacebookCandidate = { pageId: string; pageName: string; tasks: string[] };
type Publication = { status: "published" | "failed" | "publishing"; permalink?: string; errorMessage?: string };
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  photos: string[];
  boutiks_id?: { name: string; isActive: boolean };
  publication?: Publication | null;
};
type ApiResult<T> = { status?: string; message?: string; data?: T; [key: string]: any };

const api = `${import.meta.env.REACT_API_URL}admin/facebook`;

async function readApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `La requête a échoué (HTTP ${response.status}).`);
  return result;
}

function getPublicationLabel(publication?: Publication | null) {
  if (publication?.status === "published") return "Publié";
  if (publication?.status === "failed") return "Échec · nouvelle tentative possible";
  if (publication?.status === "publishing") return "Publication en cours / statut à vérifier";
  return "Prêt à publier";
}

export default function FacebookPublishing() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin";

  const [page, setPage] = useState<FacebookPage | null>(null);
  const [configured, setConfigured] = useState(false);
  const [publishedCount, setPublishedCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<FacebookCandidate[]>([]);
  const [flow, setFlow] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [statusResponse, productsResponse] = await Promise.all([
        fetch(`${api}/status`, { credentials: "include" }),
        fetch(`${api}/products?page=${pageNumber}&limit=12&q=${encodeURIComponent(search)}`, { credentials: "include" }),
      ]);
      const [statusResult, productsResult] = await Promise.all([
        readApiResponse<{ page?: FacebookPage; configured?: boolean; publishedCount?: number }>(statusResponse),
        readApiResponse<Product[]>(productsResponse),
      ]);
      setPage(statusResult.page || null);
      setConfigured(Boolean(statusResult.configured));
      setPublishedCount(statusResult.publishedCount || 0);
      setProducts(productsResult.data || []);
      setPages(Math.max(1, productsResult.pagination?.pages || 1));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chargement impossible.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, search]);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageNumber(1);
      setSearch(query.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const flowId = params.get("meta_flow");
    const errorCode = params.get("meta_error");

    if (errorCode) {
      const errors: Record<string, string> = {
        oauth_invalid: "Retour OAuth Meta invalide.",
        oauth_expired: "La connexion Meta a expiré.",
        oauth_denied: "Autorisation Meta refusée.",
        no_managed_pages: "Aucune Page Meta publiable n’a été trouvée pour ce compte.",
        oauth_failed: "La connexion Meta a échoué. Vérifiez la configuration backend.",
      };
      toast.error(errors[errorCode] || "La connexion Meta a échoué.");
      params.delete("meta_error");
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }

    if (!flowId || !csrf) return;
    setFlow(flowId);
    params.delete("meta_flow");
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    void fetch(`${api}/connect/flow/${encodeURIComponent(flowId)}`, { credentials: "include" })
      .then(readApiResponse<FacebookCandidate[]>)
      .then((result) => setCandidates(result.data || []))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Pages Meta indisponibles."));
  }, [location.pathname, location.search, navigate, csrf]);

  const connect = async () => {
    setBusy("connect");
    try {
      const response = await fetch(`${api}/connect/start`, { credentials: "include" });
      const result = await readApiResponse<{ url: string }>(response);
      window.location.assign(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Connexion impossible.");
      setBusy("");
    }
  };

  const selectPage = async (pageId: string) => {
    if (!csrf || !flow) return;
    setBusy(pageId);
    try {
      const stepUp = await requestAdminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${api}/connect/flow/${encodeURIComponent(flow)}/select`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp },
        body: JSON.stringify({ pageId }),
      });
      const result = await readApiResponse(response);
      setCandidates([]);
      setFlow("");
      toast.success(result.message || "Page connectée.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sélection impossible.");
    } finally {
      setBusy("");
    }
  };

  const disconnect = async () => {
    if (!csrf || !window.confirm("Déconnecter la Page Facebook ? Les publications déjà en ligne ne seront pas supprimées.")) return;
    setBusy("disconnect");
    try {
      const stepUp = await requestAdminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${api}/connect`, {
        method: "DELETE",
        credentials: "include",
        headers: { "xsrf-token": csrf, "x-admin-step-up": stepUp },
      });
      const result = await readApiResponse(response);
      toast.success(result.message || "Page déconnectée.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Déconnexion impossible.");
    } finally {
      setBusy("");
    }
  };

  const publish = async (product: Product) => {
    if (!csrf) {
      toast.error("Session de sécurité indisponible. Actualisez la page puis réessayez.");
      return;
    }
    setBusy(product._id);
    try {
      const stepUp = await requestAdminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${api}/products/${product._id}/publish`, {
        method: "POST",
        credentials: "include",
        headers: { "xsrf-token": csrf, "x-admin-step-up": stepUp },
      });
      const result = await readApiResponse(response);
      toast.success(result.message || "Produit publié sur Facebook.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publication impossible.");
      await load();
    } finally {
      setBusy("");
    }
  };

  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Canal social · Meta Graph API"
        title="Publication Facebook"
        description="Publiez manuellement sur la Page ShopInMada les produits approuvés par la modération."
      />

      <section className="admin-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Connexion Page</p>
          <h2 className="mt-1 text-lg font-bold text-[var(--admin-text)]">{page?.pageName || "Aucune Page connectée"}</h2>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            {page
              ? `ID ${page.pageId} · ${publishedCount} publication(s) suivie(s)`
              : configured
                ? "Autorisez un compte ayant le droit de créer du contenu sur la Page."
                : "La configuration Meta backend est incomplète."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {page && <button type="button" className="admin-button admin-button--secondary admin-button--md" disabled={Boolean(busy)} onClick={() => void disconnect()}>{busy === "disconnect" ? "Déconnexion…" : "Déconnecter"}</button>}
          <button type="button" className="admin-button admin-button--primary admin-button--md" disabled={!configured || Boolean(busy)} onClick={() => void connect()}>
            {busy === "connect" ? "Redirection…" : page ? "Changer de Page" : "Connecter Facebook"}
          </button>
        </div>
      </section>

      {candidates.length > 0 && (
        <section className="admin-panel space-y-3 p-5">
          <div><h2 className="font-bold text-[var(--admin-text)]">Choisir la Page à connecter</h2><p className="text-sm text-[var(--admin-muted)]">Seules les Pages autorisées par Meta sont proposées.</p></div>
          {candidates.map((candidate) => (
            <div key={candidate.pageId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] p-3">
              <div><strong className="text-sm text-[var(--admin-text)]">{candidate.pageName}</strong><p className="text-xs text-[var(--admin-muted)]">Page ID · {candidate.pageId}</p></div>
              <button type="button" className="admin-button admin-button--primary admin-button--sm" disabled={Boolean(busy)} onClick={() => void selectPage(candidate.pageId)}>
                {busy === candidate.pageId ? "Connexion…" : "Connecter cette Page"}
              </button>
            </div>
          ))}
        </section>
      )}

      <section className="admin-panel overflow-hidden">
        <div className="admin-panel-heading flex-wrap">
          <div><h2>Produits visibles par les clients</h2><p>Produits approuvés de boutiques actuellement éligibles au catalogue client.</p></div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <input className="admin-search-input w-full sm:max-w-xs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit…" />
            <button type="button" className="admin-button admin-button--secondary admin-button--sm" disabled={loading} onClick={() => void load()}>{loading ? "Actualisation…" : "Actualiser"}</button>
          </div>
        </div>

        {loadError && <p className="px-5 pt-4 text-sm text-rose-500" role="alert">{loadError}</p>}
        {loading ? <p className="p-5 text-sm text-[var(--admin-muted)]">Chargement des produits…</p> : products.length === 0 ? (
          <p className="p-5 text-sm text-[var(--admin-muted)]">Aucun produit éligible ne correspond à cette recherche.</p>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const publication = product.publication;
              const canRetry = publication?.status === "failed";
              return (
                <article key={product._id} className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                  <div className="flex gap-3 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/5">
                      <img src={productImageUrl(product.photos?.[0]) || "/logo.png"} alt="" className="h-full w-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/logo.png"; }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-bold text-[var(--admin-text)]">{product.name}</h3>
                      <p className="mt-1 text-xs text-[var(--admin-muted)]">{product.boutiks_id?.name || "Boutique"}</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{Number(product.price).toLocaleString("fr-FR")} MGA</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] px-4 py-3">
                    <span className={`text-xs font-semibold ${publication?.status === "published" ? "text-emerald-500" : publication?.status === "failed" ? "text-rose-500" : "text-[var(--admin-muted)]"}`}>
                      {getPublicationLabel(publication)}
                    </span>
                    {publication?.status === "published" && publication.permalink ? (
                      <a href={publication.permalink} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500">Voir la publication ↗</a>
                    ) : (
                      <button type="button" className="admin-button admin-button--primary admin-button--sm" disabled={!page || publication?.status === "publishing" || Boolean(busy)} onClick={() => void publish(product)}>
                        {busy === product._id ? "Publication…" : canRetry ? "Réessayer" : "Publier"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          <span>Page {pageNumber} sur {pages}</span>
          <div className="flex gap-2">
            <button className="admin-button admin-button--secondary admin-button--sm" disabled={pageNumber <= 1 || loading} onClick={() => setPageNumber((value) => value - 1)}>Précédent</button>
            <button className="admin-button admin-button--secondary admin-button--sm" disabled={pageNumber >= pages || loading} onClick={() => setPageNumber((value) => value + 1)}>Suivant</button>
          </div>
        </div>
      </section>

      <p className="text-xs text-[var(--admin-muted)]">Si une publication reste « en cours » après une interruption réseau, vérifiez la Page avant toute nouvelle tentative pour éviter les doublons.</p>
    </div>
  );
}
