import { z } from "zod";

export const maintenanceTypeOptions = [
  { value: "WATER_CHANGE", label: "Changement d'eau" },
  { value: "GLASS_CLEANING", label: "Nettoyage vitres" },
  { value: "FILTER_CLEANING", label: "Nettoyage filtre" },
  { value: "FILTER_MEDIA_RINSE", label: "Rincage masses filtrantes" },
  { value: "SUBSTRATE_SIPHONING", label: "Siphonnage sol" },
  { value: "PLANT_TRIMMING", label: "Taille plantes" },
  { value: "FERTILIZATION", label: "Ajout engrais" },
  { value: "BACTERIA_ADDITION", label: "Ajout bacteries" },
  { value: "CONDITIONER_ADDITION", label: "Ajout conditionneur" },
  { value: "PUMP_CLEANING", label: "Nettoyage pompe" },
  { value: "HEATER_CHECK", label: "Verification chauffage" },
  { value: "LIGHTING_CHECK", label: "Verification eclairage" },
  { value: "OTHER", label: "Autre" },
] as const;

export const maintenanceFilterOptions = [
  { value: "all", label: "Tous" },
  ...maintenanceTypeOptions,
] as const;

export type MaintenanceTypeValue =
  (typeof maintenanceTypeOptions)[number]["value"];

export type MaintenanceFilterValue =
  (typeof maintenanceFilterOptions)[number]["value"];

const maintenanceTypeValues = maintenanceTypeOptions.map((option) => option.value) as [
  MaintenanceTypeValue,
  ...MaintenanceTypeValue[],
];

const maintenanceFilterValues = maintenanceFilterOptions.map(
  (option) => option.value
) as [MaintenanceFilterValue, ...MaintenanceFilterValue[]];

function optionalPositiveNumber(label: string, max = 100000) {
  return z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      `${label} doit etre un nombre positif.`
    )
    .refine(
      (value) => value === "" || Number(value) <= max,
      `${label} est trop eleve.`
    );
}

export const maintenanceFormSchema = z.object({
  date: z.string().trim().min(1, "La date est obligatoire."),
  type: z.enum(maintenanceTypeValues),
  waterChangeLiters: optionalPositiveNumber("Le volume d'eau change", 100000),
  waterChangePercent: optionalPositiveNumber("Le pourcentage d'eau change", 100),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const maintenanceFilterSchema = z.enum(maintenanceFilterValues).catch("all");

export type MaintenanceFormInput = z.input<typeof maintenanceFormSchema>;
export type MaintenanceFormValues = z.output<typeof maintenanceFormSchema>;

export function getMaintenanceTypeLabel(type: string) {
  return (
    maintenanceTypeOptions.find((option) => option.value === type)?.label ?? "Autre"
  );
}

export function getMaintenanceFilter(value: string | string[] | undefined) {
  return maintenanceFilterSchema.parse(Array.isArray(value) ? value[0] : value);
}
