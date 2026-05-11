import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAlertSeverityLabel } from "@/rules/alert";
import { getAquariumTypeLabel } from "@/rules/aquarium";
import { getFeedingFoodTypeLabel } from "@/rules/feeding";
import { getMaintenanceTypeLabel } from "@/rules/maintenance";
import { getNoteTypeLabel } from "@/rules/note";
import { getPlantStatusLabel } from "@/rules/plant";
import {
  getReminderPriorityLabel,
  getReminderTypeLabel,
} from "@/rules/reminder";
import { calculateAquariumHealthScoreForUser } from "@/services/health-score-service";

type DecimalLike = {
  toString(): string;
};

export type AquariumAiContext = Awaited<
  ReturnType<typeof buildAquariumAiContextForUser>
>;

function decimalToNumber(value: DecimalLike | null | undefined) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value.toString());

  return Number.isFinite(numberValue) ? numberValue : null;
}

function dateToIso(date: Date | null | undefined) {
  return date?.toISOString() ?? null;
}

function dateToLabel(date: Date | null | undefined) {
  return (
    date?.toLocaleDateString("fr-FR", {
      dateStyle: "medium",
    }) ?? null
  );
}

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function buildDataQuality(input: {
  hasLatestWater: boolean;
  fishCount: number;
  plantCount: number;
  maintenanceCount: number;
  feedingCount: number;
  noteCount: number;
  hasHealthScore: boolean;
}) {
  const missing: string[] = [];

  if (!input.hasLatestWater) {
    missing.push("derniers parametres d'eau");
  }

  if (input.fishCount === 0) {
    missing.push("population poissons");
  }

  if (input.plantCount === 0) {
    missing.push("plantes");
  }

  if (input.maintenanceCount === 0) {
    missing.push("historique d'entretien recent");
  }

  if (input.feedingCount === 0) {
    missing.push("historique d'alimentation recent");
  }

  if (input.noteCount === 0) {
    missing.push("notes utilisateur");
  }

  if (!input.hasHealthScore) {
    missing.push("score sante");
  }

  return {
    missing,
    instruction:
      "Ne jamais inventer ces donnees. Si elles manquent, le dire clairement.",
  };
}

