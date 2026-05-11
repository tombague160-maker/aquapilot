"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  waterParameterFormSchema,
  type WaterParameterFormValues,
} from "@/rules/water-parameter";

export type WaterParameterActionState = {
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

function buildMeasuredAt(date: string, time: string) {
  return new Date(`${date}T${time}:00.000`);
}

function toWaterParameterData(values: WaterParameterFormValues) {
  return {
    measuredAt: buildMeasuredAt(values.date, values.time),
    temperatureC: emptyToUndefined(values.temperatureC),
    ph: emptyToUndefined(values.ph),
    kh: optionalInt(values.kh),
    gh: optionalInt(values.gh),
    nitriteMgL: emptyToUndefined(values.nitriteMgL),
    nitrateMgL: emptyToUndefined(values.nitrateMgL),
    ammoniaMgL: emptyToUndefined(values.ammoniaMgL),
    phosphateMgL: emptyToUndefined(values.phosphateMgL),
    ironMgL: emptyToUndefined(values.ironMgL),
    tdsPpm: optionalInt(values.tdsPpm),
    co2MgL: emptyToUndefined(values.co2MgL),
    oxygenMgL: emptyToUndefined(values.oxygenMgL),
    chlorineMgL: emptyToUndefined(values.chlorineMgL),
    notes: emptyToUndefined(values.notes),
  };
}

export async function createWaterParameterAction(
  aquariumId: string,
  input: unknown
): Promise<WaterParameterActionState> {
  const user = await requireUser();
  const parsedInput = waterParameterFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de la mesure.",
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

  await prisma.waterParameter.create({
    data: {
      userId: user.id,
      aquariumId: aquarium.id,
      ...toWaterParameterData(parsedInput.data),
    },
  });

  redirect(`/aquariums/${aquarium.id}/water`);
}
