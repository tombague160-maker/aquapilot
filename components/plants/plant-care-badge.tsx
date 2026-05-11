import { AlertTriangle, CheckCircle2, HelpCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlantCareStatus } from "@/services/plant-service";

type PlantCareBadgeProps = {
  label: string;
  status: PlantCareStatus;
  message: string;
};

const statusStyles: Record<PlantCareStatus, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  unknown: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

const statusIcons = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  unknown: HelpCircle,
  info: Info,
};

export function PlantCareBadge({ label, status, message }: PlantCareBadgeProps) {
  const Icon = statusIcons[status];

  return (
    <span
      title={message}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium shadow-sm",
        statusStyles[status]
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
