import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { PageHeader, StatusBadge } from "../ui";
import { requestAdminStepUp } from "../../../helper/adminStepUp";

interface KycRecord {
  _id: string; cin: string; frontImage: string; backImage: string;
  verificationStatus?: string; verificationReason?: string; updatedAt?: string;
  owner_id?: { _id?: string; username?: string; email?: string; phonenumber?: string; boutiks_id?: { name?: string } };
}

function KycQueue() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [status, setStatus] = useState("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const isAdmin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/kyc?status=${status}&page=${page}&limit=20`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Chargement KYC impossible.");
      setRecords(Array.isArray(result.data) ? result.data : []);
      setPages(result.pagination?.pages ?? 1); setTotal(result.pagination?.total ?? result.data?.length ?? 0);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur de chargement."); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

  const decide = async (record: KycRecord, decision: "approved" | "rejected") => {
    if (!csrf || busy) return;
    const reason = reasons[record._id]?.trim() ?? "";
    if (decision === "rejected" && reason.length < 3) { toast.warning("Indiquez un motif de refus."); return; }
    setBusy(record._id);
    try {
      const stepUp = await requestAdminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/kyc/${record._id}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp },
        body: JSON.stringify({ status: decision, reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Décision impossible.");
      toast.success(result.message); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur de mise à jour."); }
    finally { setBusy(""); }
  };

  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;
  return <div className="space-y-5">
    <PageHeader eyebrow="Vendeurs" title="Vérification d’identité" description="Examinez les dossiers CIN et enregistrez une décision motivée." />
    <div className="admin-panel flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="text-sm text-[var(--admin-muted)]">{total} dossier(s) dans cette file</p>
      <select aria-label="État des dossiers KYC" className="admin-search-input" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
        <option value="pending">En attente</option><option value="approved">Approuvés</option><option value="rejected">Refusés</option>
      </select>
    </div>
    {loading ? <div className="admin-panel p-6" role="status">Chargement des dossiers…</div> : records.length === 0 ? <div className="admin-panel p-8 text-center text-[var(--admin-muted)]">Aucun dossier dans cette file.</div> : <div className="grid gap-4 xl:grid-cols-2">
      {records.map((record) => <article className="admin-panel overflow-hidden p-4 sm:p-5" key={record._id}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-[var(--admin-text)]">{record.owner_id?.boutiks_id?.name || record.owner_id?.username || "Vendeur"}</h2><p className="text-sm text-[var(--admin-muted)]">{record.owner_id?.email} · {record.owner_id?.phonenumber}</p></div><StatusBadge status={record.verificationStatus || "pending"} label={record.verificationStatus === "approved" ? "Approuvé" : record.verificationStatus === "rejected" ? "Refusé" : "En attente"} /></div>
        <p className="mt-3 text-sm"><strong>CIN :</strong> {record.cin}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">{(["front", "back"] as const).map((side) => { const label = side === "front" ? "Recto" : "Verso"; const url = `${import.meta.env.REACT_API_URL}admin/kyc/${record._id}/documents/${side}`; return <a key={side} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-[var(--admin-border)]"><img className="h-36 w-full object-cover" src={url} alt={`Pièce d’identité ${label}`} /><span className="block p-2 text-center text-xs">Ouvrir {label}</span></a>; })}</div>
        {record.verificationReason && <p className="mt-3 text-sm text-[var(--admin-muted)]">Motif précédent : {record.verificationReason}</p>}
        {status === "pending" && <><label className="mt-4 block text-xs font-semibold text-[var(--admin-muted)]">Motif (obligatoire pour un refus)<textarea className="admin-search-input mt-1 min-h-20 w-full" value={reasons[record._id] || ""} onChange={(event) => setReasons((current) => ({ ...current, [record._id]: event.target.value }))} maxLength={500} /></label><div className="mt-3 flex flex-wrap gap-2"><button className="admin-button admin-button--primary admin-button--md" disabled={busy === record._id} onClick={() => void decide(record, "approved")}>Approuver</button><button className="admin-button admin-button--danger admin-button--md" disabled={busy === record._id} onClick={() => void decide(record, "rejected")}>Refuser</button></div></>}
      </article>)}
    </div>}
    {pages > 1 && <div className="admin-panel flex items-center justify-between gap-3 p-4"><button className="admin-button admin-button--secondary admin-button--md" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Précédent</button><span>Page {page} / {pages}</span><button className="admin-button admin-button--secondary admin-button--md" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}>Suivant</button></div>}
  </div>;
}

export default KycQueue;
