import { z } from "zod";

export const plantStatusOptions = [
  { value: "ACTIVE", label: "Saine" },
  { value: "MELTING", label: "Fonte / fragilisee" },
  { value: "PROPAGATED", label: "Bouture / propagation" },
  { value: "REMOVED", label: "Retiree" },
] as const;

export type PlantStatusValue = (typeof plantStatusOptions)[number]["value"];

const plantStatusValues = plantStatusOptions.map((option) => option.value) as [
  PlantStatusValue,
  ...PlantStatusValue[],
];

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).optional().default("");
}

export const addAquariumPlantFormSchema = z.object({
  speciesId: z.string().trim().min(1, "Selectionne une plante."),
  quantity: z
    .string()
    .trim()
    .min(1, "La quantite est obligatoire.")
    .refine((value) => Number.isInteger(Number(value)), {
      message: "La quantite doit etre un nombre entier.",
    })
    .refine((value) => Number(value) >= 1, {
      message: "La quantite doit etre superieure ou egale a 1.",
    })
    .refine((value) => Number(value) <= 999, {
      message: "La quantite est trop elevee.",
    }),
  plantedAt: z.string().trim().optional().default(""),
  status: z.enum(plantStatusValues),
  placement: optionalText(180),
  notes: optionalText(2000),
});

export type AddAquariumPlantFormInput = z.input<
  typeof addAquariumPlantFormSchema
>;
export type AddAquariumPlantFormValues = z.output<
  typeof addAquariumPlantFormSchema
>;

export function getPlantStatusLabel(status: string) {
  return (
    plantStatusOptions.find((option) => option.value === status)?.label ??
    "Non renseigne"
  );
}
