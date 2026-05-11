import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarRange,
  Droplets,
  HeartPulse,
  ShieldAlert,
  Utensils,
  Wrench,
} from "lucide-react";

import { AlertHistoryChart } from "@/components/stats/alert-history-chart";
import { FeedingFrequencyChart } from "@/components/stats/feeding-frequency-chart";
import { HealthScoreChart } from "@/components/stats/health-score-chart";
import { MaintenanceFrequencyChart } from "@/components/stats/maintenance-frequency-chart";
import { WaterParameterChart } from "@/components/stats/water-parameter-chart";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getWaterPeriod, waterPeriodOptions } from "@/rules/water-parameter";
import { getAquariumStatsData } from "@/services/statistics-service";

export const dynamic = "force-dynamic";

type StatsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    period?: string | string[];
  }>;
};

function ChartSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="aqua-surface p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <article className="aqua-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
          <Icon className="size-5" aria-hidden={true} />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </article>
  );
}

export default async function StatsPage({
  params,
  searchParams,
}: StatsPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const period = getWaterPeriod(query.period);
  const selectedPeriodLabel =
    waterPeriodOptions.find((option) => option.value === period)?.label ??
    "30 jours";
  const user = await requireUser();
  const stats = await getAquariumStatsData(user.id, id, period);

  if (!stats) {
    notFound();
  }

  const latestHealthScore =
    stats.healthScores.length > 0
      ? stats.healthScores[stats.healthScores.length - 1].score
      : null;
  const waterChangeCount = stats.maintenanceFrequency.reduce(
    (total, point) => total + point.count,
    0
  );
  const feedingCount = stats.feedingFrequency.reduce(
    (total, point) => total + point.count,
    0
  );
  const alertCount = stats.alertHistory.reduce(
    (total, point) =>
      total +
      point.information +
      point.attention +
      point.important +
      point.critical,
    0
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Link
        href={`/aquariums/${stats.aquarium.id}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour au detail
      </Link>

      <section className="flex flex-col gap-4 rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700">
            {stats.aquarium.name}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Statistiques
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Visualise les tendances d&apos;eau, de routines, d&apos;alertes et
            de score sante sur la periode choisie.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800">
          <CalendarRange className="size-4" aria-hidden="true" />
          {selectedPeriodLabel}
        </div>
      </section>

      <section className="aqua-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <CalendarRange className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Periode</h2>
              <p className="text-sm text-slate-500">
                Les graphiques partagent le meme filtre.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {waterPeriodOptions.map((option) => (
              <Link
                key={option.value}
                href={`/aquariums/${stats.aquarium.id}/stats?period=${option.value}`}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors",
                  period === option.value
                    ? "border-cyan-700 bg-cyan-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Score sante"
          value={latestHealthScore !== null ? `${latestHealthScore}/100` : "N/A"}
          helper="dernier score calcule"
          icon={HeartPulse}
        />
        <StatCard
          label="Mesures eau"
          value={stats.waterParameters.length.toString()}
          helper="points dans la periode"
          icon={Droplets}
        />
        <StatCard
          label="Changements d'eau"
          value={waterChangeCount.toString()}
          helper="operations enregistrees"
          icon={Wrench}
        />
        <StatCard
          label="Nourrissages"
          value={feedingCount.toString()}
          helper="distributions notees"
          icon={Utensils}
        />
        <StatCard
          label="Alertes"
          value={alertCount.toString()}
          helper="alertes detectees"
          icon={ShieldAlert}
        />
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
            <Droplets className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-cyan-700">Eau</p>
            <h2 className="text-xl font-semibold text-slate-950">
              Parametres mesurables
            </h2>
          </div>
        </div>
        <WaterParameterChart data={stats.waterParameters} />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartSection
          title="Score sante"
          description="Evolution du score global calcule a partir de l'eau, des alertes, des routines et du vivant."
        >
          <HealthScoreChart data={stats.healthScores} />
        </ChartSection>

        <ChartSection
          title="Changements d'eau"
          description="Frequence des changements d'eau et volume total remplace par periode."
        >
          <MaintenanceFrequencyChart data={stats.maintenanceFrequency} />
        </ChartSection>

        <ChartSection
          title="Nourrissages"
          description="Rythme des distributions pour reperer les routines trop denses ou les periodes creuses."
        >
          <FeedingFrequencyChart data={stats.feedingFrequency} />
        </ChartSection>

        <ChartSection
          title="Historique alertes"
          description="Alertes declenchees par severite et alertes resolues sur la periode."
        >
          <AlertHistoryChart data={stats.alertHistory} />
        </ChartSection>
      </div>

      <section className="aqua-surface p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
            <BarChart3 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Lecture rapide
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Les series vides indiquent simplement qu&apos;aucune donnee n&apos;a
              encore ete enregistree dans la periode selectionnee.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
