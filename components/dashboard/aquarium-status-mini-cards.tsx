import { Bell, Fish, HeartPulse, Leaf, Thermometer, TriangleAlert } from "lucide-react";

type AquariumStatusMiniCardsProps = {
  score: number | null;
  temperature: string;
  activeAlerts: number;
  pendingReminders: number;
  fishCount: number;
  plantCount: number;
};

export function AquariumStatusMiniCards({
  score,
  temperature,
  activeAlerts,
  pendingReminders,
  fishCount,
  plantCount,
}: AquariumStatusMiniCardsProps) {
  const cards = [
    {
      label: "Score",
      value: score !== null ? `${score}/100` : "N/A",
      icon: HeartPulse,
      tone: "text-emerald-200",
    },
    {
      label: "Temperature",
      value: temperature,
      icon: Thermometer,
      tone: "text-cyan-200",
    },
    {
      label: "Alertes",
      value: activeAlerts.toString(),
      icon: TriangleAlert,
      tone: activeAlerts > 0 ? "text-amber-200" : "text-cyan-200",
    },
    {
      label: "Rappels",
      value: pendingReminders.toString(),
      icon: Bell,
      tone: "text-blue-100",
    },
    {
      label: "Poissons",
      value: fishCount.toString(),
      icon: Fish,
      tone: "text-sky-200",
    },
    {
      label: "Plantes",
      value: plantCount.toString(),
      icon: Leaf,
      tone: "text-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[1.2rem] border border-cyan-100/10 bg-slate-950/42 p-3 shadow-[0_16px_38px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <card.icon className={`size-4 ${card.tone}`} aria-hidden="true" />
          </div>
          <p className="mt-2 text-lg font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
