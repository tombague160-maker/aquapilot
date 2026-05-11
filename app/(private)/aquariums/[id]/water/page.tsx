import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarRange, FlaskConical, Plus } from "lucide-react";

import { WaterCharts } from "@/components/water/water-charts";
import { WaterParameterForm } from "@/components/water/water-parameter-form";
import { WaterStatusBadge } from "@/components/water/water-status-badge";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getWaterPeriod, waterPeriodOptions } from "@/rules/water-parameter";
import { getUserAquariumById } from "@/services/aquarium-service";
import { getWaterMeasurements } from "@/services/water-parameter-service";

export const dynamic = "force-dynamic";

type WaterPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    period?: string | string[];
  }>;
};

export default async function WaterPage({ params, searchParams }: WaterPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const period = getWaterPeriod(query.period);
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const measurements = await getWaterMeasurements(user.id, aquarium.id, period);
  const latestMeasurement = measurements[0] ?? null;

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
          <p className="text-sm font-medium text-cyan-700">
            {aquarium.name}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Parametres de l&apos;eau
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Ajoute les tests d&apos;eau, surveille les valeurs manquantes et
            suis les tendances dans le temps.
          </p>
        </div>
        <a
          href="#new-measurement"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nouvelle mesure
        </a>
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
                Filtre l&apos;historique et les graphiques.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {waterPeriodOptions.map((option) => (
              <Link
                key={option.value}
                href={`/aquariums/${aquarium.id}/water?period=${option.value}`}
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

      {latestMeasurement ? (
        <section className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <FlaskConical className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Derniere mesure
              </h2>
              <p className="text-sm text-slate-500">
                {latestMeasurement.measuredAtLabel}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {latestMeasurement.metrics.map((metric) => (
              <WaterStatusBadge key={metric.key} metric={metric} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-cyan-200 bg-white p-8 text-center shadow-sm shadow-cyan-950/5">
          <FlaskConical className="mx-auto size-10 text-cyan-700" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            Aucune mesure pour cette periode
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ajoute une premiere mesure pour activer les badges et les graphiques.
          </p>
        </section>
      )}

      <WaterCharts measurements={measurements} />

      <section
        id="new-measurement"
        className="scroll-mt-24"
        aria-label="Ajouter une mesure"
      >
        <WaterParameterForm aquariumId={aquarium.id} />
      </section>

      <section className="aqua-surface p-6">
        <h2 className="text-xl font-semibold text-slate-950">
          Historique des mesures
        </h2>
        {measurements.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Temp.</th>
                  <th className="py-3 pr-4 font-medium">pH</th>
                  <th className="py-3 pr-4 font-medium">KH</th>
                  <th className="py-3 pr-4 font-medium">GH</th>
                  <th className="py-3 pr-4 font-medium">NO2</th>
                  <th className="py-3 pr-4 font-medium">NO3</th>
                  <th className="py-3 pr-4 font-medium">NH3/NH4</th>
                  <th className="py-3 pr-4 font-medium">PO4</th>
                  <th className="py-3 pr-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {measurements.map((measurement) => {
                  const metricMap = new Map(
                    measurement.metrics.map((metric) => [metric.key, metric])
                  );

                  return (
                    <tr key={measurement.id}>
                      <td className="py-3 pr-4 font-medium text-slate-950">
                        {measurement.measuredAtLabel}
                      </td>
                      {[
                        "temperatureC",
                        "ph",
                        "kh",
                        "gh",
                        "nitriteMgL",
                        "nitrateMgL",
                        "ammoniaMgL",
                        "phosphateMgL",
                      ].map((key) => {
                        const metric = metricMap.get(key);

                        return (
                          <td key={key} className="py-3 pr-4 text-slate-700">
                            <span
                              className={cn(
                                "rounded-lg px-2 py-1 text-xs font-medium",
                                metric?.status === "warning" &&
                                  "bg-amber-100 text-amber-800",
                                metric?.status === "missing" &&
                                  "bg-slate-100 text-slate-500",
                                metric?.status === "ok" &&
                                  "bg-emerald-100 text-emerald-800"
                              )}
                            >
                              {metric?.displayValue ?? "Manquant"}
                            </span>
                          </td>
                        );
                      })}
                      <td className="max-w-72 py-3 pr-4 text-slate-600">
                        {measurement.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Aucune mesure dans l&apos;historique selectionne.
          </p>
        )}
      </section>
    </div>
  );
}
