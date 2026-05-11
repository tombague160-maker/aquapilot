import { prisma } from "@/lib/prisma";
import {
  getMaintenanceTypeLabel,
  type MaintenanceFilterValue,
} from "@/rules/maintenance";

type DecimalLike = {
  toString(): string;
};

type RawMaintenanceLog = {
  id: string;
  type: string;
  title: string;
  performedAt: Date;
  waterChangeLiters: DecimalLike | null;
  waterChangePercent: DecimalLike | null;
  notes: string | null;
  createdAt: Date;
};

export type MaintenanceLogEntry = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  performedAt: string;
  performedAtLabel: string;
  waterChangeLiters: string;
  waterChangePercent: string;
  notes: string | null;
};

const maintenanceLogSelect = {
  id: true,
  type: true,
  title: true,
  performedAt: true,
  waterChangeLiters: true,
  waterChangePercent: true,
  notes: true,
  createdAt: true,
} as const;

function decimalToString(value: DecimalLike | null) {
  return value?.toString() ?? "";
}

function decimalToDisplay(value: DecimalLike | null, suffix: string) {
  const rawValue = decimalToString(value);

  return rawValue ? `${rawValue} ${suffix}` : "Non renseigne";
}

function toMaintenanceLogEntry(log: RawMaintenanceLog): MaintenanceLogEntry {
  return {
    id: log.id,
    type: log.type,
    typeLabel: getMaintenanceTypeLabel(log.type),
    title: log.title,
    performedAt: log.performedAt.toISOString(),
    performedAtLabel: log.performedAt.toLocaleDateString("fr-FR"),
    waterChangeLiters: decimalToDisplay(log.waterChangeLiters, "L"),
    waterChangePercent: decimalToDisplay(log.waterChangePercent, "%"),
    notes: log.notes,
  };
}

export async function getMaintenanceLogs(
  userId: string,
  aquariumId: string,
  typeFilter: MaintenanceFilterValue
) {
  const logs = await prisma.maintenanceLog.findMany({
    where: {
      userId,
      aquariumId,
      type: typeFilter === "all" ? undefined : typeFilter,
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      performedAt: "desc",
    },
    select: maintenanceLogSelect,
  });

  return logs.map(toMaintenanceLogEntry);
}

export async function getLatestWaterChange(userId: string, aquariumId: string) {
  const log = await prisma.maintenanceLog.findFirst({
    where: {
      userId,
      aquariumId,
      type: "WATER_CHANGE",
      aquarium: {
        userId,
        isArchived: false,
      },
    },
    orderBy: {
      performedAt: "desc",
    },
    select: maintenanceLogSelect,
  });

  return log ? toMaintenanceLogEntry(log) : null;
}
