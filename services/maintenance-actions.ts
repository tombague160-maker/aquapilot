"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  getMaintenanceTypeLabel,
  maintenanceFormSchema,
  type MaintenanceFormValues,
} from "@/rules/maintenance";

export type MaintenanceActionState = {
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

function toPerformedAt(date: string) {
  return new Date(`${date}T00:00:00.000`);
}

function toMaintenanceData(values: MaintenanceFormValues) {
  return {
    type: values.type,
    title: getMaintenanceTypeLabel(values.type),
    performedAt: toPerformedAt(values.date),
    waterChangeLiters: emptyToUndefined(values.waterChangeLiters),
    waterChangePercent: emptyToUndefined(values.waterChangePercent),
    notes: emptyToUndefined(values.notes),
  };
}

export async function createMaintenanceLogAction(
  aquariumId: string,
  input: unknown
): Promise<MaintenanceActionState> {
  const user = await requireUser();
  const parsedInput = maintenanceFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "Verifie les informations de l'entretien.",
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

  await prisma.maintenanceLog.create({
    data: {
      userId: user.id,
      aquariumId: aquarium.id,
      ...toMaintenanceData(parsedInput.data),
    },
  });

  redirect(`/aquariums/${aquarium.id}/maintenance`);
}
