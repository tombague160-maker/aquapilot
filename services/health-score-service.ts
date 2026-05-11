import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

type DecimalLike = {
  toString(): string;
};

export type HealthScoreInterpretation =
  | "excellent"
  | "bon"
  | "attention"
  | "probleme important"
  | "critique";

export type HealthScoreCategory = {
  key: "waterQuality" | "maintenance" | "population" | "stability";
  label: string;
  score: number;
  maxScore: number;
  issues: string[];
};

export type HealthScoreSnapshot = {
  id: string;
  aquariumId: string;
  score: number;
  interpretation: HealthScoreInterpretation;
  summary: string;
  calculatedAt: string;
  calculatedAtLabel: string;
  categories: HealthScoreCategory[];
};

export type HealthScoreChartPoint = {
  date: string;
  score: number;
};

type ScoreFactors = {
  interpretation: HealthScoreInterpretation;
  categories: HealthScoreCategory[];
  generatedAt: string;
};

type RawHealthScore = {
  id: string;
  aquariumId: string;
  score: number;
  calculatedAt: Date;
  summary: string | null;
  factors: unknown;
};

function decimalToNumber(value: DecimalLike | null | undefined) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value.toString());

  return Number.isFinite(numberValue) ? numberValue : null;
}

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function clampScore(score: number, maxScore: number) {
  return Math.max(0, Math.min(maxScore, Math.round(score)));
}

function getInterpretation(score: number): HealthScoreInterpretation {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 75) {
    return "bon";
  }

  if (score >= 50) {
    return "attention";
  }

  if (score >= 25) {
    return "probleme important";
  }

  return "critique";
}

function getSummary(score: number, categories: HealthScoreCategory[]) {
  const interpretation = getInterpretation(score);
  const mainIssue = categories
    .flatMap((category) => category.issues.map((issue) => ({ category, issue })))
    .sort(
      (a, b) =>
        b.category.maxScore - b.category.score -
        (a.category.maxScore - a.category.score)
    )[0];

  if (!mainIssue) {
    return `Score ${interpretation} : aucun point critique detecte.`;
  }

  return `Score ${interpretation} : ${mainIssue.issue}`;
}

function extractFactors(factors: unknown): ScoreFactors | null {
  if (!factors || typeof factors !== "object") {
    return null;
  }

  const maybeFactors = factors as Partial<ScoreFactors>;

  if (!Array.isArray(maybeFactors.categories)) {
    return null;
  }

  return {
    interpretation: maybeFactors.interpretation ?? "attention",
    categories: maybeFactors.categories,
    generatedAt: maybeFactors.generatedAt ?? new Date().toISOString(),
  };
}

function toHealthScoreSnapshot(score: RawHealthScore): HealthScoreSnapshot {
  const factors = extractFactors(score.factors);

  return {
    id: score.id,
    aquariumId: score.aquariumId,
    score: score.score,
    interpretation: factors?.interpretation ?? getInterpretation(score.score),
    summary: score.summary ?? "Score calcule.",
    calculatedAt: score.calculatedAt.toISOString(),
    calculatedAtLabel: score.calculatedAt.toLocaleDateString("fr-FR", {
      dateStyle: "medium",
    }),
    categories: factors?.categories ?? [],
  };
}

function latestDateByType(
  logs: { type: string; performedAt: Date }[],
  type: string
) {
  return logs.find((log) => log.type === type)?.performedAt ?? null;
}

function getRangeProblemCount(
  actual: number | null,
  ranges: { min: number | null; max: number | null }[]
) {
  if (actual === null) {
    return 0;
  }

  return ranges.filter((range) => {
    const tooLow = range.min !== null && actual < range.min;
    const tooHigh = range.max !== null && actual > range.max;

    return tooLow || tooHigh;
  }).length;
}

