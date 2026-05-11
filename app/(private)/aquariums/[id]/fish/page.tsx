import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Fish, Library, Plus, UsersRound } from "lucide-react";

import { AddAquariumFishForm } from "@/components/fish/add-aquarium-fish-form";
import { FishCompatibilityBadge } from "@/components/fish/fish-compatibility-badge";
import { requireUser } from "@/lib/auth/session";
import { getUserAquariumById } from "@/services/aquarium-service";
import {
  getAquariumFishEntries,
  getFishSpeciesOptions,
} from "@/services/fish-service";

export const dynamic = "force-dynamic";

type AquariumFishPageProps = {
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

export default async function AquariumFishPage({ params }: AquariumFishPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const aquarium = await getUserAquariumById(user.id, id);

  if (!aquarium) {
    notFound();
  }

  const [fishEntries, speciesOptions] = await Promise.all([
    getAquariumFishEntries(user.id, aquarium.id),
    getFishSpeciesOptions(user.id),
  ]);
  const totalFish = fishEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const warningCount = fishEntries.reduce(
    (sum, entry) =>
      sum + entry.analysis.filter((item) => item.status === "warning").length,
    0
  );

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
            Poissons
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Gere la population du bac et controle les besoins de base de chaque
            espece.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/species/fish"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            <Library className="size-4" aria-hidden="true" />
            Catalogue
          </Link>
          <a
            href="#new-fish"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
          >
            <Plus className="size-4" aria-hidden="true" />
            Ajouter
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Individus"
          value={totalFish.toString()}
          helper="poisson(s) actif(s)"
        />
        <StatCard
          label="Especes"
          value={fishEntries.length.toString()}
          helper="ligne(s) de population"
        />
        <StatCard
          label="Points a verifier"
          value={warningCount.toString()}
          helper="badges de compatibilite"
        />
      </section>

      <section id="new-fish" className="scroll-mt-24">
        <AddAquariumFishForm
          aquariumId={aquarium.id}
          speciesOptions={speciesOptions}
        />
      </section>

      <section className="aqua-surface p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
            <UsersRound className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold text-slate-950">
            Population du bac
          </h2>
        </div>

        {fishEntries.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {fishEntries.map((entry) => (
              <article
                key={entry.id}
                className="aqua-card p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                      <Fish className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <Link
                        href={`/species/fish/${entry.species.slug}`}
                        className="text-xl font-semibold text-slate-950 transition-colors hover:text-cyan-700"
                      >
                        {entry.species.commonName}
                      </Link>
                      <p className="mt-1 text-sm italic text-slate-500">
                        {entry.species.scientificName}
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        {entry.quantity} individu(s) ajoutes le{" "}
                        {entry.acquiredAt}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-96">
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-slate-500">Zone</p>
                      <p className="mt-1 font-medium text-slate-950">
                        {entry.species.swimmingZone}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-slate-500">Taille</p>
                      <p className="mt-1 font-medium text-slate-950">
                        {entry.species.adultSize}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-slate-500">Groupe</p>
                      <p className="mt-1 font-medium text-slate-950">
                        {entry.species.minGroupSize}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.analysis.map((badge) => (
                    <FishCompatibilityBadge
                      key={`${entry.id}-${badge.label}`}
                      label={badge.label}
                      status={badge.status}
                      message={badge.message}
                    />
                  ))}
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
            Aucun poisson n&apos;est encore rattache a cet aquarium.
          </p>
        )}
      </section>
    </div>
  );
}
