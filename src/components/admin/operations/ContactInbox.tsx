import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { PageHeader, StatusBadge } from "../ui";
import { useLanguage } from "../../../context/useLanguage";

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
  const { t, language } = useLanguage();
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
      if (!response.ok) throw new Error(result.message || t("admin.inboxUnavailable"));
      setTickets(Array.isArray(result.data) ? result.data : []);
      setPages(result.pagination?.pages ?? 1); setTotal(result.pagination?.total ?? result.data?.length ?? 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.loadError"));
    } finally {
      setLoading(false);
    }
  }, [status, page, search, t]);

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
      if (!response.ok) throw new Error(result.message || t("admin.updateUnavailable"));
      toast.success(result.message);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.updateError"));
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
      if (!response.ok) throw new Error(result.message || t("admin.sendUnavailable"));
      setReplies((current) => ({ ...current, [ticket._id]: "" }));
      toast.success(result.message);
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : t("admin.sendError")); }
    finally { setBusy(""); }
  };

  if (!isAdmin) return <Navigate to="/espace_vendeur/dash" replace />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("admin.customerSupport")}
        title={t("admin.inboxTitle")}
        description={t("admin.inboxDescription")}
      />
      <div className="admin-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-sm text-[var(--admin-muted)]">{t("admin.ticketCount").replace("{count}", String(total))}</span>
        <input aria-label={t("admin.searchTicket")} className="admin-search-input" placeholder={t("admin.searchTicketPlaceholder")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <select aria-label={t("admin.filterTickets")} className="admin-search-input" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="open">{t("admin.ticketNew")}</option>
          <option value="in_progress">{t("admin.ticketInProgress")}</option>
          <option value="resolved">{t("admin.ticketResolvedPlural")}</option>
        </select>
      </div>
      {loading ? (
        <div className="admin-panel p-6" role="status">{t("admin.loadingMessages")}</div>
      ) : tickets.length === 0 ? (
        <div className="admin-panel p-8 text-center text-[var(--admin-muted)]">{t("admin.noMessagesQueue")}</div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <article className="admin-panel p-4 sm:p-5" key={ticket._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[var(--admin-text)]">{ticket.subject}</h2>
                  <p className="text-sm text-[var(--admin-muted)]">
                    {ticket.name} · <a className="underline" href={`mailto:${ticket.email}`}>{ticket.email}</a> · {new Date(ticket.createdAt).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}
                  </p>
                </div>
                <StatusBadge
                  status={ticket.status === "resolved" ? "Completed" : ticket.status}
                  tone={ticket.status === "in_progress" ? "progress" : undefined}
                  label={ticket.status === "resolved" ? t("admin.ticketResolved") : ticket.status === "in_progress" ? t("admin.ticketInProgress") : t("admin.ticketNew")}
                />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--admin-text)]">{ticket.message}</p>
              {(ticket.replies ?? []).length > 0 && <div className="mt-4 space-y-2 border-l-2 border-emerald-500/40 pl-4"><h3 className="text-xs font-bold uppercase tracking-wide text-[var(--admin-muted)]">{t("admin.replyHistory")}</h3>{ticket.replies!.map((item, index) => <div key={`${ticket._id}-${index}`} className="rounded-lg bg-white/5 p-3"><p className="text-xs text-[var(--admin-muted)]">{item.authorName} · {new Date(item.sentAt).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.message}</p></div>)}</div>}
              <label className="mt-4 block text-xs font-semibold text-[var(--admin-muted)]">{t("admin.emailReply")}<textarea className="admin-search-input mt-1 min-h-24 w-full" value={replies[ticket._id] ?? ""} onChange={(event) => setReplies((current) => ({ ...current, [ticket._id]: event.target.value }))} maxLength={4000} placeholder={t("admin.replyPlaceholder")} /></label>
              <button className="admin-button admin-button--primary admin-button--md mt-2" disabled={busy === ticket._id || !replies[ticket._id]?.trim()} onClick={() => void reply(ticket)}>{t("admin.sendReply")}</button>
              <label className="mt-4 block text-xs font-semibold text-[var(--admin-muted)]">
                {t("admin.internalNote")}
                <textarea className="admin-search-input mt-1 min-h-20 w-full" value={notes[ticket._id] ?? ticket.adminNote ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [ticket._id]: event.target.value }))} maxLength={1000} />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="admin-button admin-button--secondary admin-button--md" disabled={busy === ticket._id} onClick={() => void update(ticket, "in_progress")}>{t("admin.takeTicket")}</button>
                <button className="admin-button admin-button--primary admin-button--md" disabled={busy === ticket._id} onClick={() => void update(ticket, "resolved")}>{t("admin.markResolved")}</button>
                {ticket.status !== "open" && <button className="admin-button admin-button--ghost admin-button--md" disabled={busy === ticket._id} onClick={() => void update(ticket, "open")}>{t("admin.reopen")}</button>}
              </div>
            </article>
          ))}
        </div>
      )}
      {pages > 1 && <div className="admin-panel flex items-center justify-between gap-3 p-4"><button className="admin-button admin-button--secondary admin-button--md" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>{t("common.previous")}</button><span>{t("pagination.pageOf").replace("{page}", String(page)).replace("{pages}", String(pages))}</span><button className="admin-button admin-button--secondary admin-button--md" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}>{t("common.next")}</button></div>}
    </div>
  );
}

export default ContactInbox;