function buildWaterCategory(input: {
  latestWaterDate: Date | null;
  nitrite: number | null;
  ammonia: number | null;
  nitrate: number | null;
  phOutOfRangeCount: number;
  temperatureOutOfRangeCount: number;
  activeCriticalAlerts: number;
}) {
  let score = 40;
  const issues: string[] = [];
  const waterAgeDays = daysSince(input.latestWaterDate);

  if (waterAgeDays === null) {
    score -= 18;
    issues.push("aucun test d'eau recent n'est disponible");
  } else if (waterAgeDays > 14) {
    score -= 16;
    issues.push(`dernier test d'eau il y a ${waterAgeDays} jours`);
  } else if (waterAgeDays > 7) {
    score -= 10;
    issues.push(`test d'eau espace de ${waterAgeDays} jours`);
  }

  if (input.nitrite !== null && input.nitrite > 0) {
    score -= 18;
    issues.push("NO2 detecte");
  }

  if (input.ammonia !== null && input.ammonia > 0) {
    score -= 18;
    issues.push("NH3/NH4 detecte");
  }

  if (input.nitrate !== null && input.nitrate > 50) {
    score -= 10;
    issues.push("NO3 au-dessus de 50 mg/L");
  } else if (input.nitrate !== null && input.nitrate > 25) {
    score -= 5;
    issues.push("NO3 au-dessus de 25 mg/L");
  }

  if (input.phOutOfRangeCount > 0) {
    score -= 5;
    issues.push("pH hors plage pour une partie des poissons");
  }

  if (input.temperatureOutOfRangeCount > 0) {
    score -= 5;
    issues.push("temperature hors plage pour une partie des poissons");
  }

  if (input.activeCriticalAlerts > 0) {
    score -= 6;
    issues.push("alerte critique active sur le bac");
  }

  return {
    key: "waterQuality",
    label: "Qualite de l'eau",
    score: clampScore(score, 40),
    maxScore: 40,
    issues,
  } satisfies HealthScoreCategory;
}

function buildMaintenanceCategory(input: {
  lastWaterChange: Date | null;
  lastFilterCleaning: Date | null;
  overdueReminderCount: number;
  maintenanceAlertCount: number;
}) {
  let score = 20;
  const issues: string[] = [];
  const waterChangeAgeDays = daysSince(input.lastWaterChange);
  const filterCleaningAgeDays = daysSince(input.lastFilterCleaning);

  if (waterChangeAgeDays === null) {
    score -= 6;
    issues.push("aucun changement d'eau enregistre");
  } else if (waterChangeAgeDays > 30) {
    score -= 12;
    issues.push(`changement d'eau absent depuis ${waterChangeAgeDays} jours`);
  } else if (waterChangeAgeDays > 14) {
    score -= 8;
    issues.push(`changement d'eau date de ${waterChangeAgeDays} jours`);
  }

  if (filterCleaningAgeDays === null) {
    score -= 3;
    issues.push("aucun entretien filtre enregistre");
  } else if (filterCleaningAgeDays > 60) {
    score -= 6;
    issues.push(`filtre non entretenu depuis ${filterCleaningAgeDays} jours`);
  } else if (filterCleaningAgeDays > 45) {
    score -= 4;
    issues.push(`entretien filtre date de ${filterCleaningAgeDays} jours`);
  }

  if (input.overdueReminderCount > 0) {
    score -= Math.min(5, input.overdueReminderCount * 2);
    issues.push(`${input.overdueReminderCount} rappel(s) en retard`);
  }

  if (input.maintenanceAlertCount > 0) {
    score -= Math.min(4, input.maintenanceAlertCount * 2);
    issues.push("alertes d'entretien actives");
  }

  return {
    key: "maintenance",
    label: "Entretien",
    score: clampScore(score, 20),
    maxScore: 20,
    issues,
  } satisfies HealthScoreCategory;
}

