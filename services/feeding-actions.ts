"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { feedingFormSchema, type FeedingFormValues } from "@/rules/feeding";

export type FeedingActionState = {
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

function buildFedAt(date: string, time: string) {
  return new Date(`${date}T${time}:00.000`);
}

function toFeedingData(values: FeedingFormValues) {
  return {
    foodType: values.foodType,
    amount: emptyToUndefined(values.amount),
    species: emptyToUndefined(values.species),
    fedAt: buildFedAt(values.date, values.time),
    notes: emptyToUndefined(values.notes),
    observationAfter: emptyToUndefined(values.observationAfter),
  };
}

export async function createFeedingLogAction(
  aquariumId: string,
  input: unknown
): Promise<FeedingActionState> {
  const user = await requireUser();
  const parsedInput = feedingFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations du nourrissage.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId: user.id,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  if (!aquarium) {
    return {
      message: "Aquarium introuvable ou inaccessible.",
    };
  }

  await prisma.feedingLog.create({
    data: {
      userId: user.id,
      aquariumId: aquarium.id,
      ...toFeedingData(parsedInput.data),
    },
  });

  redirect(`/aquariums/${aquarium.id}/feeding`);
}
