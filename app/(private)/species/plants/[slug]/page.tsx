import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Leaf, Scissors, ShieldCheck } from "lucide-react";

import { PlantCareBadge } from "@/components/plants/plant-care-badge";
import { requireUser } from "@/lib/auth/session";
import { getPlantSpeciesBySlug } from "@/services/plant-service";

export const dynamic = "force-dynamic";

type PlantSpeciesDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-950">{value}</p>
    </div>
  );
}

export default async function PlantSpeciesDetailPage({
  params,
}: PlantSpeciesDetailPageProps) {
  const { slug } = await params;
  const user = await requireUser();
  const species = await getPlantSpeciesBySlug(user.id, slug);

  if (!species) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Link
        href="/species/plants"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour aux plantes
      </Link>

      <section className="rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Fiche plante</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {species.commonName}
            </h1>
            <p className="mt-2 text-base italic text-slate-500">
              {species.scientificName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {species.careBadges.map((badge) => (
              <PlantCareBadge
                key={badge.label}
                label={badge.label}
                status={badge.status}
                message={badge.message}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Difficulte" value={species.difficulty} />
        <DetailItem label="Besoin lumiere" value={species.lightNeed} />
        <DetailItem label="Besoin CO2" value={species.co2Need} />
        <DetailItem label="Besoin engrais" value={species.fertilizerNeed} />
        <DetailItem label="Croissance" value={species.growthRate} />
        <DetailItem label="Placement" value={species.placement} />
        <DetailItem label="Temperature" value={species.temperatureRange} />
        <DetailItem label="pH" value={species.phRange} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-950">
              Besoins de culture
            </h2>
          </div>
          <div className="mt-5 grid gap-3">
            <DetailItem label="Lumiere" value={species.lightNeed} />
            <DetailItem label="CO2" value={species.co2Need} />
            <DetailItem label="Engrais" value={species.fertilizerNeed} />
          </div>
        </article>

        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <Scissors className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-950">
              Entretien recommande
            </h2>
          </div>
          <div className="mt-5 grid gap-3">
            <DetailItem label="Rappel de taille" value={species.trimmingReminder} />
            <DetailItem label="Vitesse de croissance" value={species.growthRate} />
            <DetailItem label="Famille" value={species.family} />
          </div>
        </article>
      </section>

      <section className="aqua-surface p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold text-slate-950">Notes</h2>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {species.notes || "Aucune note pour cette plante."}
        </p>
      </section>
    </div>
  );
}
