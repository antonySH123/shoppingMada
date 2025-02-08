import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Subscription {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
    plan: string;
    status: "pending" | "approved" | "rejected";
    startDate: string;
    endDate: string;
  }
  
function DetailsAbonnements() {
    const { id } = useParams();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // Récupérer les détails de l'abonnement
      const fetchSubscription = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.REACT_API_URL}subscriptions/${id}`
          );
          const data = await response.json();
          setSubscription(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("Erreur lors du chargement des données.");
        }
        setLoading(false);
      };
      fetchSubscription();
    }, [id]);
  
    const handleStatusChange = async (status: "approved" | "rejected") => {
      try {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}subscriptions/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );
        const data = await response.json();
  
        if (data.success) {
          setSubscription((prev) =>
            prev ? { ...prev, status } : prev
          );
          toast.success(
            status === "approved" ? "Abonnement validé !" : "Abonnement refusé !"
          );
        } else {
          toast.error("Erreur lors de la mise à jour.");
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Une erreur est survenue !");
      }
    };
  
    if (loading) return <p className="text-center text-white">Chargement...</p>;
  
    if (!subscription) return <p className="text-center text-white">Aucun abonnement trouvé.</p>;
  
    return (
      <div className="text-white w-full flex justify-center items-center p-8">
        <div className="bg-green-950 shadow-xl border border-green-500 shadow-green-500 rounded-md p-6 w-[400px]">
          <h1 className="text-xl font-bold text-center mb-4">Détails de l'abonnement</h1>
          
          <div className="mb-4">
            <p><strong>Nom :</strong> {subscription.user.name}</p>
            <p><strong>Email :</strong> {subscription.user.email}</p>
            <p><strong>Téléphone :</strong> {subscription.user.phone}</p>
          </div>
  
          <div className="mb-4">
            <p><strong>Plan :</strong> {subscription.plan}</p>
            <p><strong>Début :</strong> {new Date(subscription.startDate).toLocaleDateString()}</p>
            <p><strong>Fin :</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
            <p className={`font-bold ${subscription.status === "pending" ? "text-yellow-500" : subscription.status === "approved" ? "text-green-500" : "text-red-500"}`}>
              {subscription.status === "pending" ? "En attente" : subscription.status === "approved" ? "Validé" : "Refusé"}
            </p>
          </div>
  
          {subscription.status === "pending" && (
            <div className="flex justify-between gap-4 mt-4">
              <button
                onClick={() => handleStatusChange("approved")}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-white"
              >
                Valider
              </button>
              <button
                onClick={() => handleStatusChange("rejected")}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white"
              >
                Refuser
              </button>
            </div>
          )}
        </div>
      </div>
    );
}

export default DetailsAbonnements
