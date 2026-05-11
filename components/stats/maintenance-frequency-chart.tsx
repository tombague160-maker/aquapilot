"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MaintenanceFrequencyPoint } from "@/services/statistics-service";

type MaintenanceFrequencyChartProps = {
  data: MaintenanceFrequencyPoint[];
};

export function MaintenanceFrequencyChart({
  data,
}: MaintenanceFrequencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center">
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Aucun changement d&apos;eau dans la periode selectionnee.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
          <XAxis dataKey="date" stroke="#647882" fontSize={12} />
          <YAxis stroke="#647882" fontSize={12} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="count"
            name="Changements"
            fill="#0f6f8f"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="waterChangeLiters"
            name="Litres changes"
            fill="#16a6ac"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
