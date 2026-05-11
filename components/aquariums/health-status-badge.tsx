import { cn } from "@/lib/utils";

type HealthStatusBadgeProps = {
  label: string;
  description: string;
  tone: "stable" | "good" | "watch" | "danger" | "empty";
};

const toneClasses = {
  stable: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  good: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  watch: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  danger: "border-red-300/25 bg-red-400/10 text-red-100",
  empty: "border-slate-300/20 bg-white/8 text-slate-100",
};

const dotClasses = {
  stable: "bg-emerald-300 shadow-emerald-300/70",
  good: "bg-cyan-300 shadow-cyan-300/70",
  watch: "bg-amber-300 shadow-amber-300/70",
  danger: "bg-red-300 shadow-red-300/70",
  empty: "bg-slate-300 shadow-slate-300/50",
};

export function HealthStatusBadge({
  label,
  description,
  tone,
}: HealthStatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-full border px-4 py-2 text-left shadow-lg shadow-black/10 backdrop-blur-xl",
        toneClasses[tone]
      )}
    >
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full shadow-[0_0_18px_currentColor]",
          dotClasses[tone]
        )}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase">
          {label}
        </span>
        <span className="block truncate text-xs opacity-80">{description}</span>
      </span>
    </div>
  );
}