export async function buildAquariumAiContextForUser(
  userId: string,
  aquariumId: string
) {
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      volumeLiters: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
      startedAt: true,
      currentTemperatureC: true,
      targetTemperatureC: true,
      filtrationType: true,
      filterFlowLitersHour: true,
      heaterType: true,
      heaterPowerWatts: true,
      lightingType: true,
      lightingHoursPerDay: true,
      substrate: true,
      decorations: true,
      hasCo2: true,
      fertilizer: true,
      notes: true,
      createdAt: true,
      _count: {
        select: {
          fish: true,
          plants: true,
          alerts: true,
          reminders: true,
          maintenanceLogs: true,
          feedingLogs: true,
          noteEntries: true,
        },
      },
    },
  });

  if (!aquarium) {
    return null;
  }

  const [
    latestWater,
    recentWaterParameters,
    fishEntries,
    plantEntries,
    reminders,
    alerts,
    maintenanceLogs,
    feedingLogs,
    notes,
    healthScore,
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
        gh: true,
        kh: true,
        ammoniaMgL: true,
        nitriteMgL: true,
        nitrateMgL: true,
        phosphateMgL: true,
        ironMgL: true,
        tdsPpm: true,
        oxygenMgL: true,
        co2MgL: true,
        chlorineMgL: true,
        notes: true,
      },
    }),
    prisma.waterParameter.findMany({
      where: {
        userId,
        aquariumId,
      },
      orderBy: {
        measuredAt: "desc",
      },
      take: 10,
      select: {
        measuredAt: true,
        temperatureC: true,
        ph: true,
        gh: true,
        kh: true,
        ammoniaMgL: true,
        nitriteMgL: true,
        nitrateMgL: true,
        phosphateMgL: true,
        tdsPpm: true,
      },
    }),
    prisma.aquariumFish.findMany({
      where: {
        userId,
        aquariumId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        quantity: true,
        acquiredAt: true,
        notes: true,
        species: {
          select: {
            commonName: true,
            scientificName: true,
            adultSizeCm: true,
            minTankLiters: true,
            minTemperatureC: true,
            maxTemperatureC: true,
            minPh: true,
            maxPh: true,
            minGh: true,
            maxGh: true,
            behavior: true,
            swimmingZone: true,
            difficulty: true,
            minGroupSize: true,
            diet: true,
            lifeExpectancyYears: true,
            shrimpCompatibility: true,
            plantCompatibility: true,
            notes: true,
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
      orderBy: {
        createdAt: "desc",
      },
      select: {
        quantity: true,
        status: true,
        plantedAt: true,
        placement: true,
        notes: true,
        species: {
          select: {
            commonName: true,
            scientificName: true,
            difficulty: true,
            lightNeed: true,
            co2Need: true,
            fertilizerNeed: true,
            growthRate: true,
            placement: true,
            minTemperatureC: true,
            maxTemperatureC: true,
            minPh: true,
            maxPh: true,
            trimmingEveryDays: true,
            notes: true,
          },
        },
      },
    }),
    prisma.reminder.findMany({
      where: {
        userId,
        aquariumId,
        status: {
          in: ["PENDING", "SNOOZED"],
        },
      },
      orderBy: {
        dueAt: "asc",
      },
      take: 12,
      select: {
        type: true,
        title: true,
        description: true,
        dueAt: true,
        priority: true,
        status: true,
        isAutoGenerated: true,
      },
    }),
    prisma.alert.findMany({
      where: {
        userId,
        aquariumId,
      },
      orderBy: [{ status: "asc" }, { triggeredAt: "desc" }],
      take: 12,
      select: {
        type: true,
        title: true,
        message: true,
        severity: true,
        status: true,
        probableCause: true,
        recommendedAction: true,
        recommendedDelay: true,
        triggeredAt: true,
        resolvedAt: true,
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
      take: 10,
      select: {
        type: true,
        title: true,
        performedAt: true,
        waterChangeLiters: true,
        waterChangePercent: true,
        notes: true,
      },
    }),
    prisma.feedingLog.findMany({
      where: {
        userId,
        aquariumId,
      },
      orderBy: {
        fedAt: "desc",
      },
      take: 10,
      select: {
        foodType: true,
        amount: true,
        species: true,
        fedAt: true,
        notes: true,
        observationAfter: true,
      },
    }),
    prisma.note.findMany({
      where: {
        userId,
        aquariumId,
      },
      orderBy: [{ pinned: "desc" }, { notedAt: "desc" }],
      take: 15,
      select: {
        type: true,
        title: true,
        content: true,
        notedAt: true,
        tags: true,
      },
    }),
    calculateAquariumHealthScoreForUser(userId, aquariumId),
  ]);

  const fishCount = fishEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const plantCount = plantEntries.reduce(
    (sum, entry) => sum + entry.quantity,
    0
  );

  return {
    generatedAt: new Date().toISOString(),
    rules: {
      language: "fr-FR",
      noFabrication:
        "Utiliser uniquement les donnees presentes. Ne pas inventer de mesures, especes, dates ou historiques.",
      medicalLimit:
        "Conseils aquariophiles uniquement. En cas de risque immediat pour le vivant, recommander une action prudente et une verification manuelle.",
    },
    aquarium: {
      id: aquarium.id,
      name: aquarium.name,
      description: aquarium.description,
      type: aquarium.type,
      typeLabel: getAquariumTypeLabel(aquarium.type),
      volumeLiters: decimalToNumber(aquarium.volumeLiters),
      dimensionsCm: {
        length: decimalToNumber(aquarium.lengthCm),
        width: decimalToNumber(aquarium.widthCm),
        height: decimalToNumber(aquarium.heightCm),
      },
      startedAt: dateToIso(aquarium.startedAt),
      startedAtLabel: dateToLabel(aquarium.startedAt),
      ageDays: daysSince(aquarium.startedAt),
      currentTemperatureC: decimalToNumber(aquarium.currentTemperatureC),
      targetTemperatureC: decimalToNumber(aquarium.targetTemperatureC),
      filtrationType: aquarium.filtrationType,
      filterFlowLitersHour: aquarium.filterFlowLitersHour,
      heaterType: aquarium.heaterType,
      heaterPowerWatts: aquarium.heaterPowerWatts,
      lightingType: aquarium.lightingType,
      lightingHoursPerDay: decimalToNumber(aquarium.lightingHoursPerDay),
      substrate: aquarium.substrate,
      decorations: aquarium.decorations,
      hasCo2: aquarium.hasCo2,
      fertilizer: aquarium.fertilizer,
      ownerNotes: aquarium.notes,
      counts: {
        fishEntries: aquarium._count.fish,
        fishIndividuals: fishCount,
        plantEntries: aquarium._count.plants,
        plantUnits: plantCount,
        alerts: aquarium._count.alerts,
        reminders: aquarium._count.reminders,
        maintenanceLogs: aquarium._count.maintenanceLogs,
        feedingLogs: aquarium._count.feedingLogs,
        notes: aquarium._count.noteEntries,
      },
    },
    latestWaterParameters: latestWater
      ? {
          measuredAt: dateToIso(latestWater.measuredAt),
          measuredAtLabel: dateToLabel(latestWater.measuredAt),
          temperatureC: decimalToNumber(latestWater.temperatureC),
          ph: decimalToNumber(latestWater.ph),
          gh: latestWater.gh,
          kh: latestWater.kh,
          ammoniaMgL: decimalToNumber(latestWater.ammoniaMgL),
          nitriteMgL: decimalToNumber(latestWater.nitriteMgL),
          nitrateMgL: decimalToNumber(latestWater.nitrateMgL),
          phosphateMgL: decimalToNumber(latestWater.phosphateMgL),
          ironMgL: decimalToNumber(latestWater.ironMgL),
          tdsPpm: latestWater.tdsPpm,
          oxygenMgL: decimalToNumber(latestWater.oxygenMgL),
          co2MgL: decimalToNumber(latestWater.co2MgL),
          chlorineMgL: decimalToNumber(latestWater.chlorineMgL),
          notes: latestWater.notes,
        }
      : null,
    recentWaterHistory: recentWaterParameters.map((measurement) => ({
      measuredAt: dateToIso(measurement.measuredAt),
      temperatureC: decimalToNumber(measurement.temperatureC),
      ph: decimalToNumber(measurement.ph),
      gh: measurement.gh,
      kh: measurement.kh,
      ammoniaMgL: decimalToNumber(measurement.ammoniaMgL),
      nitriteMgL: decimalToNumber(measurement.nitriteMgL),
      nitrateMgL: decimalToNumber(measurement.nitrateMgL),
      phosphateMgL: decimalToNumber(measurement.phosphateMgL),
      tdsPpm: measurement.tdsPpm,
    })),
    fish: fishEntries.map((entry) => ({
      quantity: entry.quantity,
      acquiredAt: dateToIso(entry.acquiredAt),
      notes: entry.notes,
      commonName: entry.species.commonName,
      scientificName: entry.species.scientificName,
      adultSizeCm: decimalToNumber(entry.species.adultSizeCm),
      minTankLiters: entry.species.minTankLiters,
      temperatureRangeC: {
        min: decimalToNumber(entry.species.minTemperatureC),
        max: decimalToNumber(entry.species.maxTemperatureC),
      },
      phRange: {
        min: decimalToNumber(entry.species.minPh),
        max: decimalToNumber(entry.species.maxPh),
      },
      ghRange: {
        min: entry.species.minGh,
        max: entry.species.maxGh,
      },
      behavior: entry.species.behavior,
      swimmingZone: entry.species.swimmingZone,
      difficulty: entry.species.difficulty,
      minGroupSize: entry.species.minGroupSize,
      diet: entry.species.diet,
      lifeExpectancyYears: decimalToNumber(entry.species.lifeExpectancyYears),
      shrimpCompatibility: entry.species.shrimpCompatibility,
      plantCompatibility: entry.species.plantCompatibility,
      speciesNotes: entry.species.notes,
    })),
    plants: plantEntries.map((entry) => ({
      quantity: entry.quantity,
      status: entry.status,
      statusLabel: getPlantStatusLabel(entry.status),
      plantedAt: dateToIso(entry.plantedAt),
      placement: entry.placement ?? entry.species.placement,
      notes: entry.notes,
      commonName: entry.species.commonName,
      scientificName: entry.species.scientificName,
      difficulty: entry.species.difficulty,
      lightNeed: entry.species.lightNeed,
      co2Need: entry.species.co2Need,
      fertilizerNeed: entry.species.fertilizerNeed,
      growthRate: entry.species.growthRate,
      temperatureRangeC: {
        min: decimalToNumber(entry.species.minTemperatureC),
        max: decimalToNumber(entry.species.maxTemperatureC),
      },
      phRange: {
        min: decimalToNumber(entry.species.minPh),
        max: decimalToNumber(entry.species.maxPh),
      },
      trimmingEveryDays: entry.species.trimmingEveryDays,
      speciesNotes: entry.species.notes,
    })),
    reminders: reminders.map((reminder) => ({
      type: reminder.type,
      typeLabel: getReminderTypeLabel(reminder.type),
      title: reminder.title,
      description: reminder.description,
      dueAt: dateToIso(reminder.dueAt),
      dueAtLabel: dateToLabel(reminder.dueAt),
      isOverdue: reminder.dueAt < new Date(),
      priority: reminder.priority,
      priorityLabel: getReminderPriorityLabel(reminder.priority),
      status: reminder.status,
      isAutoGenerated: reminder.isAutoGenerated,
    })),
    alerts: alerts.map((alert) => ({
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      severityLabel: getAlertSeverityLabel(alert.severity),
      status: alert.status,
      probableCause: alert.probableCause,
      recommendedAction: alert.recommendedAction,
      recommendedDelay: alert.recommendedDelay,
      triggeredAt: dateToIso(alert.triggeredAt),
      resolvedAt: dateToIso(alert.resolvedAt),
    })),
    maintenance: maintenanceLogs.map((log) => ({
      type: log.type,
      typeLabel: getMaintenanceTypeLabel(log.type),
      title: log.title,
      performedAt: dateToIso(log.performedAt),
      waterChangeLiters: decimalToNumber(log.waterChangeLiters),
      waterChangePercent: decimalToNumber(log.waterChangePercent),
      notes: log.notes,
    })),
    feeding: feedingLogs.map((log) => ({
      foodType: log.foodType,
      foodTypeLabel: getFeedingFoodTypeLabel(log.foodType),
      amount: log.amount,
      species: log.species,
      fedAt: dateToIso(log.fedAt),
      notes: log.notes,
      observationAfter: log.observationAfter,
    })),
    notes: notes.map((note) => ({
      type: note.type,
      typeLabel: getNoteTypeLabel(note.type),
      title: note.title,
      content: note.content,
      notedAt: dateToIso(note.notedAt),
      tags: note.tags,
    })),
    healthScore,
    dataQuality: buildDataQuality({
      hasLatestWater: Boolean(latestWater),
      fishCount,
      plantCount,
      maintenanceCount: maintenanceLogs.length,
      feedingCount: feedingLogs.length,
      noteCount: notes.length,
      hasHealthScore: Boolean(healthScore),
    }),
  };
}

export async function buildAquariumAiContext(aquariumId: string) {
  const user = await requireUser();
  return buildAquariumAiContextForUser(user.id, aquariumId);
}
