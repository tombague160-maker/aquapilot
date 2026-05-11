import Link from "next/link";
import { Plus, Waves } from "lucide-react";

import { AquariumCard } from "@/components/aquariums/aquarium-card";
import { requireUser } from "@/lib/auth/session";
import { getUserAquariums } from "@/services/aquarium-service";

export const dynamic = "force-dynamic";

export default async function AquariumsPage() {
  const user = await requireUser();
  const aquariums = await getUserAquariums(user.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="aqua-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex rounded-lg bg-cyan-50 px-2.5 py-1 text-sm font-medium text-cyan-800">
            Aquariums
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Mes aquariums
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Tous les bacs affiches ici appartiennent uniquement a ton compte.
          </p>
        </div>
        <Link
          href="/aquariums/new"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white shadow-sm shadow-cyan-700/20 transition-colors hover:bg-cyan-800"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nouvel aquarium
        </Link>
      </section>

      {aquariums.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aquariums.map((aquarium) => (
            <AquariumCard key={aquarium.id} aquarium={aquarium} />
          ))}
        </section>
      ) : (
        <section className="aqua-empty min-h-80 bg-white/90 p-8">
          <span className="flex size-14 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
            <Waves className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">
            Aucun aquarium pour le moment
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Cree ton premier bac pour commencer a structurer ses parametres,
            son materiel et son historique.
          </p>
          <Link
            href="/aquariums/new"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-medium text-white shadow-sm shadow-cyan-700/20 transition-colors hover:bg-cyan-800"
          >
            <Plus className="size-4" aria-hidden="true" />
            Creer un aquarium
          </Link>
        </section>
      )}
    </div>
  );
}
