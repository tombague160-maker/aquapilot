import { z } from "zod";

export const feedingFoodTypeOptions = [
  { value: "FLAKES", label: "Flocons" },
  { value: "GRANULES", label: "Granules" },
  { value: "TABLETS", label: "Pastilles" },
  { value: "FROZEN", label: "Congele" },
  { value: "LIVE", label: "Vivant" },
  { value: "VEGETABLES", label: "Legumes" },
  { value: "SHRIMP_FOOD", label: "Nourriture crevettes" },
  { value: "OTHER", label: "Autre" },
] as const;

export type FeedingFoodTypeValue =
  (typeof feedingFoodTypeOptions)[number]["value"];

const feedingFoodTypeValues = feedingFoodTypeOptions.map((option) => option.value) as [
  FeedingFoodTypeValue,
  ...FeedingFoodTypeValue[],
];

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).optional().default("");
}

export const feedingFormSchema = z.object({
  date: z.string().trim().min(1, "La date est obligatoire."),
  time: z.string().trim().min(1, "L'heure est obligatoire."),
  foodType: z.enum(feedingFoodTypeValues),
  amount: optionalText(120),
  species: optionalText(300),
  notes: optionalText(2000),
  observationAfter: optionalText(2000),
});

export type FeedingFormInput = z.input<typeof feedingFormSchema>;
export type FeedingFormValues = z.output<typeof feedingFormSchema>;

export function getFeedingFoodTypeLabel(type: string) {
  return (
    feedingFoodTypeOptions.find((option) => option.value === type)?.label ?? "Autre"
  );
}
