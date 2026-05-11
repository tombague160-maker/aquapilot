import { Activity, Moon } from "lucide-react";

import { cn } from "@/lib/utils";

type AquariumHealthGaugeProps = {
  score: number | null;
  summary?: string;
  interpretation?: string;
  hasEnoughData: boolean;
  activeAlerts: number;
  overdueReminders: number;
};

function clampScore(score: number | null) {
  if (score === null || !Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getStatus(input: {
  score: number;
  hasEnoughData: boolean;
  activeAlerts: number;
  overdueReminders: number;
}) {
  if (!input.hasEnoughData) {
    return {
      label: "Donnees insuffisantes",
      description: "Ajoute un test d'eau pour affiner le score",
      tone: "empty" as const,
    };
  }

  if (input.score >= 90 && input.activeAlerts === 0) {
    return {
      label: "Etat du bac : Stable",
      description: "L'aquarium est sain et equilibre",
      tone: "stable" as const,
    };
  }

  if (input.score >= 75) {
    return {
      label: "Etat du bac : Bon",
      description: "Equilibre global satisfaisant",
      tone: "good" as const,
    };
  }

  if (input.score >= 50 || input.overdueReminders > 0) {
    return {
      label: "Etat du bac : A surveiller",
      description: "Quelques actions peuvent stabiliser le bac",
      tone: "watch" as const,
    };
  }

  return {
    label: "Etat du bac : Critique",
    description: "Une action rapide est recommandee",
    tone: "danger" as const,
  };
}

export function AquariumHealthGauge({
  score,
  summary,
  interpretation,
  hasEnoughData,
  activeAlerts,
  overdueReminders,
}: AquariumHealthGaugeProps) {
  const displayScore = clampScore(score);
  const status = getStatus({
    score: displayScore,
    hasEnoughData,
    activeAlerts,
    overdueReminders,
  });
  const segmentCount = 42;
  const activeSegments = Math.round((displayScore / 100) * segmentCount);
  const startAngle = 202;
  const endAngle = 338;
  const centerX = 180;
  const centerY = 190;
  const innerRadius = 129;
  const outerRadius = 158;
  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const progress = index / (segmentCount - 1);
    const angle = startAngle + (endAngle - startAngle) * progress;
    const radians = (angle * Math.PI) / 180;

    return {
      index,
      x1: centerX + Math.cos(radians) * innerRadius,
      y1: centerY + Math.sin(radians) * innerRadius,
      x2: centerX + Math.cos(radians) * outerRadius,
      y2: centerY + Math.sin(radians) * outerRadius,
      active: index < activeSegments,
      opacity: 0.55 + progress * 0.45,
    };
  });

  return (
    <section className="aqua-fade-up aqua-delay-1 relative isolate flex flex-col items-center px-1 pt-4 text-center">
      <div className="pointer-events-none absolute top-3 h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl" />
      <div className="relative h-[15.75rem] w-full max-w-[26rem] sm:h-[18rem] sm:max-w-[30rem]">
        <svg
          viewBox="0 0 360 230"
          className="aqua-arc-enter absolute inset-x-0 top-0 mx-auto h-full w-full overflow-visible drop-shadow-[0_18px_32px_rgba(0,0,0,0.22)]"
          role="img"
          aria-label={`Score sante ${score === null ? "indisponible" : displayScore}`}
        >
          <defs>
            <linearGradient id="aquaGaugeActive" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#29d987" />
              <stop offset="55%" stopColor="#39f2a4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="aquaGaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {segments.map((segment) => (
            <line
              key={segment.index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={
                segment.active
                  ? "url(#aquaGaugeActive)"
                  : "rgba(26, 87, 79, 0.62)"
              }
              strokeLinecap="round"
              strokeWidth="6"
              opacity={segment.active ? segment.opacity : 0.6}
            />
          ))}
        </svg>

        <div className="absolute inset-x-0 top-[5.35rem] flex flex-col items-center sm:top-[6.1rem]">
          <div className="aqua-breathe text-indigo-300/72 drop-shadow-[0_0_18px_rgba(129,140,248,0.34)]">
            {hasEnoughData ? (
              <Moon className="size-10 stroke-[2]" aria-hidden="true" />
            ) : (
              <Activity className="size-10 stroke-[2]" aria-hidden="true" />
            )}
          </div>
          <span className="mt-2 text-[5.9rem] font-semibold leading-none text-white drop-shadow-[0_14px_32px_rgba(0,0,0,0.3)] sm:text-[7rem]">
            {score === null ? "--" : displayScore}
          </span>
        </div>
      </div>

      <div className="relative -mt-4 max-w-sm">
        <div
          className={cn(
            "inline-flex items-center justify-center gap-2 text-xl font-semibold leading-tight sm:text-2xl",
            status.tone === "danger" ? "text-red-100" : "text-slate-100"
          )}
        >
          <span>{status.label}</span>
          <span
            className={cn(
              "size-3 rounded-full shadow-[0_0_18px_currentColor]",
              status.tone === "danger" && "bg-red-400 text-red-400",
              status.tone === "watch" && "bg-amber-300 text-amber-300",
              status.tone === "empty" && "bg-slate-300 text-slate-300",
              (status.tone === "stable" || status.tone === "good") &&
                "bg-emerald-400 text-emerald-400"
            )}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-lg leading-7 text-slate-300/76">
          {status.description}
        </p>
      </div>

      <p className="sr-only">
        {summary ??
          (hasEnoughData
            ? `Score ${interpretation ?? "calcule"} pour ce bac.`
            : "Le score sera plus fiable apres quelques mesures et entretiens.")}
      </p>
    </section>
  );
}
