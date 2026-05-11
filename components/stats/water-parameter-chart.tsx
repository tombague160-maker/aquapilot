"use client";

import type { ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WaterParameterStatsPoint } from "@/services/statistics-service";

type WaterParameterChartProps = {
  data: WaterParameterStatsPoint[];
};

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center">
      <p className="max-w-sm text-sm leading-6 text-slate-600">{label}</p>
    </div>
  );
}

function ChartFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="aqua-card p-5">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-5 h-72">{children}</div>
    </article>
  );
}

export function WaterParameterChart({ data }: WaterParameterChartProps) {
  if (data.length === 0) {
    return (
      <EmptyChartState label="Ajoute des mesures d'eau pour afficher les courbes de temperature, pH, duretes et composes azotes." />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartFrame title="Temperature et pH">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
            <XAxis dataKey="date" stroke="#647882" fontSize={12} />
            <YAxis stroke="#647882" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperatureC"
              name="Temperature"
              stroke="#0f6f8f"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="ph"
              name="pH"
              stroke="#16a6ac"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="KH, GH et TDS">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
            <XAxis dataKey="date" stroke="#647882" fontSize={12} />
            <YAxis stroke="#647882" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="kh"
              name="KH"
              stroke="#0ea5a8"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="gh"
              name="GH"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="tdsPpm"
              name="TDS"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="NO2, NO3, NH3/NH4 et PO4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
            <XAxis dataKey="date" stroke="#647882" fontSize={12} />
            <YAxis stroke="#647882" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="nitriteMgL"
              name="NO2"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="nitrateMgL"
              name="NO3"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="ammoniaMgL"
              name="NH3/NH4"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="phosphateMgL"
              name="PO4"
              stroke="#475569"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
