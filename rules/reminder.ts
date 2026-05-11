import { z } from "zod";

export const reminderTypeOptions = [
  { value: "WATER_CHANGE", label: "Changement d'eau" },
  { value: "WATER_TEST", label: "Test parametres" },
  { value: "FEEDING", label: "Nourrissage" },
  { value: "GLASS_CLEANING", label: "Nettoyage vitres" },
  { value: "FILTER_CLEANING", label: "Nettoyage filtre" },
  { value: "SUBSTRATE_SIPHONING", label: "Siphonnage sol" },
  { value: "PLANT_TRIMMING", label: "Taille plantes" },
  { value: "FERTILIZATION", label: "Ajout engrais" },
  { value: "TEMPERATURE_CHECK", label: "Verification temperature" },
  { value: "HEATER_CHECK", label: "Verification chauffage" },
  { value: "LIGHTING_CHECK", label: "Verification eclairage" },
  { value: "FISH_VISUAL_CHECK", label: "Controle visuel poissons" },
  { value: "CO2_CHECK", label: "Controle CO2" },
  { value: "ALGAE_CHECK", label: "Controle algues" },
  { value: "EQUIPMENT_CHECK", label: "Verification equipement" },
  { value: "CUSTOM", label: "Personnalise" },
] as const;

export const reminderPriorityOptions = [
  { value: "LOW", label: "Basse" },
  { value: "MEDIUM", label: "Normale" },
  { value: "HIGH", label: "Haute" },
  { value: "CRITICAL", label: "Critique" },
] as const;

export type ReminderTypeValue = (typeof reminderTypeOptions)[number]["value"];
export type ReminderPriorityValue =
  (typeof reminderPriorityOptions)[number]["value"];

const reminderTypeValues = reminderTypeOptions.map((option) => option.value) as [
  ReminderTypeValue,
  ...ReminderTypeValue[],
];

const reminderPriorityValues = reminderPriorityOptions.map(
  (option) => option.value
) as [ReminderPriorityValue, ...ReminderPriorityValue[]];

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).optional().default("");
}

export const manualReminderFormSchema = z.object({
  type: z.enum(reminderTypeValues),
  title: z.string().trim().min(2, "Le titre est obligatoire.").max(160),
  description: optionalText(1000),
  dueDate: z.string().trim().min(1, "La date est obligatoire."),
  priority: z.enum(reminderPriorityValues),
  repeatEveryDays: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => value === "" || Number.isInteger(Number(value)),
      "La frequence doit etre un nombre entier."
    )
    .refine(
      (value) => value === "" || Number(value) >= 1,
      "La frequence doit etre superieure ou egale a 1 jour."
    )
    .refine(
      (value) => value === "" || Number(value) <= 365,
      "La frequence est trop longue."
    ),
});

export const reminderFrequencySchema = z.object({
  repeatEveryDays: z
    .string()
    .trim()
    .min(1, "La frequence est obligatoire.")
    .refine((value) => Number.isInteger(Number(value)), {
      message: "La frequence doit etre un nombre entier.",
    })
    .refine((value) => Number(value) >= 1, {
      message: "La frequence doit etre superieure ou egale a 1 jour.",
    })
    .refine((value) => Number(value) <= 365, {
      message: "La frequence est trop longue.",
    }),
});

export type ManualReminderFormInput = z.input<typeof manualReminderFormSchema>;
export type ManualReminderFormValues = z.output<typeof manualReminderFormSchema>;

export function getReminderTypeLabel(type: string) {
  return (
    reminderTypeOptions.find((option) => option.value === type)?.label ??
    "Personnalise"
  );
}

export function getReminderPriorityLabel(priority: string) {
  return (
    reminderPriorityOptions.find((option) => option.value === priority)?.label ??
    "Normale"
  );
}
