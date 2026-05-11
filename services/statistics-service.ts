import { prisma } from "@/lib/prisma";
import {
  getWaterPeriodDate,
  type WaterPeriod,
} from "@/rules/water-parameter";
import { calculateAquariumHealthScoreForUser } from "@/services/health-score-service";

type DecimalLike = {
  toString(): string;
};

type BucketKind = "day" | "week" | "month";

export type WaterParameterStatsPoint = {
  date: string;
  measuredAt: string;
  temperatureC: number | null;
  ph: number | null;
  kh: number | null;
  gh: number | null;
  nitriteMgL: number | null;
  nitrateMgL: number | null;
  ammoniaMgL: number | null;
  phosphateMgL: number | null;
  tdsPpm: number | null;
};

export type HealthScoreStatsPoint = {
  date: string;
  score: number;
};

export type MaintenanceFrequencyPoint = {
  date: string;
  count: number;
  waterChangeLiters: number;
  waterChangePercent: number | null;
};

export type FeedingFrequencyPoint = {
  date: string;
  count: number;
};

export type AlertHistoryPoint = {
  date: string;
  information: number;
  attention: number;
  important: number;
  critical: number;
  resolved: number;
};

export type AquariumStatsData = {
  aquarium: {
    id: string;
    name: string;
  };
  period: WaterPeriod;
  waterParameters: WaterParameterStatsPoint[];
  healthScores: HealthScoreStatsPoint[];
  maintenanceFrequency: MaintenanceFrequencyPoint[];
  feedingFrequency: FeedingFrequencyPoint[];
  alertHistory: AlertHistoryPoint[];
};

function decimalToNumber(value: DecimalLike | null | undefined) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value.toString());

  return Number.isFinite(numberValue) ? numberValue : null;
}

function getBucketKind(period: WaterPeriod): BucketKind {
  if (period === "7d" || period === "30d") {
    return "day";
  }

  if (period === "3m") {
    return "week";
  }

  return "month";
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getBucketDate(date: Date, bucketKind: BucketKind) {
  const bucketDate = new Date(date);

  if (bucketKind === "day") {
    bucketDate.setHours(0, 0, 0, 0);
    return bucketDate;
  }

  if (bucketKind === "week") {
    return getStartOfWeek(bucketDate);
  }

  bucketDate.setDate(1);
  bucketDate.setHours(0, 0, 0, 0);

  return bucketDate;
}

function getBucketKey(date: Date, bucketKind: BucketKind) {
  return getBucketDate(date, bucketKind).toISOString();
}

function getBucketLabel(date: Date, bucketKind: BucketKind) {
  const bucketDate = getBucketDate(date, bucketKind);

  if (bucketKind === "month") {
    return bucketDate.toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });
  }

  return bucketDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function sortByBucket<T extends { bucketDate: Date }>(items: T[]) {
  return items.sort((a, b) => a.bucketDate.getTime() - b.bucketDate.getTime());
}

function buildMaintenanceFrequency(
  logs: {
    performedAt: Date;
    waterChangeLiters: DecimalLike | null;
    waterChangePercent: DecimalLike | null;
  }[],
  bucketKind: BucketKind
): MaintenanceFrequencyPoint[] {
  const buckets = new Map<
    string,
    {
      bucketDate: Date;
      date: string;
      count: number;
      waterChangeLiters: number;
      percentTotal: number;
      percentCount: number;
    }
  >();

  for (const log of logs) {
    const key = getBucketKey(log.performedAt, bucketKind);
    const existing = buckets.get(key) ?? {
      bucketDate: getBucketDate(log.performedAt, bucketKind),
      date: getBucketLabel(log.performedAt, bucketKind),
      count: 0,
      waterChangeLiters: 0,
      percentTotal: 0,
      percentCount: 0,
    };
    const liters = decimalToNumber(log.waterChangeLiters);
    const percent = decimalToNumber(log.waterChangePercent);

    existing.count += 1;
    existing.waterChangeLiters += liters ?? 0;

    if (percent !== null) {
      existing.percentTotal += percent;
      existing.percentCount += 1;
    }

    buckets.set(key, existing);
  }

  return sortByBucket([...buckets.values()]).map((bucket) => ({
    date: bucket.date,
    count: bucket.count,
    waterChangeLiters: Number(bucket.waterChangeLiters.toFixed(1)),
    waterChangePercent:
      bucket.percentCount > 0
        ? Number((bucket.percentTotal / bucket.percentCount).toFixed(1))
        : null,
  }));
}

function buildFeedingFrequency(
  logs: { fedAt: Date }[],
  bucketKind: BucketKind
): FeedingFrequencyPoint[] {
  const buckets = new Map<
    string,
    {
      bucketDate: Date;
      date: string;
      count: number;
    }
  >();

  for (const log of logs) {
    const key = getBucketKey(log.fedAt, bucketKind);
    const existing = buckets.get(key) ?? {
      bucketDate: getBucketDate(log.fedAt, bucketKind),
      date: getBucketLabel(log.fedAt, bucketKind),
      count: 0,
    };

    existing.count += 1;
    buckets.set(key, existing);
  }

  return sortByBucket([...buckets.values()]).map(({ date, count }) => ({
    date,
    count,
  }));
}

