import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Fish, Leaf, ShieldCheck } from "lucide-react";

import { FishCompatibilityBadge } from "@/components/fish/fish-compatibility-badge";
import { requireUser } from "@/lib/auth/session";
import { getFishSpeciesBySlug } from "@/services/fish-service";

export const dynamic = "force-dynamic";

type FishSpeciesDetailPageProps = {
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

export default async function FishSpeciesDetailPage({
  params,
}: FishSpeciesDetailPageProps) {
  const { slug } = await params;
  const user = await requireUser();
  const species = await getFishSpeciesBySlug(user.id, slug);

  if (!species) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Link
        href="/species/fish"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour aux especes
      </Link>

      <section className="rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">
              Fiche espece
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {species.commonName}
            </h1>
            <p className="mt-2 text-base italic text-slate-500">
              {species.scientificName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {species.analysisBadges.map((badge) => (
              <FishCompatibilityBadge
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
        <DetailItem label="Taille adulte" value={species.adultSize} />
        <DetailItem label="Volume minimum" value={species.minTank} />
        <DetailItem label="Temperature" value={species.temperatureRange} />
        <DetailItem label="pH" value={species.phRange} />
        <DetailItem label="GH" value={species.ghRange} />
        <DetailItem label="Groupe minimum" value={species.minGroupSize} />
        <DetailItem label="Zone de nage" value={species.swimmingZone} />
        <DetailItem label="Difficulte" value={species.difficulty} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <Fish className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-950">
              Comportement
            </h2>
          </div>
          <div className="mt-5 grid gap-3">
            <DetailItem label="Comportement" value={species.behavior} />
            <DetailItem label="Regime alimentaire" value={species.diet} />
            <DetailItem label="Esperance de vie" value={species.lifeExpectancy} />
          </div>
        </article>

        <article className="aqua-surface p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-950">
              Compatibilites
            </h2>
          </div>
          <div className="mt-5 grid gap-3">
            <DetailItem
              label="Compatibilite crevettes"
              value={species.shrimpCompatibility}
            />
            <DetailItem
              label="Compatibilite plantes"
              value={species.plantCompatibility}
            />
            <DetailItem label="Origine" value={species.origin} />
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
          {species.notes || "Aucune note pour cette espece."}
        </p>
      </section>
    </div>
  );
}
