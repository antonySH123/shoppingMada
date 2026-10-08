import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../../helper/useCSRF";

type Notice = { _id: string; title: string; message: string; readAt?: string | null; targetType?: string; targetId?: string; createdAt: string };
type Reply = { authorName: string; message: string; sentAt: string };
type Ticket = { _id: string; subject: string; message: string; status: string; replies: Reply[]; updatedAt: string };

function AccountActivity() {
  const csrf = useCSRF();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    try {
      const [noticeResponse, ticketResponse] = await Promise.all([
        fetch(`${import.meta.env.REACT_API_URL}notifications?page=1&limit=10`, { credentials: "include" }),
        fetch(`${import.meta.env.REACT_API_URL}contact/my-tickets?page=1&limit=10`, { credentials: "include" }),
      ]);
      if (noticeResponse.ok) setNotices((await noticeResponse.json()).data ?? []);
      if (ticketResponse.ok) setTickets((await ticketResponse.json()).data ?? []);
    } catch { toast.error("Impossible de charger les notifications et les demandes support."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const markRead = async (notice: Notice) => {
    if (notice.readAt) return;
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}notifications/${notice._id}/read`, { method: "PUT", credentials: "include", headers: { "xsrf-token": csrf ?? "" } });
      if (!response.ok) throw new Error("Impossible de marquer la notification comme lue.");
      setNotices((items) => items.map((item) => item._id === notice._id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur."); }
  };

  const reply = async (event: FormEvent, ticket: Ticket) => {
    event.preventDefault();
    const message = (drafts[ticket._id] ?? "").trim();
    if (message.length < 2 || busy) return;
    setBusy(ticket._id);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}contact/my-tickets/${ticket._id}/replies`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "xsrf-token": csrf ?? "" }, body: JSON.stringify({ message }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Envoi impossible.");
      setDrafts((items) => ({ ...items, [ticket._id]: "" }));
      await load();
      toast.success("Message envoyé au support.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Envoi impossible."); }
    finally { setBusy(""); }
  };

  return <section className="profile-section-card">
    <div className="profile-section-title"><span className="profile-section-icon">●</span><div><h3>Activité de votre compte</h3><p>Alertes, réponses et demandes au support</p></div></div>
    <div className="profile-section-body">
      <h4>Notifications récentes</h4>
      {notices.length === 0 ? <p>Aucune notification pour le moment.</p> : notices.map((notice) => <article key={notice._id} className="profile-inline-row" onClick={() => void markRead(notice)} style={{ cursor: notice.readAt ? "default" : "pointer", opacity: notice.readAt ? 0.7 : 1 }}><span><strong>{notice.title}</strong><br />{notice.message}<br /><small>{new Date(notice.createdAt).toLocaleString("fr-FR")}</small></span>{notice.targetType === "support-ticket" && notice.targetId ? <Link to="#support">Voir</Link> : <span>{notice.readAt ? "Lue" : "Marquer lue"}</span>}</article>)}
      <h4 id="support" className="mt-5">Mes demandes au support</h4>
      {tickets.length === 0 ? <p>Aucune demande enregistrée depuis votre compte.</p> : tickets.map((ticket) => <article key={ticket._id} className="profile-order-card">
        <div className="profile-inline-row"><strong>{ticket.subject}</strong><span className="profile-pill profile-pill-neutral">{ticket.status === "resolved" ? "Clôturé" : ticket.status === "in_progress" ? "En cours" : "Ouvert"}</span></div>
        <p>{ticket.message}</p>
        {ticket.replies?.map((item, index) => <div key={`${ticket._id}-${index}`} className="profile-inline-row"><span><strong>{item.authorName}</strong><br />{item.message}<br /><small>{new Date(item.sentAt).toLocaleString("fr-FR")}</small></span></div>)}
        {ticket.status !== "resolved" && <form onSubmit={(event) => void reply(event, ticket)}><label>Répondre au support<textarea rows={3} maxLength={4000} value={drafts[ticket._id] ?? ""} onChange={(event) => setDrafts((items) => ({ ...items, [ticket._id]: event.target.value }))} /></label><button type="submit" disabled={busy === ticket._id || (drafts[ticket._id] ?? "").trim().length < 2}>{busy === ticket._id ? "Envoi…" : "Envoyer la réponse"}</button></form>}
      </article>)}
    </div>
  </section>;
}

export default AccountActivity;
