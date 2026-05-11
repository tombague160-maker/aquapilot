import { z } from "zod";

export const noteTypeOptions = [
  { value: "OBSERVATION", label: "Observation" },
  { value: "PROBLEM", label: "Probleme" },
  { value: "IDEA", label: "Idee" },
  { value: "FISH_BEHAVIOR", label: "Comportement poisson" },
  { value: "PLANT", label: "Plante" },
  { value: "MAINTENANCE", label: "Entretien" },
  { value: "OTHER", label: "Autre" },
] as const;

export const noteFilterOptions = [
  { value: "all", label: "Tous" },
  ...noteTypeOptions,
] as const;

export type NoteTypeValue = (typeof noteTypeOptions)[number]["value"];
export type NoteFilterValue = (typeof noteFilterOptions)[number]["value"];

const noteTypeValues = noteTypeOptions.map((option) => option.value) as [
  NoteTypeValue,
  ...NoteTypeValue[],
];
const noteFilterValues = noteFilterOptions.map((option) => option.value) as [
  NoteFilterValue,
  ...NoteFilterValue[],
];

function optionalUrl(label: string) {
  return z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: `${label} doit etre une URL valide.`,
    });
}

export const noteFormSchema = z.object({
  title: z.string().trim().max(160, "Le titre est trop long.").optional().default(""),
  content: z
    .string()
    .trim()
    .min(1, "Le contenu est obligatoire.")
    .max(5000, "La note est trop longue."),
  type: z.enum(noteTypeValues),
  date: z.string().trim().min(1, "La date est obligatoire."),
  photoUrl: optionalUrl("La photo"),
  tags: z.string().trim().max(500, "Les tags sont trop longs.").optional().default(""),
});

export const noteFilterSchema = z.enum(noteFilterValues).catch("all");

export type NoteFormInput = z.input<typeof noteFormSchema>;
export type NoteFormValues = z.output<typeof noteFormSchema>;

export function getNoteTypeLabel(type: string) {
  return noteTypeOptions.find((option) => option.value === type)?.label ?? "Autre";
}

export function getNoteFilter(value: string | string[] | undefined) {
  return noteFilterSchema.parse(Array.isArray(value) ? value[0] : value);
}

export function getNoteSearch(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue?.trim().slice(0, 120) ?? "";
}
