import { z } from "zod";

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).optional().default("");
}

export const addAquariumFishFormSchema = z.object({
  speciesId: z.string().trim().min(1, "Selectionne une espece."),
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
  acquiredAt: z.string().trim().optional().default(""),
  notes: optionalText(2000),
});

export type AddAquariumFishFormInput = z.input<
  typeof addAquariumFishFormSchema
>;
export type AddAquariumFishFormValues = z.output<
  typeof addAquariumFishFormSchema
>;
