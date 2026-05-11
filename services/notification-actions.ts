"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.id,
      status: "UNREAD",
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      status: "UNREAD",
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
