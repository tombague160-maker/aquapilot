"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  addAquariumPlantFormSchema,
  type AddAquariumPlantFormValues,
} from "@/rules/plant";

export type PlantActionState = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

function formatFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function emptyToUndefined(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function dateToDateTime(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? new Date(`${trimmedValue}T00:00:00.000`) : undefined;
}

function toAquariumPlantData(values: AddAquariumPlantFormValues) {
  return {
    speciesId: values.speciesId,
    quantity: Number(values.quantity),
    plantedAt: dateToDateTime(values.plantedAt),
    status: values.status,
    placement: emptyToUndefined(values.placement),
    notes: emptyToUndefined(values.notes),
  };
}

export async function addPlantToAquariumAction(
  aquariumId: string,
  input: unknown
): Promise<PlantActionState> {
  const user = await requireUser();
  const parsedInput = addAquariumPlantFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de la plante.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const [aquarium, species] = await Promise.all([
    prisma.aquarium.findFirst({
      where: {
        id: aquariumId,
        userId: user.id,
        isArchived: false,
      },
      select: {
        id: true,
      },
    }),
    prisma.plantSpecies.findFirst({
      where: {
        id: parsedInput.data.speciesId,
        OR: [{ isPublic: true }, { userId: user.id }],
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!aquarium) {
    return {
      message: "Aquarium introuvable ou inaccessible.",
    };
  }

  if (!species) {
    return {
      message: "Plante introuvable ou inaccessible.",
      fieldErrors: {
        speciesId: "Selectionne une plante disponible.",
      },
    };
  }

  await prisma.aquariumPlant.create({
    data: {
      userId: user.id,
      aquariumId: aquarium.id,
      ...toAquariumPlantData(parsedInput.data),
    },
  });

  redirect(`/aquariums/${aquarium.id}/plants`);
}