function buildPopulationCategory(input: {
  fishCount: number;
  plantCount: number;
  volumeLiters: number | null;
  minTankViolations: number;
  groupViolations: number;
  phOutOfRangeCount: number;
  temperatureOutOfRangeCount: number;
  meltingPlantCount: number;
}) {
  let score = 20;
  const issues: string[] = [];
  const densePopulation =
    input.volumeLiters !== null
      ? input.fishCount > Math.max(8, input.volumeLiters / 6)
      : input.fishCount >= 25;

  if (densePopulation) {
    score -= 5;
    issues.push("population dense pour le volume renseigne");
  }

  if (input.minTankViolations > 0) {
    score -= 4;
    issues.push("volume minimum non respecte pour certaines especes");
  }

  if (input.groupViolations > 0) {
    score -= 4;
    issues.push("taille de groupe insuffisante pour certaines especes");
  }

  if (input.phOutOfRangeCount > 0 || input.temperatureOutOfRangeCount > 0) {
    score -= 4;
    issues.push("compatibilite poissons a verifier avec les parametres");
  }

  if (input.meltingPlantCount > 0) {
    score -= Math.min(3, input.meltingPlantCount);
    issues.push("certaines plantes sont signalees fragilisees");
  }

  if (input.fishCount > 0 && input.plantCount === 0) {
    score -= 2;
    issues.push("aucune plante active pour soutenir l'equilibre du bac");
  }

  return {
    key: "population",
    label: "Population",
    score: clampScore(score, 20),
    maxScore: 20,
    issues,
  } satisfies HealthScoreCategory;
}

function buildStabilityCategory(input: {
  ageDays: number | null;
  activeAlertCount: number;
  importantAlertCount: number;
  criticalAlertCount: number;
  feedingLast24Hours: number;
  feedingLast7Days: number;
  lastFeedingDate: Date | null;
  fishCount: number;
  lightingHours: number | null;
}) {
  let score = 20;
  const issues: string[] = [];

  if (input.ageDays !== null && input.ageDays < 42) {
    score -= 5;
    issues.push("bac lance depuis moins de 6 semaines");
  }

  if (input.criticalAlertCount > 0) {
    score -= 8;
    issues.push("alerte critique active");
  } else if (input.importantAlertCount > 0) {
    score -= 5;
    issues.push("alerte importante active");
  } else if (input.activeAlertCount > 0) {
    score -= 2;
    issues.push("alerte active a surveiller");
  }

  if (input.feedingLast24Hours >= 4 || input.feedingLast7Days / 7 > 2) {
    score -= 4;
    issues.push("nourrissage tres frequent");
  }

  const feedingAgeDays = daysSince(input.lastFeedingDate);

  if (input.fishCount > 0 && feedingAgeDays !== null && feedingAgeDays > 2) {
    score -= 3;
    issues.push(`dernier nourrissage il y a ${feedingAgeDays} jours`);
  }

  if (input.lightingHours !== null && input.lightingHours > 10) {
    score -= 3;
    issues.push("duree d'eclairage superieure a 10 h/jour");
  }

  return {
    key: "stability",
    label: "Stabilite",
    score: clampScore(score, 20),
    maxScore: 20,
    issues,
  } satisfies HealthScoreCategory;
}

