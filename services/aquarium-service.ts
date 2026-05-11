import { prisma } from "@/lib/prisma";
import { getAquariumTypeLabel, type AquariumFormInput } from "@/rules/aquarium";

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

function integerToDisplay(value: number | null, suffix: string) {
  return typeof value === "number" ? `${value} ${suffix}` : "Non renseigne";
}

function dateToInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export type AquariumSummary = {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  volume: string;
  currentTemperature: string;
  targetTemperature: string;
  filtrationType: string;
  photoUrl: string | null;
  startedAt: string;
  createdAt: string;
};

export type AquariumDetail = AquariumSummary & {
  length: string;
  width: string;
  height: string;
  filterFlow: string;
  heaterType: string;
  heaterPower: string;
  lightingType: string;
  lightingHours: string;
  substrate: string;
  decorations: string;
  hasCo2: boolean;
  fertilizer: string;
  notes: string;
  counts: {
    fish: number;
    plants: number;
    alerts: number;
    reminders: number;
    maintenanceLogs: number;
    feedingLogs: number;
  };
};

export type AquariumLiveOverview = {
  activeAlerts: number;
  criticalAlerts: number;
  pendingReminders: number;
  overdueReminders: number;
};

const aquariumSelect = {
  id: true,
  name: true,
  type: true,
  volumeLiters: true,
  lengthCm: true,
  widthCm: true,
  heightCm: true,
  startedAt: true,
  photoUrl: true,
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
} as const;

function toAquariumSummary(aquarium: {
  id: string;
  name: string;
  type: string;
  volumeLiters: DecimalLike | null;
  currentTemperatureC: DecimalLike | null;
  targetTemperatureC: DecimalLike | null;
  filtrationType: string | null;
  photoUrl: string | null;
  startedAt: Date | null;
  createdAt: Date;
}): AquariumSummary {
  return {
    id: aquarium.id,
    name: aquarium.name,
    type: aquarium.type,
    typeLabel: getAquariumTypeLabel(aquarium.type),
    volume: decimalToDisplay(aquarium.volumeLiters, "L"),
    currentTemperature: decimalToDisplay(aquarium.currentTemperatureC, "C"),
    targetTemperature: decimalToDisplay(aquarium.targetTemperatureC, "C"),
    filtrationType: aquarium.filtrationType ?? "Non renseigne",
    photoUrl: aquarium.photoUrl,
    startedAt: aquarium.startedAt?.toLocaleDateString("fr-FR") ?? "Non renseignee",
    createdAt: aquarium.createdAt.toLocaleDateString("fr-FR"),
  };
}

export async function getUserAquariums(userId: string) {
  const aquariums = await prisma.aquarium.findMany({
    where: {
      userId,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: aquariumSelect,
  });

  return aquariums.map(toAquariumSummary);
}

export async function getRecentUserAquariums(userId: string, take = 3) {
  const aquariums = await prisma.aquarium.findMany({
    where: {
      userId,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    select: aquariumSelect,
  });

  return aquariums.map(toAquariumSummary);
}

export async function getUserAquariumById(userId: string, aquariumId: string) {
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId,
      isArchived: false,
    },
    select: {
      ...aquariumSelect,
      _count: {
        select: {
          fish: true,
          plants: true,
          alerts: true,
          reminders: true,
          maintenanceLogs: true,
          feedingLogs: true,
        },
      },
    },
  });

  if (!aquarium) {
    return null;
  }

  return {
    ...toAquariumSummary(aquarium),
    length: decimalToDisplay(aquarium.lengthCm, "cm"),
    width: decimalToDisplay(aquarium.widthCm, "cm"),
    height: decimalToDisplay(aquarium.heightCm, "cm"),
    filterFlow: integerToDisplay(aquarium.filterFlowLitersHour, "L/h"),
    heaterType: aquarium.heaterType ?? "Non renseigne",
    heaterPower: integerToDisplay(aquarium.heaterPowerWatts, "W"),
    lightingType: aquarium.lightingType ?? "Non renseigne",
    lightingHours: decimalToDisplay(aquarium.lightingHoursPerDay, "h/j"),
    substrate: aquarium.substrate ?? "Non renseigne",
    decorations: aquarium.decorations ?? "Non renseigne",
    hasCo2: aquarium.hasCo2,
    fertilizer: aquarium.fertilizer ?? "Non renseigne",
    notes: aquarium.notes ?? "",
    counts: {
      fish: aquarium._count.fish,
      plants: aquarium._count.plants,
      alerts: aquarium._count.alerts,
      reminders: aquarium._count.reminders,
      maintenanceLogs: aquarium._count.maintenanceLogs,
      feedingLogs: aquarium._count.feedingLogs,
    },
  } satisfies AquariumDetail;
}

export async function getAquariumLiveOverview(
  userId: string,
  aquariumId: string
): Promise<AquariumLiveOverview> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeAlerts, criticalAlerts, pendingReminders, overdueReminders] =
    await Promise.all([
      prisma.alert.count({
        where: {
          userId,
          aquariumId,
          status: {
            in: ["OPEN", "ACKNOWLEDGED"],
          },
          aquarium: {
            userId,
            isArchived: false,
          },
        },
      }),
      prisma.alert.count({
        where: {
          userId,
          aquariumId,
          severity: "CRITICAL",
          status: {
            in: ["OPEN", "ACKNOWLEDGED"],
          },
          aquarium: {
            userId,
            isArchived: false,
          },
        },
      }),
      prisma.reminder.count({
        where: {
          userId,
          aquariumId,
          status: "PENDING",
          aquarium: {
            userId,
            isArchived: false,
          },
        },
      }),
      prisma.reminder.count({
        where: {
          userId,
          aquariumId,
          status: "PENDING",
          dueAt: {
            lt: today,
          },
          aquarium: {
            userId,
            isArchived: false,
          },
        },
      }),
    ]);

  return {
    activeAlerts,
    criticalAlerts,
    pendingReminders,
    overdueReminders,
  };
}

export async function getAquariumFormDefaults(
  userId: string,
  aquariumId: string
): Promise<(AquariumFormInput & { id: string }) | null> {
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id: aquariumId,
      userId,
      isArchived: false,
    },
    select: aquariumSelect,
  });

  if (!aquarium) {
    return null;
  }

  return {
    id: aquarium.id,
    name: aquarium.name,
    type: aquarium.type,
    volumeLiters: decimalToString(aquarium.volumeLiters),
    lengthCm: decimalToString(aquarium.lengthCm),
    widthCm: decimalToString(aquarium.widthCm),
    heightCm: decimalToString(aquarium.heightCm),
    startedAt: dateToInputValue(aquarium.startedAt),
    currentTemperatureC: decimalToString(aquarium.currentTemperatureC),
    targetTemperatureC: decimalToString(aquarium.targetTemperatureC),
    filtrationType: aquarium.filtrationType ?? "",
    filterFlowLitersHour: aquarium.filterFlowLitersHour?.toString() ?? "",
    heaterType: aquarium.heaterType ?? "",
    heaterPowerWatts: aquarium.heaterPowerWatts?.toString() ?? "",
    lightingType: aquarium.lightingType ?? "",
    lightingHoursPerDay: decimalToString(aquarium.lightingHoursPerDay),
    substrate: aquarium.substrate ?? "",
    decorations: aquarium.decorations ?? "",
    hasCo2: aquarium.hasCo2,
    fertilizer: aquarium.fertilizer ?? "",
    notes: aquarium.notes ?? "",
    imageUrl: aquarium.photoUrl ?? "",
  };
}
