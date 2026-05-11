"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { aquariumFormSchema, type AquariumFormValues } from "@/rules/aquarium";

export type AquariumActionState = {
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

function optionalInt(value: string) {
  const normalizedValue = emptyToUndefined(value);

  return normalizedValue ? Number.parseInt(normalizedValue, 10) : undefined;
}

function optionalDate(value: string) {
  const normalizedValue = emptyToUndefined(value);

  return normalizedValue ? new Date(`${normalizedValue}T00:00:00.000Z`) : undefined;
}

function toAquariumData(values: AquariumFormValues) {
  return {
    name: values.name,
    type: values.type,
    volumeLiters: emptyToUndefined(values.volumeLiters),
    lengthCm: emptyToUndefined(values.lengthCm),
    widthCm: emptyToUndefined(values.widthCm),
    heightCm: emptyToUndefined(values.heightCm),
    startedAt: optionalDate(values.startedAt),
    currentTemperatureC: emptyToUndefined(values.currentTemperatureC),
    targetTemperatureC: emptyToUndefined(values.targetTemperatureC),
    filtrationType: emptyToUndefined(values.filtrationType),
    filterFlowLitersHour: optionalInt(values.filterFlowLitersHour),
    heaterType: emptyToUndefined(values.heaterType),
    heaterPowerWatts: optionalInt(values.heaterPowerWatts),
    lightingType: emptyToUndefined(values.lightingType),
    lightingHoursPerDay: emptyToUndefined(values.lightingHoursPerDay),
    substrate: emptyToUndefined(values.substrate),
    decorations: emptyToUndefined(values.decorations),
    hasCo2: values.hasCo2,
    fertilizer: emptyToUndefined(values.fertilizer),
    notes: emptyToUndefined(values.notes),
    photoUrl: emptyToUndefined(values.imageUrl),
  };
}

export async function createAquariumAction(
  input: unknown
): Promise<AquariumActionState> {
  const user = await requireUser();
  const parsedInput = aquariumFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de l'aquarium.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const aquarium = await prisma.aquarium.create({
    data: {
      userId: user.id,
      ...toAquariumData(parsedInput.data),
    },
    select: {
      id: true,
    },
  });

  redirect(`/aquariums/${aquarium.id}`);
}

export async function updateAquariumAction(
  aquariumId: string,
  input: unknown
): Promise<AquariumActionState> {
  const user = await requireUser();
  const parsedInput = aquariumFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de l'aquarium.",
      fieldErrors: formatFieldErrors(parsedInput.error),
    };
  }

  const existingAquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId: user.id,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  if (!existingAquarium) {
    return {
      message: "Aquarium introuvable ou inaccessible.",
    };
  }

  await prisma.aquarium.update({
    where: {
      id: existingAquarium.id,
    },
    data: toAquariumData(parsedInput.data),
  });

  redirect(`/aquariums/${existingAquarium.id}`);
}

export async function deleteAquariumAction(aquariumId: string) {
  const user = await requireUser();

  await prisma.aquarium.deleteMany({
    where: {
      id: aquariumId,
      userId: user.id,
    },
  });

  redirect("/aquariums");
}
