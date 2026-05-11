import { cn } from "@/lib/utils";
import type { WaterMetricSnapshot } from "@/services/water-parameter-service";

type WaterStatusBadgeProps = {
  metric: WaterMetricSnapshot;
};

const statusLabel = {
  ok: "OK",
  warning: "A surveiller",
  missing: "Manquant",
};

export function WaterStatusBadge({ metric }: WaterStatusBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-3 shadow-sm transition-colors",
        metric.status === "ok" && "border-emerald-200 bg-emerald-50/80",
        metric.status === "warning" && "border-amber-200 bg-amber-50/90",
        metric.status === "missing" && "border-slate-200 bg-slate-50/90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-1 font-semibold text-slate-950">
            {metric.displayValue}
          </p>
        </div>
        <span
          className={cn(
            "rounded-lg border px-2 py-1 text-xs font-medium",
            metric.status === "ok" && "bg-emerald-100 text-emerald-800",
            metric.status === "warning" && "border-amber-200 bg-amber-100 text-amber-800",
            metric.status === "missing" && "border-slate-200 bg-slate-100 text-slate-600"
          )}
        >
          {statusLabel[metric.status]}
        </span>
      </div>
    </div>
  );
}
