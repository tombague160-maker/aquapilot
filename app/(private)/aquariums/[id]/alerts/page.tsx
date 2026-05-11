import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { getUserAquariumById } from "@/services/aquarium-service";
import {
  analyzeAquariumAction,
  resolveAlertAction,
} from "@/services/alert-actions";
import {
  analyzeAquariumForUser,
  getAquariumAlerts,
  type AlertEntry,
} from "@/services/alert-service";

export const dynamic = "force-dynamic";

type AlertsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const severityStyles: Record<string, string> = {
  INFORMATION: "border-cyan-200 bg-cyan-50 text-cyan-800",
  ATTENTION: "border-amber-200 bg-amber-50 text-amber-800",
  IMPORTANT: "border-orange-200 bg-orange-50 text-orange-800",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
};

const severityOrder: Record<string, number> = {
  CRITICAL: 4,
  IMPORTANT: 3,
  ATTENTION: 2,
  INFORMATION: 1,
};

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="aqua-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </article>
  );
}

function AlertCard({ alert }: { alert: AlertEntry }) {
  const severityClass =
    severityStyles[alert.severity] ?? severityStyles.ATTENTION;
  const isResolved = alert.status === "RESOLVED";

  return (
    <article className="aqua-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium",
                severityClass
              )}
            >
              <CircleAlert className="size-3.5" aria-hidden="true" />
              {alert.severityLabel}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {alert.status}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950">
            {alert.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {alert.message}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Detectee le {alert.triggeredAtLabel}
          </p>
        </div>

        {!isResolved ? (
          <form action={resolveAlertAction.bind(null, alert.id)}>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-3 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Resoudre
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-sm text-slate-500">Cause probable</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-950">
            {alert.probableCause}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-sm text-slate-500">Action recommandee</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-950">
            {alert.recommendedAction}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-sm text-slate-500">Delai conseille</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-950">
            {alert.recommendedDelay}
          </p>
        </div>
      </div>
    </article>
  );
}

function AlertSection({
  title,
  description,
  alerts,
}: {
  title: string;
  description: string;
  alerts: AlertEntry[];
}) {
  return (
    <section className="aqua-surface p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          Aucune alerte dans cette section.
        </p>
      )}
    </section>
  );
}

export default async function AlertsPage({ params }: AlertsPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const analysis = await analyzeAquariumForUser(user.id, aquarium.id);
  const alerts = await getAquariumAlerts(user.id, aquarium.id);
  const activeAlerts = alerts
    .filter((alert) => alert.status === "OPEN" || alert.status === "ACKNOWLEDGED")
    .sort(
      (a, b) =>
        (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0)
    );
  const resolvedAlerts = alerts.filter((alert) => alert.status === "RESOLVED");
  const criticalCount = activeAlerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;
  const importantCount = activeAlerts.filter(
    (alert) => alert.severity === "IMPORTANT"
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Link
        href={`/aquariums/${aquarium.id}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour au detail
      </Link>

      <section className="flex flex-col gap-4 rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700">{aquarium.name}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Alertes aquariophilie
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Analyse des risques a partir de l&apos;eau, du vivant, des plantes,
            de l&apos;entretien et de l&apos;alimentation.
          </p>
        </div>
        <form action={analyzeAquariumAction.bind(null, aquarium.id)}>
          <button
            type="submit"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Relancer l&apos;analyse
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Actives"
          value={activeAlerts.length.toString()}
          helper={`${criticalCount} critique(s)`}
        />
        <StatCard
          label="Importantes"
          value={importantCount.toString()}
          helper="a traiter rapidement"
        />
        <StatCard
          label="Recommandations"
          value={analysis.recommendationCount.toString()}
          helper="generees par l'analyse"
        />
        <StatCard
          label="Resolues"
          value={resolvedAlerts.length.toString()}
          helper={`${analysis.created} nouvelle(s), ${analysis.updated} maj`}
        />
      </section>

      {activeAlerts.length === 0 ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-white/80 p-2 text-emerald-700">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-emerald-950">
                Aucun risque actif detecte
              </h2>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                Continue le suivi regulier des parametres, de l&apos;entretien
                et du comportement du vivant.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <AlertSection
        title="Alertes actives"
        description="Risques ouverts ou reconnus, classes par severite."
        alerts={activeAlerts}
      />

      <AlertSection
        title="Alertes resolues"
        description="Historique des risques traites."
        alerts={resolvedAlerts}
      />
    </div>
  );
}