async function saveHealthScore(input: {
  userId: string;
  aquariumId: string;
  score: number;
  summary: string;
  factors: ScoreFactors;
}) {
  const existingTodayScore = await prisma.aquariumHealthScore.findFirst({
    where: {
      userId: input.userId,
      aquariumId: input.aquariumId,
      calculatedAt: {
        gte: startOfToday(),
      },
    },
    orderBy: {
      calculatedAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (existingTodayScore) {
    return prisma.aquariumHealthScore.update({
      where: {
        id: existingTodayScore.id,
      },
      data: {
        score: input.score,
        summary: input.summary,
        factors: input.factors,
        calculatedAt: new Date(),
      },
      select: {
        id: true,
        aquariumId: true,
        score: true,
        calculatedAt: true,
        summary: true,
        factors: true,
      },
    });
  }

  return prisma.aquariumHealthScore.create({
    data: input,
    select: {
      id: true,
      aquariumId: true,
      score: true,
      calculatedAt: true,
      summary: true,
      factors: true,
    },
  });
}

export async function calculateAquariumHealthScoreForUser(
  userId: string,
  aquariumId: string
): Promise<HealthScoreSnapshot | null> {
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      volumeLiters: true,
      startedAt: true,
      currentTemperatureC: true,
      targetTemperatureC: true,
      lightingHoursPerDay: true,
    },
  });

  if (!aquarium) {
    return null;
  }

  const [
    latestWater,
    fishEntries,
    plantEntries,
    maintenanceLogs,
    activeAlerts,
    overdueReminderCount,
    feedingLast24Hours,
    feedingLast7Days,
    latestFeeding,
  ] = await Promise.all([
    prisma.waterParameter.findFirst({
      where: {
        userId,
        aquariumId,
      },
      orderBy: {
        measuredAt: "desc",
      },
      select: {
        measuredAt: true,
        temperatureC: true,
        ph: true,
        ammoniaMgL: true,
        nitriteMgL: true,
        nitrateMgL: true,
      },
    }),
    prisma.aquariumFish.findMany({
      where: {
        userId,
        aquariumId,
        status: "ACTIVE",
      },
      select: {
        quantity: true,
        species: {
          select: {
            minTankLiters: true,
            minTemperatureC: true,
            maxTemperatureC: true,
            minPh: true,
            maxPh: true,
            minGroupSize: true,
          },
        },
      },
    }),
    prisma.aquariumPlant.findMany({
      where: {
        userId,
        aquariumId,
        status: {
          not: "REMOVED",
        },
      },
      select: {
        quantity: true,
        status: true,
      },
    }),
    prisma.maintenanceLog.findMany({
      where: {
        userId,
        aquariumId,
      },
      orderBy: {
        performedAt: "desc",
      },
      select: {
        type: true,
        performedAt: true,
      },
      take: 80,
    }),
    prisma.alert.findMany({
      where: {
        userId,
        aquariumId,
        status: {
          in: ["OPEN", "ACKNOWLEDGED"],
        },
      },
      select: {
        type: true,
        severity: true,
      },
    }),
    prisma.reminder.count({
      where: {
        userId,
        aquariumId,
        status: "PENDING",
        dueAt: {
          lt: startOfToday(),
        },
      },
    }),
    prisma.feedingLog.count({
      where: {
        userId,
        aquariumId,
        fedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.feedingLog.count({
      where: {
        userId,
        aquariumId,
        fedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.feedingLog.findFirst({
      where: {
        userId,
        aquariumId,
      },
      orderBy: {
        fedAt: "desc",
      },
      select: {
        fedAt: true,
      },
    }),
  ]);

  const volumeLiters = decimalToNumber(aquarium.volumeLiters);
  const fishCount = fishEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const plantCount = plantEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const waterTemperature =
    decimalToNumber(latestWater?.temperatureC) ??
    decimalToNumber(aquarium.currentTemperatureC) ??
    decimalToNumber(aquarium.targetTemperatureC);
  const ph = decimalToNumber(latestWater?.ph);
  const fishRanges = fishEntries.map((entry) => ({
    minTemperature: decimalToNumber(entry.species.minTemperatureC),
    maxTemperature: decimalToNumber(entry.species.maxTemperatureC),
    minPh: decimalToNumber(entry.species.minPh),
    maxPh: decimalToNumber(entry.species.maxPh),
  }));
  const phOutOfRangeCount = getRangeProblemCount(
    ph,
    fishRanges.map((range) => ({ min: range.minPh, max: range.maxPh }))
  );
  const temperatureOutOfRangeCount = getRangeProblemCount(
    waterTemperature,
    fishRanges.map((range) => ({
      min: range.minTemperature,
      max: range.maxTemperature,
    }))
  );
  const minTankViolations =
    volumeLiters === null
      ? 0
      : fishEntries.filter(
          (entry) =>
            entry.species.minTankLiters !== null &&
            volumeLiters < entry.species.minTankLiters
        ).length;
  const groupViolations = fishEntries.filter(
    (entry) =>
      entry.species.minGroupSize !== null &&
      entry.quantity < entry.species.minGroupSize
  ).length;
  const activeCriticalAlerts = activeAlerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;
  const activeImportantAlerts = activeAlerts.filter(
    (alert) => alert.severity === "IMPORTANT"
  ).length;
  const maintenanceAlertCount = activeAlerts.filter(
    (alert) => alert.type === "MAINTENANCE_OVERDUE"
  ).length;
  const lastFilterCleaning =
    latestDateByType(maintenanceLogs, "FILTER_CLEANING") ??
    latestDateByType(maintenanceLogs, "FILTER_MEDIA_RINSE");
  const categories = [
    buildWaterCategory({
      latestWaterDate: latestWater?.measuredAt ?? null,
      nitrite: decimalToNumber(latestWater?.nitriteMgL),
      ammonia: decimalToNumber(latestWater?.ammoniaMgL),
      nitrate: decimalToNumber(latestWater?.nitrateMgL),
      phOutOfRangeCount,
      temperatureOutOfRangeCount,
      activeCriticalAlerts,
    }),
    buildMaintenanceCategory({
      lastWaterChange: latestDateByType(maintenanceLogs, "WATER_CHANGE"),
      lastFilterCleaning,
      overdueReminderCount,
      maintenanceAlertCount,
    }),
    buildPopulationCategory({
      fishCount,
      plantCount,
      volumeLiters,
      minTankViolations,
      groupViolations,
      phOutOfRangeCount,
      temperatureOutOfRangeCount,
      meltingPlantCount: plantEntries.filter((entry) => entry.status === "MELTING")
        .length,
    }),
    buildStabilityCategory({
      ageDays: daysSince(aquarium.startedAt),
      activeAlertCount: activeAlerts.length,
      importantAlertCount: activeImportantAlerts,
      criticalAlertCount: activeCriticalAlerts,
      feedingLast24Hours,
      feedingLast7Days,
      lastFeedingDate: latestFeeding?.fedAt ?? null,
      fishCount,
      lightingHours: decimalToNumber(aquarium.lightingHoursPerDay),
    }),
  ] satisfies HealthScoreCategory[];
  const score = categories.reduce((sum, category) => sum + category.score, 0);
  const interpretation = getInterpretation(score);
  const summary = getSummary(score, categories);
  const savedScore = await saveHealthScore({
    userId,
    aquariumId,
    score,
    summary,
    factors: {
      interpretation,
      categories,
      generatedAt: new Date().toISOString(),
    },
  });

  return toHealthScoreSnapshot(savedScore);
}

export async function calculateAquariumHealthScore(aquariumId: string) {
  const user = await requireUser();
  return calculateAquariumHealthScoreForUser(user.id, aquariumId);
}

export async function getAquariumHealthScoreHistory(
  userId: string,
  aquariumId: string,
  take = 30
): Promise<HealthScoreChartPoint[]> {
  const scores = await prisma.aquariumHealthScore.findMany({
    where: {
      userId,
      aquariumId,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      calculatedAt: "desc",
    },
    take,
    select: {
      score: true,
      calculatedAt: true,
    },
  });

  return scores
    .reverse()
    .map((score) => ({
      date: score.calculatedAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: score.score,
    }));
}

export async function calculateUserAquariumHealthScores(userId: string) {
  const aquariums = await prisma.aquarium.findMany({
    where: {
      userId,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
    },
  });
  const scores = await Promise.all(
    aquariums.map(async (aquarium) => {
      const score = await calculateAquariumHealthScoreForUser(userId, aquarium.id);

      return score
        ? {
            aquariumId: aquarium.id,
            aquariumName: aquarium.name,
            score,
          }
        : null;
    })
  );

  return scores.filter((score): score is NonNullable<typeof score> => Boolean(score));
}
