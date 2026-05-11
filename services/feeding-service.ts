import { prisma } from "@/lib/prisma";
import { getFeedingFoodTypeLabel } from "@/rules/feeding";

type RawFeedingLog = {
  id: string;
  foodType: string;
  amount: string | null;
  species: string | null;
  fedAt: Date;
  notes: string | null;
  observationAfter: string | null;
  createdAt: Date;
};

export type FeedingLogEntry = {
  id: string;
  foodType: string;
  foodTypeLabel: string;
  amount: string;
  species: string;
  fedAt: string;
  fedAtLabel: string;
  notes: string | null;
  observationAfter: string | null;
};

export type FeedingStats = {
  totalCount: number;
  last24HoursCount: number;
  last7DaysCount: number;
  averagePerDayLast7: number;
  mostUsedFoodType: string;
  isVeryFrequent: boolean;
};

const feedingLogSelect = {
  id: true,
  foodType: true,
  amount: true,
  species: true,
  fedAt: true,
  notes: true,
  observationAfter: true,
  createdAt: true,
} as const;

function toFeedingLogEntry(log: RawFeedingLog): FeedingLogEntry {
  return {
    id: log.id,
    foodType: log.foodType,
    foodTypeLabel: getFeedingFoodTypeLabel(log.foodType),
    amount: log.amount ?? "Non renseigne",
    species: log.species ?? "Toutes / non precise",
    fedAt: log.fedAt.toISOString(),
    fedAtLabel: log.fedAt.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    notes: log.notes,
    observationAfter: log.observationAfter,
  };
}

export async function getFeedingLogs(userId: string, aquariumId: string) {
  const logs = await prisma.feedingLog.findMany({
    where: {
      userId,
      aquariumId,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      fedAt: "desc",
    },
    select: feedingLogSelect,
  });

  return logs.map(toFeedingLogEntry);
}

export async function getLatestFeedingLog(userId: string, aquariumId: string) {
  const log = await prisma.feedingLog.findFirst({
    where: {
      userId,
      aquariumId,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      fedAt: "desc",
    },
    select: feedingLogSelect,
  });

  return log ? toFeedingLogEntry(log) : null;
}

export async function getFeedingStats(
  userId: string,
  aquariumId: string
): Promise<FeedingStats> {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalCount, last24HoursCount, recentLogs] = await Promise.all([
    prisma.feedingLog.count({
      where: {
        userId,
        aquariumId,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
    }),
    prisma.feedingLog.count({
      where: {
        userId,
        aquariumId,
        fedAt: {
          gte: last24Hours,
        },
        aquarium: {
          userId,
          isArchived: false,
        },
      },
    }),
    prisma.feedingLog.findMany({
      where: {
        userId,
        aquariumId,
        fedAt: {
          gte: last7Days,
        },
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      select: {
        foodType: true,
      },
    }),
  ]);

  const foodCounts = recentLogs.reduce<Record<string, number>>((accumulator, log) => {
    accumulator[log.foodType] = (accumulator[log.foodType] ?? 0) + 1;
    return accumulator;
  }, {});

  const mostUsedFoodType = Object.entries(foodCounts).sort(
    ([, countA], [, countB]) => countB - countA
  )[0]?.[0];
  const averagePerDayLast7 = recentLogs.length / 7;

  return {
    totalCount,
    last24HoursCount,
    last7DaysCount: recentLogs.length,
    averagePerDayLast7,
    mostUsedFoodType: mostUsedFoodType
      ? getFeedingFoodTypeLabel(mostUsedFoodType)
      : "Non renseigne",
    isVeryFrequent: last24HoursCount >= 4 || averagePerDayLast7 > 2,
  };
}
