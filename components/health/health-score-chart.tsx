"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HealthScoreChartPoint } from "@/services/health-score-service";

type HealthScoreChartProps = {
  data: HealthScoreChartPoint[];
};

export function HealthScoreChart({ data }: HealthScoreChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center">
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          L&apos;evolution apparaitra apres le premier calcul du score sante.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
          <XAxis dataKey="date" stroke="#647882" fontSize={12} />
          <YAxis
            domain={[0, 100]}
            stroke="#647882"
            fontSize={12}
            tickCount={6}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            name="Score sante"
            stroke="#0f6f8f"
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
