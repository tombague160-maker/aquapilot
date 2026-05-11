import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Droplets, Plus, Wrench } from "lucide-react";

import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  getMaintenanceFilter,
  maintenanceFilterOptions,
} from "@/rules/maintenance";
import { getUserAquariumById } from "@/services/aquarium-service";
import {
  getLatestWaterChange,
  getMaintenanceLogs,
} from "@/services/maintenance-service";

export const dynamic = "force-dynamic";

type MaintenancePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    type?: string | string[];
  }>;
};

export default async function MaintenancePage({
  params,
  searchParams,
}: MaintenancePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const typeFilter = getMaintenanceFilter(query.type);
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const [logs, latestWaterChange] = await Promise.all([
    getMaintenanceLogs(user.id, aquarium.id, typeFilter),
    getLatestWaterChange(user.id, aquarium.id),
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
          <p className="text-sm font-medium text-cyan-700">
            {aquarium.name}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Entretien
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Journalise les gestes d&apos;entretien et garde une trace claire des
            changements d&apos;eau.
          </p>
        </div>
        <a
          href="#new-maintenance"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nouvel entretien
        </a>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <Droplets className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Dernier changement d&apos;eau
              </h2>
              <p className="text-sm text-slate-500">
                {latestWaterChange
                  ? latestWaterChange.performedAtLabel
                  : "Aucun changement enregistre"}
              </p>
            </div>
          </div>
          {latestWaterChange ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-cyan-50 px-3 py-3">
                <p className="text-sm text-cyan-800">Volume</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {latestWaterChange.waterChangeLiters}
                </p>
              </div>
              <div className="rounded-lg bg-cyan-50 px-3 py-3">
                <p className="text-sm text-cyan-800">Pourcentage</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {latestWaterChange.waterChangePercent}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-cyan-200 bg-cyan-50/50 px-4 py-5 text-sm text-slate-600">
              Ajoute un entretien de type changement d&apos;eau pour afficher ce
              resume.
            </p>
          )}
        </article>

        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Filtres</h2>
              <p className="text-sm text-slate-500">
                Affiche l&apos;historique par type d&apos;entretien.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {maintenanceFilterOptions.map((option) => (
              <Link
                key={option.value}
                href={`/aquariums/${aquarium.id}/maintenance?type=${option.value}`}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors",
                  typeFilter === option.value
                    ? "border-cyan-700 bg-cyan-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section id="new-maintenance" className="scroll-mt-24">
        <MaintenanceForm aquariumId={aquarium.id} />
      </section>

      <section className="aqua-surface p-6">
        <h2 className="text-xl font-semibold text-slate-950">
          Historique d&apos;entretien
        </h2>
        {logs.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Volume</th>
                  <th className="py-3 pr-4 font-medium">Pourcentage</th>
                  <th className="py-3 pr-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 pr-4 font-medium text-slate-950">
                      {log.performedAtLabel}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">
                        {log.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {log.waterChangeLiters}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {log.waterChangePercent}
                    </td>
                    <td className="max-w-96 py-3 pr-4 text-slate-600">
                      {log.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Aucun entretien ne correspond au filtre selectionne.
          </p>
        )}
      </section>
    </div>
  );
}
