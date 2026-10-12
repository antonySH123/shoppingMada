import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { requestAdminStepUp } from "../../../helper/adminStepUp";
import { PageHeader } from "../ui";

type PageStatus = { pageId: string; pageName: string; connectedAt: string } | null;
type Candidate = { pageId: string; pageName: string; tasks: string[] };
type Product = { _id: string; name: string; description: string; price: number; photos: string[]; boutiks_id?: { name: string; isActive: boolean }; publication?: { status: string; permalink?: string; errorMessage?: string; publishedAt?: string } | null };
const api = `${import.meta.env.REACT_API_URL}admin/facebook`;

export default function FacebookPublishing() {
  const { user } = useAuth(); const csrf = useCSRF(); const location = useLocation(); const navigate = useNavigate();
  const isAdmin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin";
  const [page, setPage] = useState<PageStatus>(null); const [configured, setConfigured] = useState(false); const [publishedCount, setPublishedCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]); const [pageNumber, setPageNumber] = useState(1); const [pages, setPages] = useState(1); const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]); const [flow, setFlow] = useState(""); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statusResponse, productsResponse] = await Promise.all([
        fetch(`${api}/status`, { credentials: "include" }),
        fetch(`${api}/products?page=${pageNumber}&limit=12&q=${encodeURIComponent(query)}`, { credentials: "include" }),
      ]);
      const statusResult = await statusResponse.json(); const productsResult = await productsResponse.json();
      if (!statusResponse.ok) throw new Error(statusResult.message || "Statut Facebook indisponible.");
      if (!productsResponse.ok) throw new Error(productsResult.message || "Produits indisponibles.");
      setPage(statusResult.page || null); setConfigured(Boolean(statusResult.configured)); setPublishedCount(statusResult.publishedCount || 0);
      setProducts(productsResult.data || []); setPages(productsResult.pagination?.pages || 1);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }, [pageNumber, query]);

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);
  useEffect(() => {
    const params = new URLSearchParams(location.search); const flowId = params.get("meta_flow"); const errorCode = params.get("meta_error");
    if (errorCode) {
      const errors: Record<string, string> = { oauth_invalid: "Retour OAuth Meta invalide.", oauth_expired: "La connexion Meta a expiré.", oauth_denied: "Autorisation Meta refusée.", no_managed_pages: "Aucune Page Meta publiable n’a été trouvée pour ce compte.", oauth_failed: "La connexion Meta a échoué. Vérifiez la configuration backend." };
      toast.error(errors[errorCode] || "La connexion Meta a échoué."); params.delete("meta_error"); navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
    if (flowId && csrf) {
      setFlow(flowId); params.delete("meta_flow"); navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      void fetch(`${api}/connect/flow/${encodeURIComponent(flowId)}`, { credentials: "include" }).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message); setCandidates(result.data || []); }).catch((error) => toast.error(error instanceof Error ? error.message : "Pages Meta indisponibles."));
    }
  }, [location.pathname, location.search, navigate, csrf]);

  const connect = async () => { setBusy("connect"); try { const response = await fetch(`${api}/connect/start`, { credentials: "include" }); const result = await response.json(); if (!response.ok) throw new Error(result.message); window.location.assign(result.url); } catch (error) { toast.error(error instanceof Error ? error.message : "Connexion impossible."); setBusy(""); } };
  const selectPage = async (pageId: string) => { if (!csrf || !flow) return; setBusy(pageId); try { const stepUp = await requestAdminStepUp(csrf); if (!stepUp) return; const response = await fetch(`${api}/connect/flow/${encodeURIComponent(flow)}/select`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp }, body: JSON.stringify({ pageId }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); setCandidates([]); setFlow(""); toast.success(result.message); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Sélection impossible."); } finally { setBusy(""); } };
  const disconnect = async () => { if (!csrf || !window.confirm("Déconnecter la Page Facebook ? Les publications déjà en ligne ne seront pas supprimées.")) return; setBusy("disconnect"); try { const stepUp = await requestAdminStepUp(csrf); if (!stepUp) return; const response = await fetch(`${api}/connect`, { method: "DELETE", credentials: "include", headers: { "xsrf-token": csrf, "x-admin-step-up": stepUp } }); const result = await response.json(); if (!response.ok) throw new Error(result.message); toast.success(result.message); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Déconnexion impossible."); } finally { setBusy(""); } };
  const publish = async (product: Product) => { if (!csrf) return; setBusy(product._id); try { const stepUp = await requestAdminStepUp(csrf); if (!stepUp) return; const response = await fetch(`${api}/products/${product._id}/publish`, { method: "POST", credentials: "include", headers: { "xsrf-token": csrf, "x-admin-step-up": stepUp } }); const result = await response.json(); if (!response.ok) throw new Error(result.message); toast.success(result.message); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Publication impossible."); await load(); } finally { setBusy(""); } };

  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;
  return <div className="space-y-5">
    <PageHeader eyebrow="Canal social · Meta Graph API" title="Publication Facebook" description="Publiez manuellement sur la Page ShopInMada les produits approuvés par la modération." />
    <section className="admin-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Connexion Page</p><h2 className="mt-1 text-lg font-bold text-[var(--admin-text)]">{page ? page.pageName : "Aucune Page connectée"}</h2><p className="mt-1 text-sm text-[var(--admin-muted)]">{page ? `ID ${page.pageId} · ${publishedCount} publication(s) suivie(s)` : configured ? "Autorisez un compte ayant le droit de créer du contenu sur la Page." : "La configuration Meta backend est incomplète."}</p></div>
      <div className="flex flex-wrap gap-2">{page && <button type="button" className="admin-button admin-button--secondary admin-button--md" disabled={!!busy} onClick={() => void disconnect()}>{busy === "disconnect" ? "Déconnexion…" : "Déconnecter"}</button>}<button type="button" className="admin-button admin-button--primary admin-button--md" disabled={!configured || !!busy} onClick={() => void connect()}>{busy === "connect" ? "Redirection…" : page ? "Changer de Page" : "Connecter Facebook"}</button></div>
    </section>
    {candidates.length > 0 && <section className="admin-panel space-y-3 p-5"><div><h2 className="font-bold text-[var(--admin-text)]">Choisir la Page à connecter</h2><p className="text-sm text-[var(--admin-muted)]">Seules les Pages pour lesquelles Meta confirme un droit de publication sont proposées.</p></div>{candidates.map((candidate) => <div key={candidate.pageId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] p-3"><div><strong className="text-sm text-[var(--admin-text)]">{candidate.pageName}</strong><p className="text-xs text-[var(--admin-muted)]">Page ID · {candidate.pageId}</p></div><button type="button" className="admin-button admin-button--primary admin-button--sm" disabled={!!busy} onClick={() => void selectPage(candidate.pageId)}>{busy === candidate.pageId ? "Connexion…" : "Connecter cette Page"}</button></div>)}</section>}
    <section className="admin-panel overflow-hidden"><div className="admin-panel-heading flex-wrap"><div><h2>Produits approuvés</h2><p>La publication est manuelle et chaque résultat est historisé.</p></div><input className="admin-search-input w-full sm:max-w-xs" value={query} onChange={(event) => { setQuery(event.target.value); setPageNumber(1); }} placeholder="Rechercher un produit…" /></div>
      {loading ? <p className="p-5 text-sm text-[var(--admin-muted)]">Chargement des produits…</p> : products.length === 0 ? <p className="p-5 text-sm text-[var(--admin-muted)]">Aucun produit approuvé ne correspond à cette recherche.</p> : <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => { const state = product.publication; return <article key={product._id} className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"><div className="flex gap-3 p-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/5">{product.photos?.[0] && <img className="h-full w-full object-cover" src={`${import.meta.env.REACT_API_URL}uploads/${encodeURIComponent(product.photos[0].split(/[\\/]/).pop() || "")}`} alt="" />}</div><div className="min-w-0 flex-1"><h3 className="line-clamp-2 font-bold text-[var(--admin-text)]">{product.name}</h3><p className="mt-1 text-xs text-[var(--admin-muted)]">{product.boutiks_id?.name || "Boutique"}</p><p className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{Number(product.price).toLocaleString("fr-FR")} MGA</p></div></div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] px-4 py-3"><span className={`text-xs font-semibold ${state?.status === "published" ? "text-emerald-500" : state?.status === "failed" ? "text-rose-500" : "text-[var(--admin-muted)]"}`}>{state?.status === "published" ? "Publié" : state?.status === "failed" ? "Échec · nouvelle tentative possible" : state?.status === "publishing" ? "Publication en cours / statut à vérifier" : "Prêt à publier"}</span>{state?.status === "published" && state.permalink ? <a href={state.permalink} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500">Voir la publication ↗</a> : <button type="button" className="admin-button admin-button--primary admin-button--sm" disabled={!page || !product.boutiks_id?.isActive || state?.status === "publishing" || !!busy} onClick={() => void publish(product)}>{busy === product._id ? "Publication…" : state?.status === "failed" ? "Réessayer" : "Publier"}</button>}</div></article>; })}</div>}
      <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-4 py-3 text-sm text-[var(--admin-muted)]"><span>Page {pageNumber} sur {pages}</span><div className="flex gap-2"><button className="admin-button admin-button--secondary admin-button--sm" disabled={pageNumber <= 1 || loading} onClick={() => setPageNumber((value) => value - 1)}>Précédent</button><button className="admin-button admin-button--secondary admin-button--sm" disabled={pageNumber >= pages || loading} onClick={() => setPageNumber((value) => value + 1)}>Suivant</button></div></div>
    </section>
    <p className="text-xs text-[var(--admin-muted)]">Une publication affichée « en cours » après une interruption réseau nécessite une vérification manuelle sur la Page avant toute nouvelle tentative, pour éviter les doublons.</p>
  </div>;
}
