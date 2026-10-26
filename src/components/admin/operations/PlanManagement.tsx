import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import { useAdminStepUp } from "../../../helper/adminStepUp";
import { PageHeader } from "../ui";

type PlanKey = "free" | "pro" | "enterprise";
type FeatureKey = "advancedAnalytics" | "prioritySupport" | "customCategories";
type EditablePlanField = "name" | "monthlyPriceMGA" | "durationDays" | "graceDays" | "maxProducts" | "trialEnabled" | "trialDurationDays" | "trialMaxProducts" | "active";
type Plan = {
  key: PlanKey;
  name: string;
  monthlyPriceMGA: number;
  durationDays: number;
  graceDays: number;
  maxProducts: number;
  active: boolean;
  features: Record<FeatureKey, boolean>;
  trialEnabled?: boolean;
  trialDurationDays?: number;
  trialMaxProducts?: number;
};

const featureLabels: Record<FeatureKey, string> = {
  advancedAnalytics: "Analyses avancées",
  prioritySupport: "Support prioritaire",
  customCategories: "Catégories personnalisées",
};
const planFields: Array<{ key: "name" | "monthlyPriceMGA" | "durationDays" | "graceDays" | "maxProducts"; label: string; min: number }> = [
  { key: "name", label: "Nom", min: 0 },
  { key: "monthlyPriceMGA", label: "Prix mensuel (MGA)", min: 0 },
  { key: "durationDays", label: "Durée (jours)", min: 1 },
  { key: "graceDays", label: "Délai de grâce (jours)", min: 0 },
  { key: "maxProducts", label: "Produits maximum (0 = illimité)", min: 1 },
];

export default function PlanManagement() {
  const { user } = useAuth();
  const csrf = useCSRF();
  const adminStepUp = useAdminStepUp();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const admin = user?.userGroupMember_id?.usergroup_id?.name === "Super Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/plans`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setPlans(Array.isArray(result.data) ? result.data as Plan[] : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (admin) void load(); }, [admin, load]);

  const changeField = <K extends EditablePlanField>(planKey: PlanKey, field: K, value: Plan[K]) => {
    setPlans((current) => current.map((plan) => plan.key === planKey ? { ...plan, [field]: value } : plan));
  };

  const changeFeature = (planKey: PlanKey, feature: FeatureKey, enabled: boolean) => {
    setPlans((current) => current.map((plan) => plan.key === planKey
      ? { ...plan, features: { ...plan.features, [feature]: enabled } }
      : plan));
  };

  const save = async (plan: Plan) => {
    if (!csrf) return;
    setBusy(plan.key);
    try {
      const stepUp = await adminStepUp(csrf);
      if (!stepUp) return;
      const response = await fetch(`${import.meta.env.REACT_API_URL}admin/plans/${plan.key}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf, "x-admin-step-up": stepUp },
        body: JSON.stringify(plan),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      toast.success("Forfait enregistré.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setBusy("");
    }
  };

  if (!admin) return <Navigate to="/espace_vendeur/dash" replace />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Offre commerciale"
        title="Forfaits et droits"
        description="Gestion des limites, quotas et droits réellement appliqués par l’API. Les modifications sensibles sont confirmées par un code de sécurité envoyé au Super Admin."
      />
      {loading ? <div className="admin-panel p-6">Chargement…</div> : plans.map((plan) => (
        <section key={plan.key} className="admin-panel space-y-4 p-5">
          <h2 className="text-xl font-bold">{plan.name} <span className="text-xs uppercase text-[var(--admin-muted)]">{plan.key}</span></h2>
          {plan.key === "free" && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={Boolean(plan.trialEnabled)} onChange={(event) => changeField(plan.key, "trialEnabled", event.target.checked)} />
                Activer la promotion gratuite temporaire pour les nouvelles boutiques
              </label>
              {plan.trialEnabled && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">Durée
                    <select className="admin-search-input mt-1 w-full" value={plan.trialDurationDays ?? 30} onChange={(event) => changeField(plan.key, "trialDurationDays", Number(event.target.value))}>
                      <option value={30}>30 jours</option><option value={60}>60 jours</option>
                    </select>
                  </label>
                  <label className="text-sm">Quota produits (0 = illimité)
                    <input type="number" min={0} className="admin-search-input mt-1 w-full" value={plan.trialMaxProducts ?? 20} onChange={(event) => changeField(plan.key, "trialMaxProducts", Number(event.target.value))} />
                  </label>
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--admin-muted)]">Cette promotion s’applique aux nouvelles boutiques. Les promotions en cours conservent leurs dates.</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {planFields.map(({ key, label, min }) => (
              <label key={key} className="text-sm font-medium">{label}
                <input
                  className="admin-search-input mt-1 w-full"
                  value={plan[key]}
                  type={key === "name" ? "text" : "number"}
                  min={min}
                  disabled={plan.key === "enterprise" && key === "maxProducts"}
                  onChange={(event) => changeField(plan.key, key, key === "name" ? event.target.value : Number(event.target.value))}
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-5">
            {(Object.entries(featureLabels) as Array<[FeatureKey, string]>).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(plan.features?.[key])} onChange={(event) => changeFeature(plan.key, key, event.target.checked)} />{label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={plan.active} disabled={plan.key === "free"} onChange={(event) => changeField(plan.key, "active", event.target.checked)} />Forfait disponible
            </label>
          </div>
          <button className="admin-button admin-button--primary admin-button--md" disabled={busy === plan.key} onClick={() => void save(plan)}>
            {busy === plan.key ? "Enregistrement…" : "Enregistrer le forfait"}
          </button>
        </section>
      ))}
    </div>
  );
}