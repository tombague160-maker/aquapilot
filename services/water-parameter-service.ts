import { prisma } from "@/lib/prisma";
import {
  getWaterMetricStatus,
  getWaterPeriodDate,
  waterMetricDefinitions,
  type WaterPeriod,
} from "@/rules/water-parameter";

type DecimalLike = {
  toString(): string;
};

type RawWaterParameter = {
  id: string;
  measuredAt: Date;
  temperatureC: DecimalLike | null;
  ph: DecimalLike | null;
  gh: number | null;
  kh: number | null;
  ammoniaMgL: DecimalLike | null;
  nitriteMgL: DecimalLike | null;
  nitrateMgL: DecimalLike | null;
  phosphateMgL: DecimalLike | null;
  ironMgL: DecimalLike | null;
  tdsPpm: number | null;
  oxygenMgL: DecimalLike | null;
  co2MgL: DecimalLike | null;
  chlorineMgL: DecimalLike | null;
  notes: string | null;
};

export type WaterMetricSnapshot = {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  displayValue: string;
  status: "ok" | "warning" | "missing";
};

export type WaterParameterEntry = {
  id: string;
  measuredAt: string;
  measuredAtLabel: string;
  notes: string | null;
  metrics: WaterMetricSnapshot[];
  chart: {
    date: string;
    temperatureC: number | null;
    ph: number | null;
    nitriteMgL: number | null;
    nitrateMgL: number | null;
    ammoniaMgL: number | null;
    phosphateMgL: number | null;
  };
};

const waterParameterSelect = {
  id: true,
  measuredAt: true,
  temperatureC: true,
  ph: true,
  gh: true,
  kh: true,
  ammoniaMgL: true,
  nitriteMgL: true,
  nitrateMgL: true,
  phosphateMgL: true,
  ironMgL: true,
  tdsPpm: true,
  oxygenMgL: true,
  co2MgL: true,
  chlorineMgL: true,
  notes: true,
} as const;

function decimalToNumber(value: DecimalLike | null) {
  return value === null ? null : Number(value.toString());
}

function numberToDisplay(value: number | null, unit: string) {
  if (value === null) {
    return "Manquant";
  }

  return unit ? `${value} ${unit}` : value.toString();
}

function getMetricValue(
  measurement: RawWaterParameter,
  key: WaterMetricSnapshot["key"]
) {
  const value = measurement[key as keyof RawWaterParameter];

  if (value === null || value === undefined || value instanceof Date) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return null;
  }

  return Number(value.toString());
}

function toWaterParameterEntry(
  measurement: RawWaterParameter
): WaterParameterEntry {
  const metrics = waterMetricDefinitions.map((definition) => {
    const value = getMetricValue(measurement, definition.key);

    return {
      key: definition.key,
      label: definition.label,
      unit: definition.unit,
      value,
      displayValue: numberToDisplay(value, definition.unit),
      status: getWaterMetricStatus(definition, value),
    };
  });

  return {
    id: measurement.id,
    measuredAt: measurement.measuredAt.toISOString(),
    measuredAtLabel: measurement.measuredAt.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    notes: measurement.notes,
    metrics,
    chart: {
      date: measurement.measuredAt.toLocaleDateString("fr-FR"),
      temperatureC: decimalToNumber(measurement.temperatureC),
      ph: decimalToNumber(measurement.ph),
      nitriteMgL: decimalToNumber(measurement.nitriteMgL),
      nitrateMgL: decimalToNumber(measurement.nitrateMgL),
      ammoniaMgL: decimalToNumber(measurement.ammoniaMgL),
      phosphateMgL: decimalToNumber(measurement.phosphateMgL),
    },
  };
}

export async function getWaterMeasurements(
  userId: string,
  aquariumId: string,
  period: WaterPeriod
) {
  const since = getWaterPeriodDate(period);
  const measurements = await prisma.waterParameter.findMany({
    where: {
      userId,
      aquariumId,
      measuredAt: since ? { gte: since } : undefined,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      measuredAt: "desc",
    },
    select: waterParameterSelect,
  });

  return measurements.map(toWaterParameterEntry);
}

export async function getLatestWaterMeasurement(
  userId: string,
  aquariumId: string
) {
  const measurement = await prisma.waterParameter.findFirst({
    where: {
      userId,
      aquariumId,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      measuredAt: "desc",
    },
    select: waterParameterSelect,
  });

  return measurement ? toWaterParameterEntry(measurement) : null;
}
