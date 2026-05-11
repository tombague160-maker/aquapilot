"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AlertHistoryPoint } from "@/services/statistics-service";

type AlertHistoryChartProps = {
  data: AlertHistoryPoint[];
};

export function AlertHistoryChart({ data }: AlertHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center">
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Aucune alerte dans la periode selectionnee.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
          <XAxis dataKey="date" stroke="#647882" fontSize={12} />
          <YAxis stroke="#647882" fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="information"
            name="Information"
            stackId="alerts"
            fill="#38bdf8"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="attention"
            name="Attention"
            stackId="alerts"
            fill="#f59e0b"
          />
          <Bar
            dataKey="important"
            name="Important"
            stackId="alerts"
            fill="#f97316"
          />
          <Bar
            dataKey="critical"
            name="Critique"
            stackId="alerts"
            fill="#dc2626"
            radius={[6, 6, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="resolved"
            name="Resolues"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
