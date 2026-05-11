import Link from "next/link";
import { ArrowUpRight, Plus, Waves } from "lucide-react";

import {
  buildAquariumVisualFromPhoto,
  type AquariumVisualSource,
} from "@/ai/aquarium-visual-service";
import { AnimatedAquariumPreview } from "@/components/dashboard/animated-aquarium-preview";
import { AquariumPhotoUpload } from "@/components/dashboard/aquarium-photo-upload";
import { AquariumStatusMiniCards } from "@/components/dashboard/aquarium-status-mini-cards";
import type { HealthScoreSnapshot } from "@/services/health-score-service";

type PrimaryAquarium = AquariumVisualSource & {
  typeLabel: string;
  volume: string;
  temperature: string;
  score: HealthScoreSnapshot | null;
  activeAlerts: number;
  pendingReminders: number;
};

type AquariumHeroDashboardProps = {
  aquarium: PrimaryAquarium | null;
};

export function AquariumHeroDashboard({ aquarium }: AquariumHeroDashboardProps) {
  if (!aquarium) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200/12 bg-[radial-gradient(circle_at_50%_0%,rgba(8,145,178,0.22),transparent_34%),linear-gradient(180deg,#071827,#020611)] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="absolute inset-0 aqua-dashboard-caustics opacity-30" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-cyan-200/14 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              AquaPilot
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Cree ton premier bac vivant
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Ajoute un aquarium pour activer le rendu sombre, les poissons
              animes, les mesures et le suivi sante.
            </p>
            <Link
              href="/aquariums/new"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_42px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200"
            >
              <Plus className="size-4" aria-hidden="true" />
              Creer mon premier aquarium
            </Link>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[1.75rem] border border-cyan-100/10 bg-slate-950/58">
            <div className="absolute inset-0 flex items-center justify-center">
              <Waves className="size-24 text-cyan-100/24" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const visual = buildAquariumVisualFromPhoto(aquarium);

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-cyan-200/12 bg-[radial-gradient(circle_at_50%_-10%,rgba(45,212,191,0.18),transparent_34%),linear-gradient(180deg,#081d2b_0%,#06101d_55%,#02050c_100%)] p-4 text-white shadow-[0_34px_100px_rgba(0,0,0,0.52)] sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.06),transparent_28%,rgba(34,211,238,0.05)_64%,transparent)]" />
      <div className="relative z-10 grid gap-5 xl:grid-cols-[1.18fr_0.82fr] xl:items-stretch">
        <AnimatedAquariumPreview imageUrl={visual.imageUrl} name={aquarium.name} />

        <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-cyan-100/10 bg-slate-950/38 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex rounded-full border border-cyan-200/16 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/84">
                  Mon bac principal
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {aquarium.name}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {aquarium.typeLabel} · {aquarium.volume}
                </p>
              </div>
              <Link
                href={`/aquariums/${aquarium.aquariumId}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-cyan-200/14 bg-white/8 text-cyan-50 transition hover:bg-cyan-300/12"
                aria-label="Ouvrir le bac"
              >
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              Ta photo sert de base visuelle. AquaPilot ajoute une couche sombre,
              des reflets d&apos;eau, des poissons animes et une ambiance cyan
              premium sans appel IA externe.
            </p>
          </div>

          <AquariumStatusMiniCards
            score={aquarium.score?.score ?? null}
            temperature={aquarium.temperature}
            activeAlerts={aquarium.activeAlerts}
            pendingReminders={aquarium.pendingReminders}
            fishCount={aquarium.fishCount}
            plantCount={aquarium.plantCount}
          />

          <AquariumPhotoUpload
            aquariumId={aquarium.aquariumId}
            hasPhoto={Boolean(aquarium.photoUrl)}
          />
        </div>
      </div>
    </section>
  );
}
