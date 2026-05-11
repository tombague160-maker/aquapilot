import Link from "next/link";
import { ArrowLeft, BarChart3, Settings } from "lucide-react";

type AquariumMobileHeaderProps = {
  aquariumId: string;
  title: string;
};

export function AquariumMobileHeader({
  aquariumId,
  title,
}: AquariumMobileHeaderProps) {
  return (
    <header className="aqua-fade-up sticky top-5 z-40 mx-auto flex h-20 w-full max-w-3xl items-center justify-between gap-3 text-white">
      <Link
        href="/aquariums"
        className="flex size-14 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-950/20 text-cyan-50 shadow-[0_18px_48px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition hover:border-cyan-300/45 hover:bg-cyan-300/10 sm:size-16"
        aria-label="Retour aux aquariums"
      >
        <ArrowLeft className="size-8 stroke-[2.3]" aria-hidden="true" />
      </Link>
      <div className="min-w-0 flex-1 px-1 text-center">
        <p className="truncate text-2xl font-semibold tracking-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.38)] sm:text-3xl">
          {title}
        </p>
        <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cyan-100/45">
          AquaPilot
        </p>
      </div>
      <div className="flex h-14 shrink-0 items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/20 px-3 text-cyan-50 shadow-[0_18px_48px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:h-16 sm:px-4">
        <Link
          href={`/aquariums/${aquariumId}/stats`}
          className="flex size-10 items-center justify-center rounded-full text-cyan-50 transition hover:bg-cyan-300/10 sm:size-11"
          aria-label="Statistiques"
        >
          <BarChart3 className="size-7 stroke-[2.1]" aria-hidden="true" />
        </Link>
        <Link
          href={`/aquariums/${aquariumId}/edit`}
          className="flex size-10 items-center justify-center rounded-full text-cyan-50 transition hover:bg-cyan-300/10 sm:size-11"
          aria-label="Reglages"
        >
          <Settings className="size-7 stroke-[2.1]" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
