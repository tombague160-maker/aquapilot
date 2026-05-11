import Link from "next/link";
import { Fish, Ruler, Search } from "lucide-react";

import { FishCompatibilityBadge } from "@/components/fish/fish-compatibility-badge";
import { requireUser } from "@/lib/auth/session";
import { getFishSpeciesCatalog } from "@/services/fish-service";

export const dynamic = "force-dynamic";

export default async function FishSpeciesCatalogPage() {
  const user = await requireUser();
  const species = await getFishSpeciesCatalog(user.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-cyan-100 bg-white p-6 shadow-sm shadow-cyan-950/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">
              Catalogue AquaPilot
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              Especes de poissons
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Consulte les besoins des especes d&apos;eau douce avant de les
              ajouter a un aquarium.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800">
            <Search className="size-4" aria-hidden="true" />
            {species.length} espece(s)
          </div>
        </div>
      </section>

      {species.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {species.map((item) => (
            <article
              key={item.id}
              className="flex flex-col aqua-card p-5"
            >
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                  <Fish className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {item.commonName}
                  </h2>
                  <p className="mt-1 text-sm italic text-slate-500">
                    {item.scientificName}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-500">Volume minimum</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {item.minTank}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-500">Taille adulte</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {item.adultSize}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.analysisBadges.map((badge) => (
                  <FishCompatibilityBadge
                    key={`${item.id}-${badge.label}`}
                    label={badge.label}
                    status={badge.status}
                    message={badge.message}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-1 items-end">
                <Link
                  href={`/species/fish/${item.slug}`}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-800"
                >
                  <Ruler className="size-4" aria-hidden="true" />
                  Voir la fiche
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-cyan-200 bg-cyan-50/50 px-4 py-8 text-center text-sm text-slate-600">
          Aucune espece de poisson n&apos;est encore disponible.
        </p>
      )}
    </div>
  );
}