function buildAlertHistory(
  alerts: {
    severity: string;
    triggeredAt: Date;
    resolvedAt: Date | null;
  }[],
  bucketKind: BucketKind
): AlertHistoryPoint[] {
  const buckets = new Map<
    string,
    {
      bucketDate: Date;
      date: string;
      information: number;
      attention: number;
      important: number;
      critical: number;
      resolved: number;
    }
  >();

  function getOrCreateBucket(date: Date) {
    const key = getBucketKey(date, bucketKind);
    const existing = buckets.get(key) ?? {
      bucketDate: getBucketDate(date, bucketKind),
      date: getBucketLabel(date, bucketKind),
      information: 0,
      attention: 0,
      important: 0,
      critical: 0,
      resolved: 0,
    };

    buckets.set(key, existing);

    return existing;
  }

  for (const alert of alerts) {
    const triggerBucket = getOrCreateBucket(alert.triggeredAt);

    if (alert.severity === "CRITICAL") {
      triggerBucket.critical += 1;
    } else if (alert.severity === "IMPORTANT") {
      triggerBucket.important += 1;
    } else if (alert.severity === "ATTENTION") {
      triggerBucket.attention += 1;
    } else {
      triggerBucket.information += 1;
    }

    if (alert.resolvedAt) {
      getOrCreateBucket(alert.resolvedAt).resolved += 1;
    }
  }

  return sortByBucket([...buckets.values()]).map(
    ({ date, information, attention, important, critical, resolved }) => ({
      date,
      information,
      attention,
      important,
      critical,
      resolved,
    })
  );
}

export async function getAquariumStatsData(
  userId: string,
  aquariumId: string,
  period: WaterPeriod
): Promise<AquariumStatsData | null> {
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!aquarium) {
    return null;
  }

  await calculateAquariumHealthScoreForUser(userId, aquarium.id);

  const since = getWaterPeriodDate(period);
  const bucketKind = getBucketKind(period);
  const [
    waterParameters,
    healthScores,
    waterChanges,
    feedings,
    alerts,
  ] = await Promise.all([
    prisma.waterParameter.findMany({
      where: {
        userId,
        aquariumId: aquarium.id,
        measuredAt: since ? { gte: since } : undefined,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        measuredAt: "asc",
      },
      select: {
        measuredAt: true,
        temperatureC: true,
        ph: true,
        kh: true,
        gh: true,
        nitriteMgL: true,
        nitrateMgL: true,
        ammoniaMgL: true,
        phosphateMgL: true,
        tdsPpm: true,
      },
    }),
    prisma.aquariumHealthScore.findMany({
      where: {
        userId,
        aquariumId: aquarium.id,
        calculatedAt: since ? { gte: since } : undefined,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        calculatedAt: "asc",
      },
      select: {
        score: true,
        calculatedAt: true,
      },
    }),
    prisma.maintenanceLog.findMany({
      where: {
        userId,
        aquariumId: aquarium.id,
        type: "WATER_CHANGE",
        performedAt: since ? { gte: since } : undefined,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        performedAt: "asc",
      },
      select: {
        performedAt: true,
        waterChangeLiters: true,
        waterChangePercent: true,
      },
    }),
    prisma.feedingLog.findMany({
      where: {
        userId,
        aquariumId: aquarium.id,
        fedAt: since ? { gte: since } : undefined,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        fedAt: "asc",
      },
      select: {
        fedAt: true,
      },
    }),
    prisma.alert.findMany({
      where: {
        userId,
        aquariumId: aquarium.id,
        OR: since
          ? [
              {
                triggeredAt: {
                  gte: since,
                },
              },
              {
                resolvedAt: {
                  gte: since,
                },
              },
            ]
          : undefined,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        triggeredAt: "asc",
      },
      select: {
        severity: true,
        triggeredAt: true,
        resolvedAt: true,
      },
    }),
  ]);

  return {
    aquarium,
    period,
    waterParameters: waterParameters.map((measurement) => ({
      date: measurement.measuredAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      measuredAt: measurement.measuredAt.toISOString(),
      temperatureC: decimalToNumber(measurement.temperatureC),
      ph: decimalToNumber(measurement.ph),
      kh: measurement.kh,
      gh: measurement.gh,
      nitriteMgL: decimalToNumber(measurement.nitriteMgL),
      nitrateMgL: decimalToNumber(measurement.nitrateMgL),
      ammoniaMgL: decimalToNumber(measurement.ammoniaMgL),
      phosphateMgL: decimalToNumber(measurement.phosphateMgL),
      tdsPpm: measurement.tdsPpm,
    })),
    healthScores: healthScores.map((score) => ({
      date: score.calculatedAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: score.score,
    })),
    maintenanceFrequency: buildMaintenanceFrequency(waterChanges, bucketKind),
    feedingFrequency: buildFeedingFrequency(feedings, bucketKind),
    alertHistory: buildAlertHistory(alerts, bucketKind),
  };
}
