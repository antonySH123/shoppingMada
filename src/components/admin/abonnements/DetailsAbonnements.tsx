import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import { formatFrenchDate, formatStatus } from "../../../helper/locale";

interface Subscription {
  _id: string;
  plan: string;
  payementStatus: "Pending" | "Completed" | "Rejected" | "Canceled";
  startDate?: string;
  endDate?: string;
  owner_id?: { username?: string; email?: string; boutiks_id?: { name?: string } };
}

function DetailsAbonnements() {
  const { id } = useParams();
  const csrf = useCSRF();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}subscription/${id}`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Impossible de charger l'abonnement.");
      setSubscription(result.data ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchSubscription(); }, [fetchSubscription]);

  const updateStatus = async (payementStatus: "Completed" | "Rejected") => {
    if (!id || !csrf) return;
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}subscribe/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf },
        credentials: "include",
        body: JSON.stringify({ payementStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Mise à jour impossible.");
      toast.success(result.message);
      await fetchSubscription();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mise à jour impossible.");
    }
  };

  if (loading) return <p className="text-center">Chargement…</p>;
  if (!subscription) return <p className="text-center">Abonnement introuvable.</p>;

  return (
    <section className="mx-auto w-full max-w-lg rounded-md border border-green-500 bg-green-950 p-6 text-white shadow-xl">
      <h1 className="mb-4 text-center text-xl font-bold">Détails de l'abonnement</h1>
      <p><strong>Boutique :</strong> {subscription.owner_id?.boutiks_id?.name ?? subscription.owner_id?.username ?? "—"}</p>
      <p><strong>Email :</strong> {subscription.owner_id?.email ?? "—"}</p>
      <p><strong>Forfait :</strong> {subscription.plan}</p>
      <p><strong>État :</strong> {formatStatus(subscription.payementStatus)}</p>
      {subscription.startDate && <p><strong>Début :</strong> {formatFrenchDate(subscription.startDate)}</p>}
      {subscription.endDate && <p><strong>Fin :</strong> {formatFrenchDate(subscription.endDate)}</p>}
      {subscription.payementStatus === "Pending" && (
        <div className="mt-5 flex gap-3">
          <button onClick={() => void updateStatus("Completed")} className="flex-1 rounded bg-green-600 py-2">Valider</button>
          <button onClick={() => void updateStatus("Rejected")} className="flex-1 rounded bg-red-600 py-2">Refuser</button>
        </div>
      )}
    </section>
  );
}

export default DetailsAbonnements;
