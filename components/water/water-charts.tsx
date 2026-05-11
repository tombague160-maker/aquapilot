"use client";

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

import type { WaterParameterEntry } from "@/services/water-parameter-service";

type WaterChartsProps = {
  measurements: WaterParameterEntry[];
};

export function WaterCharts({ measurements }: WaterChartsProps) {
  const chartData = measurements
    .slice()
    .reverse()
    .map((measurement) => measurement.chart);

  if (chartData.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-cyan-200 bg-white p-6 text-center shadow-sm shadow-slate-950/5">
        <h2 className="text-xl font-semibold text-slate-950">Graphiques</h2>
        <p className="mt-2 text-sm text-slate-600">
          Les courbes apparaitront apres la premiere mesure.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
      <h2 className="text-xl font-semibold text-slate-950">Graphiques</h2>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
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
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ea" />
              <XAxis dataKey="date" stroke="#647882" fontSize={12} />
              <YAxis stroke="#647882" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="nitriteMgL"
                name="NO2"
                stroke="#c23b3b"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="nitrateMgL"
                name="NO3"
                stroke="#f2b84b"
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
                stroke="#647882"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
