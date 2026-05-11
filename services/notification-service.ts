import { prisma } from "@/lib/prisma";
import { getNotificationTypeLabel } from "@/rules/notification";

type NotificationTypeValue =
  | "ALERT"
  | "REMINDER"
  | "SYSTEM"
  | "AI_RECOMMENDATION"
  | "MAINTENANCE"
  | "WATER_TEST"
  | "WATER_CHANGE";

type NotificationCandidate = {
  aquariumId?: string | null;
  type: NotificationTypeValue;
  title: string;
  message: string;
  actionUrl: string;
  fingerprint: string;
};

type RawNotification = {
  id: string;
  aquariumId: string | null;
  type: string;
  status: string;
  title: string;
  message: string;
  actionUrl: string;
  readAt: Date | null;
  createdAt: Date;
  aquarium: {
    name: string;
  } | null;
};

export type NotificationEntry = {
  id: string;
  aquariumId: string | null;
  aquariumName: string | null;
  type: string;
  typeLabel: string;
  status: string;
  isUnread: boolean;
  title: string;
  message: string;
  actionUrl: string;
  readAt: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type NotificationBellSummary = {
  unreadCount: number;
  latestUnreadTitle: string | null;
};

const notificationSelect = {
  id: true,
  aquariumId: true,
  type: true,
  status: true,
  title: true,
  message: true,
  actionUrl: true,
  readAt: true,
  createdAt: true,
  aquarium: {
    select: {
      name: true,
    },
  },
} as const;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = startOfToday();
  date.setHours(23, 59, 59, 999);
  return date;
}

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getWeekKey(date = new Date()) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart.toISOString().slice(0, 10);
}

