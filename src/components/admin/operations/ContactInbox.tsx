import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { PageHeader, StatusBadge } from "../ui";

interface Ticket {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  adminNote?: string;
  replies?: { authorName: string; message: string; sentAt: string }[];
  createdAt: string;
}

function ContactInbox() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("open");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const isAdmin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin" || user?.adminPermissions?.includes("support.read") === true;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}admin/contact-tickets?status=${status}&page=${page}&limit=20&search=${encodeURIComponent(search)}`,
        { credentials: "include" },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Boîte de support indisponible.");
      setTickets(Array.isArray(result.data) ? result.data : []);
      setPages(result.pagination?.pages ?? 1); setTotal(result.pagination?.total ?? result.data?.length ?? 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [status, page, search]);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const update = async (ticket: Ticket, nextStatus: Ticket["status"]) => {
    if (!csrf || busy) return;
    setBusy(ticket._id);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}admin/contact-tickets/${ticket._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          body: JSON.stringify({
            status: nextStatus,
            adminNote: notes[ticket._id] ?? ticket.adminNote ?? "",
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Mise à jour impossible.");
      toast.success(result.message);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de mise à jour.");
    } finally {
      setBusy("");
    }
  };

  const reply = async (ticket: Ticket) => {
    const message = replies[ticket._id]?.trim();
    if (!csrf || !message || busy) return;
    setBusy(ticket._id);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/contact-tickets/${ticket._id}/replies`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf }, body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Envoi impossible.");
      setReplies((current) => ({ ...current, [ticket._id]: "" }));
      toast.success(result.message);
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur d’envoi."); }
    finally { setBusy(""); }
  };

  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Support client"
        title="Boîte de réception"
        description="Traitez les messages reçus, ajoutez une note interne et suivez leur résolution."
      />
      <div className="admin-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-sm text-[var(--admin-muted)]">{total} ticket(s)</span>
        <input aria-label="Rechercher un ticket" className="admin-search-input" placeholder="Nom, e-mail ou sujet" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <select aria-label="Filtrer les tickets" className="admin-search-input" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="open">Nouveaux</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolus</option>
        </select>
      </div>
      {loading ? (
        <div className="admin-panel p-6" role="status">Chargement des messages…</div>
      ) : tickets.length === 0 ? (
        <div className="admin-panel p-8 text-center text-[var(--admin-muted)]">Aucun message dans cette file.</div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <article className="admin-panel p-4 sm:p-5" key={ticket._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[var(--admin-text)]">{ticket.subject}</h2>
                  <p className="text-sm text-[var(--admin-muted)]">
                    {ticket.name} · <a className="underline" href={`mailto:${ticket.email}`}>{ticket.email}</a> · {new Date(ticket.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <StatusBadge
                  status={ticket.status === "resolved" ? "Completed" : ticket.status}
                  tone={ticket.status === "in_progress" ? "progress" : undefined}
                  label={ticket.status === "resolved" ? "Résolu" : ticket.status === "in_progress" ? "En cours" : "Nouveau"}
                />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--admin-text)]">{ticket.message}</p>
              {(ticket.replies ?? []).length > 0 && <div className="mt-4 space-y-2 border-l-2 border-emerald-500/40 pl-4"><h3 className="text-xs font-bold uppercase tracking-wide text-[var(--admin-muted)]">Historique des réponses</h3>{ticket.replies!.map((item, index) => <div key={`${ticket._id}-${index}`} className="rounded-lg bg-white/5 p-3"><p className="text-xs text-[var(--admin-muted)]">{item.authorName} · {new Date(item.sentAt).toLocaleString("fr-FR")}</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.message}</p></div>)}</div>}
              <label className="mt-4 block text-xs font-semibold text-[var(--admin-muted)]">Réponse envoyée par e-mail<textarea className="admin-search-input mt-1 min-h-24 w-full" value={replies[ticket._id] ?? ""} onChange={(event) => setReplies((current) => ({ ...current, [ticket._id]: event.target.value }))} maxLength={4000} placeholder="Écrivez une réponse au client…" /></label>
              <button className="admin-button admin-button--primary admin-button--md mt-2" disabled={busy === ticket._id || !replies[ticket._id]?.trim()} onClick={() => void reply(ticket)}>Envoyer la réponse</button>
              <label className="mt-4 block text-xs font-semibold text-[var(--admin-muted)]">
                Note interne
                <textarea className="admin-search-input mt-1 min-h-20 w-full" value={notes[ticket._id] ?? ticket.adminNote ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [ticket._id]: event.target.value }))} maxLength={1000} />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="admin-button admin-button--secondary admin-button--md" disabled={busy === ticket._id} onClick={() => void update(ticket, "in_progress")}>Prendre en charge</button>
                <button className="admin-button admin-button--primary admin-button--md" disabled={busy === ticket._id} onClick={() => void update(ticket, "resolved")}>Marquer résolu</button>
                {ticket.status !== "open" && <button className="admin-button admin-button--ghost admin-button--md" disabled={busy === ticket._id} onClick={() => void update(ticket, "open")}>Rouvrir</button>}
              </div>
            </article>
          ))}
        </div>
      )}
      {pages > 1 && <div className="admin-panel flex items-center justify-between gap-3 p-4"><button className="admin-button admin-button--secondary admin-button--md" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Précédent</button><span>Page {page} / {pages}</span><button className="admin-button admin-button--secondary admin-button--md" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}>Suivant</button></div>}
    </div>
  );
}

export default ContactInbox;
