import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Leaf, Library, Plus, Scissors } from "lucide-react";

import { AddAquariumPlantForm } from "@/components/plants/add-aquarium-plant-form";
import { PlantCareBadge } from "@/components/plants/plant-care-badge";
import { requireUser } from "@/lib/auth/session";
import { getUserAquariumById } from "@/services/aquarium-service";
import {
  getAquariumPlantEntries,
  getPlantSpeciesOptions,
} from "@/services/plant-service";

export const dynamic = "force-dynamic";

type AquariumPlantsPageProps = {
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

export default async function AquariumPlantsPage({
  params,
}: AquariumPlantsPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const [plantEntries, speciesOptions] = await Promise.all([
    getAquariumPlantEntries(user.id, aquarium.id),
    getPlantSpeciesOptions(user.id),
  ]);
  const totalPlants = plantEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const warningCount = plantEntries.reduce(
    (sum, entry) =>
      sum + entry.analysis.filter((item) => item.status === "warning").length,
    0
  );
  const trimmingCount = plantEntries.filter((entry) =>
    entry.species.trimmingReminder.includes("jours")
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
            Plantes
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Suis les plantations, leur etat de sante et les besoins de culture
            du bac.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/species/plants"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            <Library className="size-4" aria-hidden="true" />
            Catalogue
          </Link>
          <a
            href="#new-plant"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
          >
            <Plus className="size-4" aria-hidden="true" />
            Ajouter
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Plants"
          value={totalPlants.toString()}
          helper="plant(s) actif(s)"
        />
        <StatCard
          label="Especes"
          value={plantEntries.length.toString()}
          helper="ligne(s) de plantation"
        />
        <StatCard
          label="Tailles a planifier"
          value={trimmingCount.toString()}
          helper={`${warningCount} point(s) a verifier`}
        />
      </section>

      <section id="new-plant" className="scroll-mt-24">
        <AddAquariumPlantForm
          aquariumId={aquarium.id}
          speciesOptions={speciesOptions}
        />
      </section>

      <section className="aqua-surface p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold text-slate-950">
            Plantation du bac
          </h2>
        </div>

        {plantEntries.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {plantEntries.map((entry) => (
              <article
                key={entry.id}
                className="aqua-card p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                      <Leaf className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <Link
                        href={`/species/plants/${entry.species.slug}`}
                        className="text-xl font-semibold text-slate-950 transition-colors hover:text-cyan-700"
                      >
                        {entry.species.commonName}
                      </Link>
                      <p className="mt-1 text-sm italic text-slate-500">
                        {entry.species.scientificName}
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        {entry.quantity} plant(s) ajoutes le {entry.plantedAt}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-96">
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-slate-500">Etat</p>
                      <p className="mt-1 font-medium text-slate-950">
                        {entry.statusLabel}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-slate-500">Position</p>
                      <p className="mt-1 font-medium text-slate-950">
                        {entry.placement}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-slate-500">Taille</p>
                      <p className="mt-1 font-medium text-slate-950">
                        {entry.species.trimmingReminder}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.analysis.map((badge) => (
                    <PlantCareBadge
                      key={`${entry.id}-${badge.label}`}
                      label={badge.label}
                      status={badge.status}
                      message={badge.message}
                    />
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 px-3 py-3">
                    <p className="text-sm text-slate-500">Lumiere</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {entry.species.lightNeed}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-3">
                    <p className="text-sm text-slate-500">CO2</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {entry.species.co2Need}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-3">
                    <p className="text-sm text-slate-500">Engrais</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {entry.species.fertilizerNeed}
                    </p>
                  </div>
                </div>

                {entry.notes ? (
                  <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    {entry.notes}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-cyan-200 bg-cyan-50/50 px-4 py-8 text-center text-sm text-slate-600">
            Aucune plante n&apos;est encore rattachee a cet aquarium.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-white p-2 text-cyan-700">
            <Scissors className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Rappel de taille recommande
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Les rappels affiches ici sont calcules depuis la fiche espece. Le
              module de rappels pourra ensuite transformer ces conseils en
              notifications planifiees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
