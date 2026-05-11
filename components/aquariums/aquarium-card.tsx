import Link from "next/link";
import { ArrowUpRight, Droplets, Thermometer, Waves } from "lucide-react";

import type { AquariumSummary } from "@/services/aquarium-service";

type AquariumCardProps = {
  aquarium: AquariumSummary;
};

export function AquariumCard({ aquarium }: AquariumCardProps) {
  return (
    <Link
      href={`/aquariums/${aquarium.id}`}
      className="group aqua-card block overflow-hidden"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-slate-950">
        {aquarium.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={aquarium.photoUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-500/10 text-sky-300 shadow-sm shadow-blue-950/30">
            <Waves className="size-10" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-sky-500/10" />
        <span className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg border border-sky-300/25 bg-slate-950/75 text-sky-200 shadow-sm shadow-blue-950/30 backdrop-blur transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex rounded-lg border border-sky-300/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-sky-200">
              {aquarium.typeLabel}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-50">
              {aquarium.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Mise en eau : {aquarium.startedAt}
            </p>
          </div>
          <span className="rounded-lg border border-sky-300/20 bg-blue-500/10 p-2 text-sky-300 shadow-sm shadow-blue-950/30">
            <Droplets className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-blue-400/15 bg-slate-950/65 px-3 py-2">
            <p className="text-slate-400">Volume</p>
            <p className="mt-1 font-medium text-slate-50">{aquarium.volume}</p>
          </div>
          <div className="rounded-lg border border-blue-400/15 bg-slate-950/65 px-3 py-2">
            <p className="text-slate-400">Temperature</p>
            <p className="mt-1 inline-flex items-center gap-1 font-medium text-slate-50">
              <Thermometer className="size-3.5" aria-hidden="true" />
              {aquarium.currentTemperature}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
