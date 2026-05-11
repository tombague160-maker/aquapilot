import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bot,
  Database,
  Droplets,
  HeartPulse,
  Plus,
  ShieldCheck,
  Waves,
} from "lucide-react";

import { AquariumHeroDashboard } from "@/components/dashboard/aquarium-hero-dashboard";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getDashboardOverview } from "@/services/dashboard-service";
import type { HealthScoreInterpretation } from "@/services/health-score-service";

export const dynamic = "force-dynamic";

const readinessItems = [
  "Routes privees",
  "Donnees par utilisateur",
  "Prisma PostgreSQL",
  "Scores et alertes",
  "Rappels intelligents",
  "Assistant IA prepare",
];

function getHealthScoreTone(interpretation: HealthScoreInterpretation) {
  if (interpretation === "excellent") {
    return "border-emerald-300/24 bg-emerald-300/10 text-emerald-100";
  }

  if (interpretation === "bon") {
    return "border-cyan-300/24 bg-cyan-300/10 text-cyan-100";
  }

  if (interpretation === "attention") {
    return "border-amber-300/24 bg-amber-300/10 text-amber-100";
  }

  if (interpretation === "probleme important") {
    return "border-orange-300/24 bg-orange-300/10 text-orange-100";
  }

  return "border-red-300/24 bg-red-300/10 text-red-100";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const overview = await getDashboardOverview(user.id);
  const displayName = user.name ?? user.email;

  const overviewCards = [
    {
      label: "Aquariums",
      value: overview.aquariumCount.toString(),
      detail: "Bacs actifs",
      icon: Droplets,
    },
    {
      label: "Alertes",
      value: overview.alertCount.toString(),
      detail: "Alertes ouvertes",
      icon: Bell,
    },
    {
      label: "Rappels",
      value: overview.reminderCount.toString(),
      detail: "Rappels en attente",
      icon: Activity,
    },
    {
      label: "Notifications",
      value: overview.unreadNotificationCount.toString(),
      detail: "Non lues",
      icon: Database,
    },
    {
      label: "Score moyen",
      value:
        overview.averageHealthScore !== null
          ? `${overview.averageHealthScore}/100`
          : "N/A",
      detail: "Aquariums actifs",
      icon: HeartPulse,
    },
  ];

  return (
    <div className="relative isolate -mx-4 -my-6 min-h-screen overflow-hidden bg-[#020611] px-4 py-6 text-white sm:-mx-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-12%,rgba(20,184,166,0.24),transparent_32rem),radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.14),transparent_24rem),linear-gradient(180deg,#061c2b_0%,#06101d_38%,#020611_100%)]" />
      <div className="aqua-dashboard-caustics pointer-events-none absolute inset-0 -z-10 opacity-24 mix-blend-screen" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[1.75rem] border border-cyan-100/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-cyan-200/14 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              AquaPilot
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Accueil
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Bienvenue {displayName}. Ton bac principal est mis en scene avec
              une couche aquatique animee, tout en gardant les vraies donnees de
              suivi.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.12)]">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Session active
          </div>
        </section>

        <AquariumHeroDashboard aquarium={overview.primaryAquarium} />

        <section
          id="data"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          aria-label="Vue d'ensemble"
        >
          {overviewCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[1.35rem] border border-cyan-100/10 bg-slate-950/48 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {card.value}
                  </p>
                </div>
                <span className="rounded-2xl border border-cyan-100/10 bg-cyan-300/10 p-2 text-cyan-100">
                  <card.icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-400">{card.detail}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.75rem] border border-cyan-100/10 bg-white/[0.035] p-5 shadow-[0_22px_62px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-200/80">
                  Score sante
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Equilibre des aquariums
                </h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-100/10 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-100">
                <HeartPulse className="size-4" aria-hidden="true" />
                Historique journalier
              </span>
            </div>

            {overview.healthScores.length > 0 ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {overview.healthScores.map((item) => (
                  <Link
                    key={item.aquariumId}
                    href={`/aquariums/${item.aquariumId}`}
                    className="rounded-[1.25rem] border border-cyan-100/10 bg-slate-950/48 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200/20 hover:bg-cyan-300/8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          {item.aquariumName}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-white">
                          {item.score.score}/100
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          getHealthScoreTone(item.score.interpretation)
                        )}
                      >
                        {item.score.interpretation}
                      </span>
                    </div>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                      {item.score.summary}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-[1.25rem] border border-dashed border-cyan-200/18 bg-cyan-300/6 px-4 py-5 text-sm text-slate-300">
                Cree un aquarium pour calculer son score sante.
              </p>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-cyan-100/10 bg-white/[0.035] p-5 shadow-[0_22px_62px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-200/80">Bacs</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Aquariums recents
                </h2>
              </div>
              <Link
                href="/aquariums/new"
                className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 text-sm font-semibold text-slate-950 shadow-[0_18px_42px_rgba(34,211,238,0.2)] transition hover:bg-cyan-200"
              >
                <Plus className="size-4" aria-hidden="true" />
                Ajouter
              </Link>
            </div>

            {overview.recentAquariums.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {overview.recentAquariums.map((aquarium) => (
                  <Link
                    key={aquarium.id}
                    href={`/aquariums/${aquarium.id}`}
                    className="group flex items-center gap-4 rounded-[1.25rem] border border-cyan-100/10 bg-slate-950/46 p-3 transition hover:border-cyan-200/22 hover:bg-cyan-300/8"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-cyan-100/10 bg-cyan-300/8">
                      {aquarium.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={aquarium.photoUrl}
                          alt=""
                          className="h-full w-full object-cover brightness-75"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-cyan-100/72">
                          <Waves className="size-7" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {aquarium.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {aquarium.volume} · {aquarium.currentTemperature}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="size-5 shrink-0 text-cyan-100/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[1.25rem] border border-dashed border-cyan-200/18 bg-cyan-300/6 p-6 text-center">
                <Waves className="mx-auto size-9 text-cyan-100/70" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Aucun aquarium cree
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Ajoute ton premier bac pour activer le rendu vivant.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[1.75rem] border border-cyan-100/10 bg-white/[0.035] p-5 shadow-[0_22px_62px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-cyan-200/80">Statut</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Socle operationnel
                </h2>
              </div>
              <span className="rounded-full border border-sky-200/14 bg-sky-300/10 px-3 py-1 text-sm font-medium text-sky-100">
                Pret
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {readinessItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1rem] border border-cyan-100/10 bg-slate-950/42 px-3 py-3 text-sm font-medium text-slate-300"
                >
                  <Activity className="size-4 text-cyan-200" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-cyan-100/10 bg-white/[0.035] p-5 shadow-[0_22px_62px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-cyan-100/10 bg-cyan-300/10 p-2 text-cyan-100">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-cyan-200/80">IA</p>
                <h2 className="text-xl font-semibold text-white">
                  Illustration IA preparee
                </h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Le rendu actuel fonctionne sans API externe. Le service visuel est
              pret pour brancher plus tard une generation d&apos;image contextualisee
              cote serveur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
