import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock,
  Plus,
  Utensils,
} from "lucide-react";

import { FeedingForm } from "@/components/feeding/feeding-form";
import { requireUser } from "@/lib/auth/session";
import { getUserAquariumById } from "@/services/aquarium-service";
import {
  getFeedingLogs,
  getFeedingStats,
  getLatestFeedingLog,
} from "@/services/feeding-service";

export const dynamic = "force-dynamic";

type FeedingPageProps = {
  params: Promise<{
    id: string;
  }>;
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

export default async function FeedingPage({ params }: FeedingPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const [logs, stats, latestFeeding] = await Promise.all([
    getFeedingLogs(user.id, aquarium.id),
    getFeedingStats(user.id, aquarium.id),
    getLatestFeedingLog(user.id, aquarium.id),
  ]);

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
            Alimentation
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Suis les nourrissages, les quantites et les observations apres
            distribution pour garder un rythme stable.
          </p>
        </div>
        <a
          href="#new-feeding"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nouveau nourrissage
        </a>
      </section>

      {stats.isVeryFrequent ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm shadow-amber-950/5">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-white/70 p-2 text-amber-700">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold">
                Frequence de nourrissage elevee
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Cet aquarium a {stats.last24HoursCount} nourrissage(s) sur les
                dernieres 24 h et une moyenne de{" "}
                {stats.averagePerDayLast7.toFixed(1)} par jour sur 7 jours.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Dernieres 24 h"
          value={stats.last24HoursCount.toString()}
          helper="nourrissage(s)"
        />
        <StatCard
          label="Derniers 7 jours"
          value={stats.last7DaysCount.toString()}
          helper={`${stats.averagePerDayLast7.toFixed(1)} par jour en moyenne`}
        />
        <StatCard
          label="Type le plus utilise"
          value={stats.mostUsedFoodType}
          helper="sur les 7 derniers jours"
        />
        <StatCard
          label="Historique total"
          value={stats.totalCount.toString()}
          helper="entree(s) enregistree(s)"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Dernier nourrissage
              </h2>
              <p className="text-sm text-slate-500">
                {latestFeeding
                  ? latestFeeding.fedAtLabel
                  : "Aucun nourrissage enregistre"}
              </p>
            </div>
          </div>
          {latestFeeding ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-cyan-50 px-3 py-3">
                <p className="text-sm text-cyan-800">Nourriture</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {latestFeeding.foodTypeLabel}
                </p>
              </div>
              <div className="rounded-lg bg-cyan-50 px-3 py-3">
                <p className="text-sm text-cyan-800">Quantite</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {latestFeeding.amount}
                </p>
              </div>
              <div className="rounded-lg bg-cyan-50 px-3 py-3 sm:col-span-2">
                <p className="text-sm text-cyan-800">Especes concernees</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {latestFeeding.species}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-cyan-200 bg-cyan-50/50 px-4 py-5 text-sm text-slate-600">
              Ajoute un premier nourrissage pour visualiser le dernier repas de
              cet aquarium.
            </p>
          )}
        </article>

        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <BarChart3 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Frequence
              </h2>
              <p className="text-sm text-slate-500">
                Repere les routines trop denses ou les periodes sans suivi.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Moyenne 7 jours</span>
              <span className="font-semibold text-slate-950">
                {stats.averagePerDayLast7.toFixed(1)} / jour
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Seuil d&apos;alerte</span>
              <span className="font-semibold text-slate-950">
                4 / 24 h ou &gt; 2 / jour
              </span>
            </div>
          </div>
        </article>
      </section>

      <section id="new-feeding" className="scroll-mt-24">
        <FeedingForm aquariumId={aquarium.id} />
      </section>

      <section className="aqua-surface p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
            <Utensils className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold text-slate-950">
            Historique d&apos;alimentation
          </h2>
        </div>
        {logs.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Nourriture</th>
                  <th className="py-3 pr-4 font-medium">Quantite</th>
                  <th className="py-3 pr-4 font-medium">Especes</th>
                  <th className="py-3 pr-4 font-medium">Observation</th>
                  <th className="py-3 pr-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 pr-4 font-medium text-slate-950">
                      {log.fedAtLabel}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">
                        {log.foodTypeLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{log.amount}</td>
                    <td className="py-3 pr-4 text-slate-700">{log.species}</td>
                    <td className="max-w-80 py-3 pr-4 text-slate-600">
                      {log.observationAfter || "-"}
                    </td>
                    <td className="max-w-80 py-3 pr-4 text-slate-600">
                      {log.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Aucun nourrissage enregistre pour cet aquarium.
          </p>
        )}
      </section>
    </div>
  );
}
