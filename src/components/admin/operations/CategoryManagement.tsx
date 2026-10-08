import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { requestAdminStepUp } from "../../../helper/adminStepUp";
import { PageHeader } from "../ui";

interface Category { _id: string; name: string; slug: string; level?: number; children?: Category[] }
function flatten(rows: Category[], depth = 0): Array<{ category: Category; depth: number }> {
  return rows.flatMap((category) => [{ category, depth }, ...flatten(category.children ?? [], depth + 1)]);
}
const makeSlug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function CategoryManagement() {
  const { user } = useAuth(); const csrf = useCSRF();
  const [categories, setCategories] = useState<Category[]>([]); const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [parentSlug, setParentSlug] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const isAdmin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin";
  const flat = useMemo(() => flatten(categories), [categories]);
  const load = useCallback(async () => { setLoading(true); try { const response = await fetch(`${import.meta.env.REACT_API_URL}admin/categories`, { credentials: "include" }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Chargement des catégories impossible."); setCategories(Array.isArray(result.data) ? result.data : []); } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur de chargement."); } finally { setLoading(false); } }, []);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!csrf || saving) return; setSaving(true); try { const stepUp = await requestAdminStepUp(csrf); if (!stepUp) return; const response = await fetch(`${import.meta.env.REACT_API_URL}admin/categories`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp }, body: JSON.stringify({ name, slug: makeSlug(slug || name), ...(parentSlug ? { parentSlug } : {}) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Création impossible."); toast.success(result.message); setName(""); setSlug(""); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur de création."); } finally { setSaving(false); } };
  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;
  return <div className="space-y-5"><PageHeader eyebrow="Catalogue marketplace" title="Catégories" description="Consultez l’arborescence publique et ajoutez une catégorie racine ou une sous-catégorie." />
    <form className="admin-panel grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => void submit(event)}><label className="text-xs font-semibold text-[var(--admin-muted)]">Nom<input className="admin-search-input mt-1 w-full" value={name} onChange={(event) => { setName(event.target.value); if (!slug) setSlug(makeSlug(event.target.value)); }} minLength={2} maxLength={80} required /></label><label className="text-xs font-semibold text-[var(--admin-muted)]">Identifiant URL<input className="admin-search-input mt-1 w-full" value={slug} onChange={(event) => setSlug(makeSlug(event.target.value))} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} required /></label><label className="text-xs font-semibold text-[var(--admin-muted)]">Catégorie parente<select className="admin-search-input mt-1 w-full" value={parentSlug} onChange={(event) => setParentSlug(event.target.value)}><option value="">Racine</option>{flat.map(({ category, depth }) => <option key={category._id} value={category.slug}>{"— ".repeat(depth)}{category.name}</option>)}</select></label><button className="admin-button admin-button--primary admin-button--md self-end" disabled={saving || !csrf}>{saving ? "Création…" : "Ajouter"}</button></form>
    <section className="admin-panel overflow-hidden"><div className="admin-panel-heading"><div><h2>Arborescence du catalogue</h2><p>{flat.length} catégorie(s) chargée(s)</p></div><button className="admin-button admin-button--secondary admin-button--sm" type="button" onClick={() => void load()}>Actualiser</button></div>{loading ? <p className="p-5 text-sm text-[var(--admin-muted)]">Chargement…</p> : flat.length ? <div className="divide-y divide-[var(--admin-border)]">{flat.map(({ category, depth }) => <div key={category._id} className="flex items-center justify-between gap-3 px-4 py-3" style={{ paddingLeft: `${16 + depth * 22}px` }}><div><strong className="text-sm text-[var(--admin-text)]">{category.name}</strong><p className="text-xs text-[var(--admin-muted)]">/{category.slug}</p></div><span className="text-xs text-[var(--admin-muted)]">Niveau {category.level ?? depth + 1}</span></div>)}</div> : <p className="p-5 text-sm text-[var(--admin-muted)]">Aucune catégorie retournée.</p>}</section>
    <p className="text-xs text-[var(--admin-muted)]">Les suppressions et renommages ne sont pas proposés : l’API du catalogue ne fournit pas encore ces opérations, et des catégories existantes peuvent être référencées par des produits.</p>
  </div>;
}
export default CategoryManagement;