function toNotificationEntry(notification: RawNotification): NotificationEntry {
  return {
    id: notification.id,
    aquariumId: notification.aquariumId,
    aquariumName: notification.aquarium?.name ?? null,
    type: notification.type,
    typeLabel: getNotificationTypeLabel(notification.type),
    status: notification.status,
    isUnread: notification.status === "UNREAD",
    title: notification.title,
    message: notification.message,
    actionUrl: notification.actionUrl,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
    createdAtLabel: notification.createdAt.toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

async function upsertNotification(
  userId: string,
  candidate: NotificationCandidate
) {
  const existingNotification = await prisma.notification.findFirst({
    where: {
      userId,
      fingerprint: candidate.fingerprint,
    },
    select: {
      id: true,
      status: true,
      readAt: true,
    },
  });
  const data = {
    aquariumId: candidate.aquariumId ?? null,
    type: candidate.type,
    title: candidate.title,
    message: candidate.message,
    actionUrl: candidate.actionUrl,
    fingerprint: candidate.fingerprint,
  };

  if (existingNotification) {
    await prisma.notification.update({
      where: {
        id: existingNotification.id,
      },
      data,
    });

    return;
  }

  await prisma.notification.create({
    data: {
      userId,
      ...data,
      status: "UNREAD",
    },
  });
}

export async function syncUserNotifications(userId: string) {
  const start = startOfToday();
  const end = endOfToday();
  const dayKey = getDayKey();
  const weekKey = getWeekKey();
  const [
    dueReminders,
    criticalAlerts,
    aquariums,
  ] = await Promise.all([
    prisma.reminder.findMany({
      where: {
        userId,
        status: "PENDING",
        dueAt: {
          lte: end,
        },
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        dueAt: "asc",
      },
      select: {
        id: true,
        aquariumId: true,
        title: true,
        description: true,
        dueAt: true,
        aquarium: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.alert.findMany({
      where: {
        userId,
        severity: "CRITICAL",
        status: {
          in: ["OPEN", "ACKNOWLEDGED"],
        },
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        triggeredAt: "desc",
      },
      select: {
        id: true,
        aquariumId: true,
        title: true,
        message: true,
        aquarium: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.aquarium.findMany({
      where: {
        userId,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        waterParameters: {
          orderBy: {
            measuredAt: "desc",
          },
          take: 1,
          select: {
            measuredAt: true,
          },
        },
        maintenanceLogs: {
          where: {
            type: "WATER_CHANGE",
          },
          orderBy: {
            performedAt: "desc",
          },
          take: 1,
          select: {
            performedAt: true,
          },
        },
      },
    }),
  ]);
  const candidates: NotificationCandidate[] = [];

  for (const reminder of dueReminders) {
    const isOverdue = reminder.dueAt < start;

    candidates.push({
      aquariumId: reminder.aquariumId,
      type: "REMINDER",
      title: isOverdue ? "Rappel en retard" : "Rappel du jour",
      message: `${reminder.aquarium.name} : ${reminder.title}${
        reminder.description ? ` - ${reminder.description}` : ""
      }`,
      actionUrl: `/aquariums/${reminder.aquariumId}/reminders`,
      fingerprint: isOverdue
        ? `reminder:overdue:${reminder.id}`
        : `reminder:today:${reminder.id}:${dayKey}`,
    });
  }

  for (const alert of criticalAlerts) {
    candidates.push({
      aquariumId: alert.aquariumId,
      type: "ALERT",
      title: "Alerte critique",
      message: `${alert.aquarium.name} : ${alert.title}. ${alert.message}`,
      actionUrl: `/aquariums/${alert.aquariumId}/alerts`,
      fingerprint: `alert:critical:${alert.id}`,
    });
  }

  for (const aquarium of aquariums) {
    const latestWaterTest = aquarium.waterParameters[0]?.measuredAt ?? null;
    const waterTestAgeDays = daysSince(latestWaterTest);
    const latestWaterChange = aquarium.maintenanceLogs[0]?.performedAt ?? null;
    const waterChangeAgeDays = daysSince(latestWaterChange);

    if (waterTestAgeDays === null || waterTestAgeDays > 7) {
      candidates.push({
        aquariumId: aquarium.id,
        type: "WATER_TEST",
        title: "Test d'eau recommande",
        message:
          waterTestAgeDays === null
            ? `${aquarium.name} n'a pas encore de mesure d'eau.`
            : `${aquarium.name} n'a pas eu de test d'eau depuis ${waterTestAgeDays} jours.`,
        actionUrl: `/aquariums/${aquarium.id}/water`,
        fingerprint: `water-test:${aquarium.id}:${dayKey}`,
      });
    }

    if (waterChangeAgeDays === null || waterChangeAgeDays > 14) {
      candidates.push({
        aquariumId: aquarium.id,
        type: "WATER_CHANGE",
        title: "Changement d'eau recommande",
        message:
          waterChangeAgeDays === null
            ? `${aquarium.name} n'a pas encore de changement d'eau enregistre.`
            : `${aquarium.name} n'a pas eu de changement d'eau depuis ${waterChangeAgeDays} jours.`,
        actionUrl: `/aquariums/${aquarium.id}/maintenance`,
        fingerprint: `water-change:${aquarium.id}:${dayKey}`,
      });
    }
  }

  candidates.push({
    type: "AI_RECOMMENDATION",
    title: "Conseil IA hebdomadaire",
    message:
      "Conseil mocke : relis les tendances d'eau, les notes recentes et les alertes avant le prochain entretien.",
    actionUrl: "/dashboard#ai",
    fingerprint: `ai-weekly:${userId}:${weekKey}`,
  });

  await Promise.all(
    candidates.map((candidate) => upsertNotification(userId, candidate))
  );

  return candidates.length;
}

export async function getNotificationBellSummary(
  userId: string
): Promise<NotificationBellSummary> {
  await syncUserNotifications(userId);

  const [unreadCount, latestUnread] = await Promise.all([
    prisma.notification.count({
      where: {
        userId,
        status: "UNREAD",
      },
    }),
    prisma.notification.findFirst({
      where: {
        userId,
        status: "UNREAD",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        title: true,
      },
    }),
  ]);

  return {
    unreadCount,
    latestUnreadTitle: latestUnread?.title ?? null,
  };
}

export async function getUserNotifications(userId: string) {
  await syncUserNotifications(userId);

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      status: {
        not: "ARCHIVED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 80,
    select: notificationSelect,
  });

  return notifications
    .map(toNotificationEntry)
    .sort((a, b) => Number(b.isUnread) - Number(a.isUnread));
}
