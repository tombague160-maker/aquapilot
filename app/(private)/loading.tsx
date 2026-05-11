import { Loader2, Waves } from "lucide-react";

export default function PrivateLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center">
      <div className="aqua-surface flex w-full max-w-sm flex-col items-center p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-lg border border-sky-300/20 bg-blue-500/10 text-sky-300">
          <Waves className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-lg font-semibold text-slate-50">
          Chargement d&apos;AquaPilot
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Recuperation des donnees de l&apos;aquarium.
        </p>
        <Loader2 className="mt-5 size-5 animate-spin text-sky-300" aria-hidden="true" />
      </div>
    </div>
  );
}
