"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { analyzeAquarium } from "@/services/alert-service";

export async function analyzeAquariumAction(aquariumId: string) {
  await analyzeAquarium(aquariumId);
  revalidatePath(`/aquariums/${aquariumId}/alerts`);
}

export async function resolveAlertAction(alertId: string) {
  const user = await requireUser();
  const alert = await prisma.alert.findFirst({
    where: {
      id: alertId,
      userId: user.id,
      aquarium: {
        userId: user.id,
        isArchived: false,
      },
    },
    select: {
      id: true,
      aquariumId: true,
    },
  });

  if (!alert) {
    return;
  }

  await prisma.alert.update({
    where: {
      id: alert.id,
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });

  revalidatePath(`/aquariums/${alert.aquariumId}/alerts`);
}
