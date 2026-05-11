import { z } from "zod";

export const aquariumTypeOptions = [
  { value: "FRESHWATER_COMMUNITY", label: "Communautaire" },
  { value: "PLANTED", label: "Plante" },
  { value: "SHRIMP", label: "Crevettes" },
  { value: "BETTA", label: "Betta" },
  { value: "BREEDING", label: "Reproduction" },
  { value: "QUARANTINE", label: "Quarantaine" },
  { value: "BIOTOPE", label: "Biotope" },
  { value: "OTHER", label: "Autre" },
] as const;

const aquariumTypeValues = aquariumTypeOptions.map((option) => option.value) as [
  (typeof aquariumTypeOptions)[number]["value"],
  ...(typeof aquariumTypeOptions)[number]["value"][],
];

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).optional().default("");
}

function optionalPositiveNumber(label: string, max = 100000) {
  return z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) > 0),
      `${label} doit etre un nombre positif.`
    )
    .refine(
      (value) => value === "" || Number(value) <= max,
      `${label} est trop eleve.`
    );
}

function optionalUrl(label: string) {
  return z
    .string()
    .trim()
    .max(2048)
    .optional()
    .default("")
    .refine((value) => value === "" || URL.canParse(value), {
      message: `${label} doit etre une URL valide.`,
    });
}

export const aquariumFormSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caracteres.").max(120),
  type: z.enum(aquariumTypeValues),
  volumeLiters: optionalPositiveNumber("Le volume", 100000),
  lengthCm: optionalPositiveNumber("La longueur", 10000),
  widthCm: optionalPositiveNumber("La largeur", 10000),
  heightCm: optionalPositiveNumber("La hauteur", 10000),
  startedAt: z.string().trim().optional().default(""),
  currentTemperatureC: optionalPositiveNumber("La temperature actuelle", 45),
  targetTemperatureC: optionalPositiveNumber("La temperature cible", 45),
  filtrationType: optionalText(120),
  filterFlowLitersHour: optionalPositiveNumber("Le debit du filtre", 100000),
  heaterType: optionalText(120),
  heaterPowerWatts: optionalPositiveNumber("La puissance du chauffage", 10000),
  lightingType: optionalText(120),
  lightingHoursPerDay: optionalPositiveNumber("La duree d'eclairage", 24),
  substrate: optionalText(180),
  decorations: optionalText(500),
  hasCo2: z.boolean().default(false),
  fertilizer: optionalText(180),
  notes: optionalText(2000),
  imageUrl: optionalUrl("L'image"),
});

export type AquariumFormInput = z.input<typeof aquariumFormSchema>;
export type AquariumFormValues = z.output<typeof aquariumFormSchema>;

export function getAquariumTypeLabel(type: string) {
  return aquariumTypeOptions.find((option) => option.value === type)?.label ?? "Autre";
}
