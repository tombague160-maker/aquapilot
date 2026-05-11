import { z } from "zod";

export const waterPeriodOptions = [
  { value: "7d", label: "7 jours", days: 7 },
  { value: "30d", label: "30 jours", days: 30 },
  { value: "3m", label: "3 mois", days: 90 },
  { value: "1y", label: "1 an", days: 365 },
  { value: "all", label: "Tout", days: null },
] as const;

export type WaterPeriod = (typeof waterPeriodOptions)[number]["value"];

const waterPeriodValues = waterPeriodOptions.map((option) => option.value) as [
  WaterPeriod,
  ...WaterPeriod[],
];

function optionalNumber(label: string, min = 0, max = 100000) {
  return z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => value === "" || !Number.isNaN(Number(value)),
      `${label} doit etre un nombre.`
    )
    .refine(
      (value) => value === "" || Number(value) >= min,
      `${label} doit etre superieur ou egal a ${min}.`
    )
    .refine(
      (value) => value === "" || Number(value) <= max,
      `${label} est trop eleve.`
    );
}

function optionalInteger(label: string, min = 0, max = 100000) {
  return optionalNumber(label, min, max).refine(
    (value) => value === "" || Number.isInteger(Number(value)),
    `${label} doit etre un nombre entier.`
  );
}

export const waterParameterFormSchema = z.object({
  date: z.string().trim().min(1, "La date est obligatoire."),
  time: z.string().trim().min(1, "L'heure est obligatoire."),
  temperatureC: optionalNumber("La temperature", 0, 45),
  ph: optionalNumber("Le pH", 0, 14),
  kh: optionalInteger("Le KH", 0, 50),
  gh: optionalInteger("Le GH", 0, 80),
  nitriteMgL: optionalNumber("Le NO2", 0, 20),
  nitrateMgL: optionalNumber("Le NO3", 0, 500),
  ammoniaMgL: optionalNumber("Le NH3/NH4", 0, 20),
  phosphateMgL: optionalNumber("Le PO4", 0, 50),
  ironMgL: optionalNumber("Le fer", 0, 10),
  tdsPpm: optionalInteger("Le TDS", 0, 5000),
  co2MgL: optionalNumber("Le CO2", 0, 100),
  oxygenMgL: optionalNumber("L'oxygene", 0, 30),
  chlorineMgL: optionalNumber("Le chlore", 0, 10),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const waterPeriodSchema = z.enum(waterPeriodValues).catch("30d");

export type WaterParameterFormInput = z.input<typeof waterParameterFormSchema>;
export type WaterParameterFormValues = z.output<typeof waterParameterFormSchema>;

type WaterStatus = "ok" | "warning" | "missing";

export type WaterMetricDefinition = {
  key:
    | "temperatureC"
    | "ph"
    | "kh"
    | "gh"
    | "nitriteMgL"
    | "nitrateMgL"
    | "ammoniaMgL"
    | "phosphateMgL"
    | "ironMgL"
    | "tdsPpm"
    | "co2MgL"
    | "oxygenMgL"
    | "chlorineMgL";
  label: string;
  unit: string;
  min?: number;
  max?: number;
  warningAbove?: number;
  warningBelow?: number;
};

export const waterMetricDefinitions: WaterMetricDefinition[] = [
  { key: "temperatureC", label: "Temperature", unit: "C", min: 20, max: 30 },
  { key: "ph", label: "pH", unit: "", min: 6, max: 8 },
  { key: "kh", label: "KH", unit: "dKH", min: 2, max: 12 },
  { key: "gh", label: "GH", unit: "dGH", min: 4, max: 18 },
  { key: "nitriteMgL", label: "NO2", unit: "mg/L", warningAbove: 0.05 },
  { key: "nitrateMgL", label: "NO3", unit: "mg/L", warningAbove: 50 },
  { key: "ammoniaMgL", label: "NH3/NH4", unit: "mg/L", warningAbove: 0.02 },
  { key: "phosphateMgL", label: "PO4", unit: "mg/L", warningAbove: 2 },
  { key: "ironMgL", label: "Fer", unit: "mg/L", warningAbove: 0.5 },
  { key: "tdsPpm", label: "TDS", unit: "ppm", min: 50, max: 500 },
  { key: "co2MgL", label: "CO2", unit: "mg/L", min: 5, max: 35 },
  { key: "oxygenMgL", label: "Oxygene", unit: "mg/L", warningBelow: 5 },
  { key: "chlorineMgL", label: "Chlore", unit: "mg/L", warningAbove: 0 },
];

export function getWaterPeriod(value: string | string[] | undefined) {
  return waterPeriodSchema.parse(Array.isArray(value) ? value[0] : value);
}

export function getWaterPeriodDate(period: WaterPeriod) {
  const option = waterPeriodOptions.find((item) => item.value === period);

  if (!option?.days) {
    return null;
  }

  const date = new Date();
  date.setDate(date.getDate() - option.days);
  return date;
}

export function getWaterMetricStatus(
  definition: WaterMetricDefinition,
  value: number | null
): WaterStatus {
  if (value === null) {
    return "missing";
  }

  if (definition.warningAbove !== undefined && value > definition.warningAbove) {
    return "warning";
  }

  if (definition.warningBelow !== undefined && value < definition.warningBelow) {
    return "warning";
  }

  if (definition.min !== undefined && value < definition.min) {
    return "warning";
  }

  if (definition.max !== undefined && value > definition.max) {
    return "warning";
  }

  return "ok";
}
