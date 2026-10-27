import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import { PageHeader } from "../ui";
import { useLanguage } from "../../../context/useLanguage";

interface AuditEvent { _id: string; actorName: string; action: string; targetType: string; targetId: string; targetLabel?: string; reason?: string; createdAt: string }
function AuditLog() {
  const { t, language } = useLanguage();
  const { user } = useAuth(); const [events, setEvents] = useState<AuditEvent[]>([]); const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [loading, setLoading] = useState(true);
  const isAdmin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin";
  useEffect(() => { if (!isAdmin) return; let active = true; setLoading(true); fetch(`${import.meta.env.REACT_API_URL}admin/audit?page=${page}&limit=30`, { credentials: "include" }).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message || "Journal indisponible."); if (active) { setEvents(Array.isArray(result.data) ? result.data : []); setPages(result.pagination?.pages || 1); } }).catch((error) => { if (active) toast.error(error instanceof Error ? error.message : "Erreur de chargement."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [isAdmin, page]);
  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;
  return <div className="space-y-5"><PageHeader eyebrow={t("admin.auditEyebrow")} title={t("admin.activityLog")} description={t("admin.auditDescription")} />{loading ? <div className="admin-panel p-6" role="status">{t("admin.loadingAudit")}</div> : <div className="admin-panel overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>{t("admin.date")}</th><th>{t("admin.administrator")}</th><th>{t("admin.action")}</th><th>{t("admin.target")}</th><th>{t("admin.reason")}</th></tr></thead><tbody>{events.map((event) => <tr key={event._id}><td className="whitespace-nowrap">{new Date(event.createdAt).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}</td><td>{event.actorName}</td><td><code>{event.action}</code></td><td>{event.targetLabel || event.targetType} <span className="text-xs text-[var(--admin-muted)]">{event.targetId.slice(-7)}</span></td><td className="max-w-xs">{event.reason || "—"}</td></tr>)}</tbody></table></div>{events.length === 0 && <p className="p-6 text-center text-sm text-[var(--admin-muted)]">{t("admin.auditEmpty")}</p>}<div className="flex items-center justify-between border-t border-[var(--admin-border)] p-3 text-sm"><span>{t("pagination.pageOf").replace("{page}", String(page)).replace("{pages}", String(pages))}</span><div className="flex gap-2"><button className="admin-button admin-button--secondary admin-button--sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t("common.previous")}</button><button className="admin-button admin-button--secondary admin-button--sm" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>{t("common.next")}</button></div></div></div>}</div>;
}
export default AuditLog;
