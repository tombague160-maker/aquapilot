import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type AnimatedFishProps = {
  className?: string;
  color?: "cyan" | "teal" | "blue" | "gold";
  delay?: number;
  duration?: number;
  reverse?: boolean;
  scale?: number;
  top: string;
  depth?: "front" | "mid" | "back";
};

const colorClasses = {
  cyan: "from-cyan-200 via-sky-400 to-blue-700",
  teal: "from-teal-100 via-cyan-400 to-teal-700",
  blue: "from-blue-100 via-blue-500 to-indigo-800",
  gold: "from-amber-100 via-yellow-400 to-lime-700",
};

const depthClasses = {
  front: "z-30 opacity-95 blur-0",
  mid: "z-20 opacity-80 blur-[0.2px]",
  back: "z-10 opacity-48 blur-[0.7px]",
};

export function AnimatedFish({
  className,
  color = "cyan",
  delay = 0,
  duration = 22,
  reverse = false,
  scale = 1,
  top,
  depth = "mid",
}: AnimatedFishProps) {
  return (
    <span
      className={cn(
        "aqua-dashboard-fish absolute left-0 block h-3.5 w-9 rounded-full bg-linear-to-r shadow-[0_0_16px_rgba(34,211,238,0.22)]",
        colorClasses[color],
        depthClasses[depth],
        reverse && "aqua-dashboard-fish-reverse",
        className
      )}
      style={
        {
          "--fish-delay": `${delay}s`,
          "--fish-duration": `${duration}s`,
          "--fish-scale": scale,
          top,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 rounded-[0.15rem] bg-current opacity-70" />
      <span className="absolute right-1.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-white/85" />
      <span className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/70" />
    </span>
  );
}
