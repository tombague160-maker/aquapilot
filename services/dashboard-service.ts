import { prisma } from "@/lib/prisma";
import { getAquariumTypeLabel } from "@/rules/aquarium";
import { getRecentUserAquariums } from "@/services/aquarium-service";
import {
  calculateUserAquariumHealthScores,
  type HealthScoreSnapshot,
} from "@/services/health-score-service";

type DecimalLike = {
  toString(): string;
};

function decimalToString(value: DecimalLike | null) {
  return value?.toString() ?? "";
}

function decimalToDisplay(value: DecimalLike | null, suffix: string) {
  const rawValue = decimalToString(value);

  return rawValue ? `${rawValue} ${suffix}` : "Non renseigne";
}

async function getPrimaryAquariumDashboardData(
  userId: string,
  aquariumId: string,
  healthScore: HealthScoreSnapshot | null
)
 {
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      type: true,
      volumeLiters: true,
      photoUrl: true,
      currentTemperatureC: true,
    },
  });

  if (!aquarium) {
    return null;
  }

  const [fishQuantity, plantQuantity, activeAlerts, pendingReminders] =
    await Promise.all([
      prisma.aquariumFish.aggregate({
        where: {
          userId,
          aquariumId: aquarium.id,
          status: "ACTIVE",
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.aquariumPlant.aggregate({
        where: {
          userId,
          aquariumId: aquarium.id,
          status: {
            not: "REMOVED",
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.alert.count({
        where: {
          userId,
          aquariumId: aquarium.id,
          status: {
            in: ["OPEN", "ACKNOWLEDGED"],
          },
        },
      }),
      prisma.reminder.count({
        where: {
          userId,
          aquariumId: aquarium.id,
          status: "PENDING",
        },
      }),
    ]);

  return {
    aquariumId: aquarium.id,
    id: aquarium.id,
    name: aquarium.name,
    typeLabel: getAquariumTypeLabel(aquarium.type),
    volume: decimalToDisplay(aquarium.volumeLiters, "L"),
    temperature: decimalToDisplay(aquarium.currentTemperatureC, "C"),
    photoUrl: aquarium.photoUrl,
    score: healthScore,
    activeAlerts,
    pendingReminders,
    fishCount: fishQuantity._sum.quantity ?? 0,
    plantCount: plantQuantity._sum.quantity ?? 0,
  };
}

export async function getDashboardOverview(userId: string) {
  const [
    aquariumCount,
    alertCount,
    reminderCount,
    unreadNotificationCount,
    recentAquariums,
    healthScores,
  ] = await Promise.all([
    prisma.aquarium.count({
      where: {
        userId,
        isArchived: false,
      },
    }),
    prisma.alert.count({
      where: {
        userId,
        status: "OPEN",
      },
    }),
    prisma.reminder.count({
      where: {
        userId,
        status: "PENDING",
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        status: "UNREAD",
      },
    }),
    getRecentUserAquariums(userId, 3),
    calculateUserAquariumHealthScores(userId),
  ]);
  const averageHealthScore =
    healthScores.length > 0
      ? Math.round(
          healthScores.reduce(
            (total, aquarium) => total + aquarium.score.score,
            0
          ) / healthScores.length
        )
      : null;
  const primaryAquariumCandidate = recentAquariums[0] ?? null;
  const primaryAquarium = primaryAquariumCandidate
    ? await getPrimaryAquariumDashboardData(
        userId,
        primaryAquariumCandidate.id,
        healthScores.find(
          (item) => item.aquariumId === primaryAquariumCandidate.id
        )?.score ?? null
      )
    : null;

  return {
    aquariumCount,
    alertCount,
    reminderCount,
    unreadNotificationCount,
    recentAquariums,
    healthScores,
    averageHealthScore,
    primaryAquarium,
  };
}
