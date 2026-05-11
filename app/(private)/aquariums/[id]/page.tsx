import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Droplets,
  Fish,
  FlaskConical,
  Leaf,
  Pencil,
  Ruler,
  StickyNote,
  Thermometer,
  Utensils,
  Waves,
  Wrench,
} from "lucide-react";

import { AquariumHealthGauge } from "@/components/aquariums/aquarium-health-gauge";
import { AquariumHeroVisual } from "@/components/aquariums/aquarium-hero-visual";
import { AquariumMobileHeader } from "@/components/aquariums/aquarium-mobile-header";
import { AquariumQuickActions } from "@/components/aquariums/aquarium-quick-actions";
import { DeleteAquariumButton } from "@/components/aquariums/delete-aquarium-button";
import { MobileBottomNavigation } from "@/components/aquariums/mobile-bottom-navigation";
import { HealthScoreChart } from "@/components/health/health-score-chart";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  getAquariumLiveOverview,
  getUserAquariumById,
} from "@/services/aquarium-service";
import { getLatestFeedingLog } from "@/services/feeding-service";
import {
  calculateAquariumHealthScoreForUser,
  getAquariumHealthScoreHistory,
} from "@/services/health-score-service";
import { getLatestWaterChange } from "@/services/maintenance-service";
import { getLatestWaterMeasurement } from "@/services/water-parameter-service";

export const dynamic = "force-dynamic";

type AquariumDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DetailItemProps = {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
};

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div className="rounded-2xl border border-cyan-100/10 bg-slate-950/42 px-4 py-3 shadow-lg shadow-black/12 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-cyan-100/62">
        {Icon ? <Icon className="size-4" /> : null}
        <p className="text-xs font-medium uppercase">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  icon: Icon,
  children,
}: {
  title: string;
  eyebrow?: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-cyan-100/10 bg-slate-950/40 p-4 shadow-[0_22px_58px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl border border-cyan-100/10 bg-cyan-300/8 text-cyan-100">
          <Icon className="size-5" />
        </span>
        <div>
          {eyebrow ? (
            <p className="text-xs font-medium uppercase text-cyan-100/52">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-cyan-100/16 bg-white/5 px-4 py-5 text-sm leading-6 text-slate-200/72">
      {children}
    </p>
  );
}

function MetricPill({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "warning" | "missing";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3 shadow-lg shadow-black/10",
        status === "ok" &&
          "border-emerald-300/18 bg-emerald-300/8 text-emerald-50",
        status === "warning" &&
          "border-amber-300/22 bg-amber-300/10 text-amber-50",
        status === "missing" &&
          "border-slate-300/12 bg-white/5 text-slate-200"
      )}
    >
      <p className="text-xs font-medium uppercase opacity-62">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

const moduleLinks = [
  {
    label: "Modifier",
    icon: Pencil,
    href: (id: string) => `/aquariums/${id}/edit`,
  },
  {
    label: "Eau",
    icon: FlaskConical,
    href: (id: string) => `/aquariums/${id}/water`,
  },
  {
    label: "Poissons",
    icon: Fish,
    href: (id: string) => `/aquariums/${id}/fish`,
  },
  {
    label: "Plantes",
    icon: Leaf,
    href: (id: string) => `/aquariums/${id}/plants`,
  },
  {
    label: "Rappels",
    icon: Bell,
    href: (id: string) => `/aquariums/${id}/reminders`,
  },
  {
    label: "Alertes",
    icon: AlertTriangle,
    href: (id: string) => `/aquariums/${id}/alerts`,
  },
  {
    label: "Stats",
    icon: BarChart3,
    href: (id: string) => `/aquariums/${id}/stats`,
  },
  {
    label: "Notes",
    icon: StickyNote,
    href: (id: string) => `/aquariums/${id}/notes`,
  },
  {
    label: "Assistant",
    icon: Bot,
    href: (id: string) => `/aquariums/${id}/assistant`,
  },
  {
    label: "Entretien",
    icon: Wrench,
    href: (id: string) => `/aquariums/${id}/maintenance`,
  },
  {
    label: "Alimentation",
    icon: Utensils,
    href: (id: string) => `/aquariums/${id}/feeding`,
  },
];

export default async function AquariumDetailPage({
  params,
}: AquariumDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const [
    aquarium,
    latestWaterMeasurement,
    latestWaterChange,
    latestFeeding,
    liveOverview,
  ] = await Promise.all([
    getUserAquariumById(user.id, id),
    getLatestWaterMeasurement(user.id, id),
    getLatestWaterChange(user.id, id),
    getLatestFeedingLog(user.id, id),
    getAquariumLiveOverview(user.id, id),
  ]);

  if (!aquarium) {
    notFound();
  }

  const healthScore = await calculateAquariumHealthScoreForUser(
    user.id,
    aquarium.id
  );
  const healthScoreHistory = await getAquariumHealthScoreHistory(
    user.id,
    aquarium.id
  );
  const hasEnoughHealthData = Boolean(latestWaterMeasurement);

  return (
    <div className="aquarium-mobile-stage relative isolate -mx-4 -my-6 min-h-screen overflow-hidden px-4 pb-44 pt-8 text-white sm:-mx-6 sm:px-6 md:mx-auto md:my-0 md:max-w-5xl md:rounded-[2rem] md:px-6 md:py-8 lg:max-w-6xl">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(31,185,128,0.32),transparent_35%),radial-gradient(ellipse_at_50%_36%,rgba(18,61,87,0.64),transparent_62%),linear-gradient(180deg,#0d5b3d_0%,#0d2636_26%,#0c2035_58%,#081928_82%,#06101d_100%)]" />
      <div className="aqua-deep-glow pointer-events-none absolute inset-0 -z-10" />
      <div className="aqua-caustics pointer-events-none absolute inset-0 -z-10 opacity-28 mix-blend-screen" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[linear-gradient(180deg,rgba(45,212,191,0.16),rgba(35,83,105,0.18)_42%,transparent)]" />

      <div className="relative mx-auto w-full max-w-4xl">
        <AquariumMobileHeader aquariumId={aquarium.id} title={aquarium.name} />

        <AquariumHealthGauge
          score={healthScore?.score ?? null}
          summary={healthScore?.summary}
          interpretation={healthScore?.interpretation}
          hasEnoughData={hasEnoughHealthData}
          activeAlerts={liveOverview.activeAlerts}
          overdueReminders={liveOverview.overdueReminders}
        />

        <AquariumHeroVisual
          name={aquarium.name}
          typeLabel={aquarium.typeLabel}
          volume={aquarium.volume}
          temperature={aquarium.currentTemperature}
          fishCount={aquarium.counts.fish}
          plantCount={aquarium.counts.plants}
          activeAlerts={liveOverview.activeAlerts}
          pendingReminders={liveOverview.pendingReminders}
          photoUrl={aquarium.photoUrl}
        />

        <AquariumQuickActions aquariumId={aquarium.id} />

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Volume" value={aquarium.volume} icon={Waves} />
          <DetailItem
            label="Temperature"
            value={aquarium.currentTemperature}
            icon={Thermometer}
          />
          <DetailItem
            label="Poissons"
            value={aquarium.counts.fish.toString()}
            icon={Fish}
          />
          <DetailItem
            label="Plantes"
            value={aquarium.counts.plants.toString()}
            icon={Leaf}
          />
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            label="Alertes actives"
            value={liveOverview.activeAlerts.toString()}
            icon={AlertTriangle}
          />
          <DetailItem
            label="Critiques"
            value={liveOverview.criticalAlerts.toString()}
            icon={AlertTriangle}
          />
          <DetailItem
            label="Rappels"
            value={liveOverview.pendingReminders.toString()}
            icon={Bell}
          />
          <DetailItem
            label="En retard"
            value={liveOverview.overdueReminders.toString()}
            icon={Bell}
          />
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Derniere mesure d'eau"
            eyebrow={latestWaterMeasurement?.measuredAtLabel ?? "Aucune mesure"}
            icon={FlaskConical}
          >
            {latestWaterMeasurement ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {latestWaterMeasurement.metrics.slice(0, 6).map((metric) => (
                  <MetricPill
                    key={metric.key}
                    label={metric.label}
                    value={metric.displayValue}
                    status={metric.status}
                  />
                ))}
              </div>
            ) : (
              <EmptyState>
                Ajoute une premiere mesure pour stabiliser le score et detecter
                les risques invisibles.
              </EmptyState>
            )}
            <Link
              href={`/aquariums/${aquarium.id}/water`}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-cyan-100/14 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/16"
            >
              Voir les tests
            </Link>
          </SectionCard>

          <SectionCard
            title="Dernier entretien"
            eyebrow={latestWaterChange?.performedAtLabel ?? "Aucun changement"}
            icon={Droplets}
          >
            {latestWaterChange ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <DetailItem
                  label="Volume change"
                  value={latestWaterChange.waterChangeLiters}
                />
                <DetailItem
                  label="Pourcentage"
                  value={latestWaterChange.waterChangePercent}
                />
              </div>
            ) : (
              <EmptyState>
                Aucun changement d&apos;eau n&apos;est encore enregistre pour ce
                bac.
              </EmptyState>
            )}
            <Link
              href={`/aquariums/${aquarium.id}/maintenance`}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-cyan-100/14 bg-white/7 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-white/10"
            >
              Ouvrir l&apos;entretien
            </Link>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title="Dernier nourrissage"
            eyebrow={latestFeeding?.fedAtLabel ?? "Aucun nourrissage"}
            icon={Utensils}
          >
            {latestFeeding ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <DetailItem label="Nourriture" value={latestFeeding.foodTypeLabel} />
                <DetailItem label="Quantite" value={latestFeeding.amount} />
                <DetailItem label="Especes" value={latestFeeding.species} />
              </div>
            ) : (
              <EmptyState>
                Ajoute un nourrissage pour suivre la frequence et les
                observations apres repas.
              </EmptyState>
            )}
          </SectionCard>

          <SectionCard title="Modules du bac" eyebrow="Acces rapide" icon={Wrench}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {moduleLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href(aquarium.id)}
                  className="group flex items-center gap-2 rounded-2xl border border-cyan-100/10 bg-white/6 px-3 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/20 hover:bg-cyan-300/10 hover:text-cyan-50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100 transition group-hover:bg-cyan-300/16">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <DeleteAquariumButton
                aquariumId={aquarium.id}
                aquariumName={aquarium.name}
              />
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="Configuration" eyebrow="Materiel" icon={Ruler}>
            <div className="grid gap-2 sm:grid-cols-2">
              <DetailItem label="Longueur" value={aquarium.length} />
              <DetailItem label="Largeur" value={aquarium.width} />
              <DetailItem label="Hauteur" value={aquarium.height} />
              <DetailItem label="Filtration" value={aquarium.filtrationType} />
              <DetailItem label="Debit filtre" value={aquarium.filterFlow} />
              <DetailItem label="Chauffage" value={aquarium.heaterType} />
              <DetailItem label="Puissance" value={aquarium.heaterPower} />
              <DetailItem label="Duree lumiere" value={aquarium.lightingHours} />
            </div>
          </SectionCard>

          <SectionCard title="Sol et notes" eyebrow="Contexte" icon={StickyNote}>
            <div className="grid gap-2">
              <DetailItem label="Sol" value={aquarium.substrate} />
              <DetailItem label="Engrais" value={aquarium.fertilizer} />
              <DetailItem label="CO2" value={aquarium.hasCo2 ? "Present" : "Absent"} />
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-cyan-100/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200/72">
              {aquarium.notes || "Aucune note pour cet aquarium."}
            </p>
          </SectionCard>
        </div>

        <div className="mt-4">
          <SectionCard
            title="Evolution du score"
            eyebrow="Statistiques"
            icon={BarChart3}
          >
            <div className="overflow-hidden rounded-2xl border border-cyan-100/10 bg-white/88 p-3 text-slate-900">
              <HealthScoreChart data={healthScoreHistory} />
            </div>
          </SectionCard>
        </div>
      </div>

      <MobileBottomNavigation aquariumId={aquarium.id} />
    </div>
  );
}
