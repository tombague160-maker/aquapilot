"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  addAquariumFishFormSchema,
  type AddAquariumFishFormValues,
} from "@/rules/fish";

export type FishActionState = {
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

function toAquariumFishData(values: AddAquariumFishFormValues) {
  return {
    speciesId: values.speciesId,
    quantity: Number(values.quantity),
    acquiredAt: dateToDateTime(values.acquiredAt),
    notes: emptyToUndefined(values.notes),
  };
}

export async function addFishToAquariumAction(
  aquariumId: string,
  input: unknown
): Promise<FishActionState> {
  const user = await requireUser();
  const parsedInput = addAquariumFishFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations du poisson.",
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
    prisma.fishSpecies.findFirst({
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
      message: "Espece introuvable ou inaccessible.",
      fieldErrors: {
        speciesId: "Selectionne une espece disponible.",
      },
    };
  }

  await prisma.aquariumFish.create({
    data: {
      userId: user.id,
      aquariumId: aquarium.id,
      ...toAquariumFishData(parsedInput.data),
    },
  });

  redirect(`/aquariums/${aquarium.id}/fish`);
}
