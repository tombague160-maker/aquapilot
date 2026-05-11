import { prisma } from "@/lib/prisma";
import { getPlantStatusLabel } from "@/rules/plant";

type DecimalLike = {
  toString(): string;
};

type RawPlantSpecies = {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string | null;
  family: string | null;
  growthRate: string | null;
  lightNeed: string | null;
  co2Need: string | null;
  fertilizerNeed: string | null;
  placement: string | null;
  minTemperatureC: DecimalLike | null;
  maxTemperatureC: DecimalLike | null;
  minPh: DecimalLike | null;
  maxPh: DecimalLike | null;
  careLevel: string | null;
  difficulty: string | null;
  trimmingEveryDays: number | null;
  notes: string | null;
  isPublic: boolean;
};

type AquariumPlantContext = {
  temperatureC: number | null;
  ph: number | null;
  hasCo2: boolean;
  fertilizer: string | null;
  lightingType: string | null;
  lightingHoursPerDay: number | null;
};

export type PlantCareStatus = "ok" | "warning" | "unknown" | "info";

export type PlantCareItem = {
  label: string;
  status: PlantCareStatus;
  message: string;
};

export type PlantSpeciesSummary = {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  family: string;
  growthRate: string;
  lightNeed: string;
  co2Need: string;
  fertilizerNeed: string;
  placement: string;
  temperatureRange: string;
  phRange: string;
  difficulty: string;
  trimmingReminder: string;
  notes: string;
  isPublic: boolean;
  careBadges: PlantCareItem[];
};

export type PlantSpeciesOption = {
  id: string;
  label: string;
};

export type AquariumPlantEntry = {
  id: string;
  quantity: number;
  plantedAt: string;
  status: string;
  statusLabel: string;
  placement: string;
  notes: string | null;
  species: PlantSpeciesSummary;
  analysis: PlantCareItem[];
};

const plantSpeciesSelect = {
  id: true,
  slug: true,
  commonName: true,
  scientificName: true,
  family: true,
  growthRate: true,
  lightNeed: true,
  co2Need: true,
  fertilizerNeed: true,
  placement: true,
  minTemperatureC: true,
  maxTemperatureC: true,
  minPh: true,
  maxPh: true,
  careLevel: true,
  difficulty: true,
  trimmingEveryDays: true,
  notes: true,
  isPublic: true,
} as const;

function decimalToNumber(value: DecimalLike | null | undefined) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value.toString());

  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatDecimalRange(
  min: DecimalLike | null,
  max: DecimalLike | null,
  suffix = ""
) {
  const minValue = decimalToNumber(min);
  const maxValue = decimalToNumber(max);

  if (minValue === null && maxValue === null) {
    return "Non renseigne";
  }

  if (minValue !== null && maxValue !== null) {
    return `${minValue}-${maxValue}${suffix ? ` ${suffix}` : ""}`;
  }

  if (minValue !== null) {
    return `min ${minValue}${suffix ? ` ${suffix}` : ""}`;
  }

  return `max ${maxValue}${suffix ? ` ${suffix}` : ""}`;
}

function toTrimmingReminder(days: number | null) {
  return days ? `Taille conseillee tous les ${days} jours` : "Non renseigne";
}

function careStatus(value: string): PlantCareStatus {
  const normalizedValue = value.toLowerCase();

  if (normalizedValue.includes("fort") || normalizedValue.includes("utile")) {
    return "warning";
  }

  if (normalizedValue.includes("optionnel") || normalizedValue.includes("faible")) {
    return "ok";
  }

  return value === "Non renseigne" ? "unknown" : "info";
}

function toSpeciesSummary(species: RawPlantSpecies): PlantSpeciesSummary {
  const lightNeed = species.lightNeed ?? "Non renseigne";
  const co2Need = species.co2Need ?? "Non renseigne";
  const fertilizerNeed = species.fertilizerNeed ?? "Non renseigne";

  return {
    id: species.id,
    slug: species.slug,
    commonName: species.commonName,
    scientificName: species.scientificName ?? "Non renseigne",
    family: species.family ?? "Non renseigne",
    growthRate: species.growthRate ?? "Non renseigne",
    lightNeed,
    co2Need,
    fertilizerNeed,
    placement: species.placement ?? "Non renseigne",
    temperatureRange: formatDecimalRange(
      species.minTemperatureC,
      species.maxTemperatureC,
      "C"
    ),
    phRange: formatDecimalRange(species.minPh, species.maxPh),
    difficulty: species.difficulty ?? species.careLevel ?? "Non renseigne",
    trimmingReminder: toTrimmingReminder(species.trimmingEveryDays),
    notes: species.notes ?? "",
    isPublic: species.isPublic,
    careBadges: [
      {
        label: `Lumiere : ${lightNeed}`,
        status: careStatus(lightNeed),
        message: `Besoin lumiere : ${lightNeed}.`,
      },
      {
        label: `CO2 : ${co2Need}`,
        status: careStatus(co2Need),
        message: `Besoin CO2 : ${co2Need}.`,
      },
      {
        label: `Engrais : ${fertilizerNeed}`,
        status: careStatus(fertilizerNeed),
        message: `Besoin engrais : ${fertilizerNeed}.`,
      },
      {
        label: species.trimmingEveryDays
          ? `Taille ${species.trimmingEveryDays} j`
          : "Taille ?",
        status: species.trimmingEveryDays ? "info" : "unknown",
        message: toTrimmingReminder(species.trimmingEveryDays),
      },
    ],
  };
}

function buildRangeAnalysis(
  label: string,
  actual: number | null,
  min: number | null,
  max: number | null,
  unit = ""
): PlantCareItem {
  if (min === null && max === null) {
    return {
      label: `${label} ?`,
      status: "unknown",
      message: `${label} conseille non renseigne.`,
    };
  }

  if (actual === null) {
    return {
      label: `${label} ${min ?? "?"}-${max ?? "?"}`,
      status: "unknown",
      message: `${label} actuel non renseigne pour comparer.`,
    };
  }

  const tooLow = min !== null && actual < min;
  const tooHigh = max !== null && actual > max;
  const isOk = !tooLow && !tooHigh;
  const unitLabel = unit ? ` ${unit}` : "";

  return {
    label: `${label} ${isOk ? "OK" : "A verifier"}`,
    status: isOk ? "ok" : "warning",
    message: `${actual}${unitLabel} mesure pour une plage conseillee ${min ?? "?"}-${max ?? "?"}${unitLabel}.`,
  };
}

function buildNeedAnalysis(
  label: string,
  need: string | null,
  hasSupport: boolean | null,
  supportLabel: string
): PlantCareItem {
  const displayNeed = need ?? "Non renseigne";
  const normalizedNeed = displayNeed.toLowerCase();
  const needsSupport =
    normalizedNeed.includes("fort") ||
    normalizedNeed.includes("moyen") ||
    normalizedNeed.includes("utile");

  if (displayNeed === "Non renseigne") {
    return {
      label: `${label} ?`,
      status: "unknown",
      message: `${label} non renseigne.`,
    };
  }

  if (!needsSupport) {
    return {
      label: `${label} ${displayNeed}`,
      status: "ok",
      message: `${label} : ${displayNeed}.`,
    };
  }

  if (hasSupport === null) {
    return {
      label: `${label} ${displayNeed}`,
      status: "unknown",
      message: `${label} : ${displayNeed}. ${supportLabel} non renseigne.`,
    };
  }

  return {
    label: `${label} ${hasSupport ? "OK" : "A verifier"}`,
    status: hasSupport ? "ok" : "warning",
    message: `${label} : ${displayNeed}. ${supportLabel} ${
      hasSupport ? "present" : "absent ou non renseigne"
    }.`,
  };
}

function buildSpeciesAnalysis(
  species: RawPlantSpecies,
  entryPlacement: string | null,
  context: AquariumPlantContext | null
): PlantCareItem[] {
  const hasLighting = context
    ? Boolean(context.lightingType) || context.lightingHoursPerDay !== null
    : null;
  const hasFertilizer = context ? Boolean(context.fertilizer) : null;

  return [
    buildNeedAnalysis(
      "Lumiere",
      species.lightNeed,
      hasLighting,
      "Eclairage"
    ),
    buildNeedAnalysis("CO2", species.co2Need, context?.hasCo2 ?? null, "CO2"),
    buildNeedAnalysis(
      "Engrais",
      species.fertilizerNeed,
      hasFertilizer,
      "Engrais"
    ),
    buildRangeAnalysis(
      "Temperature",
      context?.temperatureC ?? null,
      decimalToNumber(species.minTemperatureC),
      decimalToNumber(species.maxTemperatureC),
      "C"
    ),
    buildRangeAnalysis(
      "pH",
      context?.ph ?? null,
      decimalToNumber(species.minPh),
      decimalToNumber(species.maxPh)
    ),
    {
      label: `Placement : ${entryPlacement || species.placement || "?"}`,
      status: entryPlacement || species.placement ? "info" : "unknown",
      message: `Placement conseille : ${species.placement ?? "Non renseigne"}.`,
    },
    {
      label: species.trimmingEveryDays
        ? `Taille ${species.trimmingEveryDays} j`
        : "Taille ?",
      status: species.trimmingEveryDays ? "info" : "unknown",
      message: toTrimmingReminder(species.trimmingEveryDays),
    },
  ];
}

async function getAquariumPlantContext(
  userId: string,
  aquariumId: string
): Promise<AquariumPlantContext | null> {
  const [aquarium, latestWaterParameter] = await Promise.all([
    prisma.aquarium.findFirst({
      where: {
        id: aquariumId,
        userId,
        isArchived: false,
      },
      select: {
        currentTemperatureC: true,
        targetTemperatureC: true,
        hasCo2: true,
        fertilizer: true,
        lightingType: true,
        lightingHoursPerDay: true,
      },
    }),
    prisma.waterParameter.findFirst({
      where: {
        userId,
        aquariumId,
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        measuredAt: "desc",
      },
      select: {
        temperatureC: true,
        ph: true,
      },
    }),
  ]);

  if (!aquarium) {
    return null;
  }

  return {
    temperatureC:
      decimalToNumber(latestWaterParameter?.temperatureC) ??
      decimalToNumber(aquarium.currentTemperatureC) ??
      decimalToNumber(aquarium.targetTemperatureC),
    ph: decimalToNumber(latestWaterParameter?.ph),
    hasCo2: aquarium.hasCo2,
    fertilizer: aquarium.fertilizer,
    lightingType: aquarium.lightingType,
    lightingHoursPerDay: decimalToNumber(aquarium.lightingHoursPerDay),
  };
}

export async function getPlantSpeciesCatalog(userId: string) {
  const species = await prisma.plantSpecies.findMany({
    where: {
      OR: [{ isPublic: true }, { userId }],
    },
    orderBy: {
      commonName: "asc",
    },
    select: plantSpeciesSelect,
  });

  return species.map(toSpeciesSummary);
}

export async function getPlantSpeciesBySlug(userId: string, slug: string) {
  const species = await prisma.plantSpecies.findFirst({
    where: {
      slug,
      OR: [{ isPublic: true }, { userId }],
    },
    select: plantSpeciesSelect,
  });

  return species ? toSpeciesSummary(species) : null;
}

export async function getPlantSpeciesOptions(
  userId: string
): Promise<PlantSpeciesOption[]> {
  const species = await prisma.plantSpecies.findMany({
    where: {
      OR: [{ isPublic: true }, { userId }],
    },
    orderBy: {
      commonName: "asc",
    },
    select: {
      id: true,
      commonName: true,
      scientificName: true,
    },
  });

  return species.map((item) => ({
    id: item.id,
    label: item.scientificName
      ? `${item.commonName} - ${item.scientificName}`
      : item.commonName,
  }));
}

export async function getAquariumPlantEntries(
  userId: string,
  aquariumId: string
): Promise<AquariumPlantEntry[]> {
  const [context, entries] = await Promise.all([
    getAquariumPlantContext(userId, aquariumId),
    prisma.aquariumPlant.findMany({
      where: {
        userId,
        aquariumId,
        status: {
          not: "REMOVED",
        },
        aquarium: {
          userId,
          isArchived: false,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        quantity: true,
        status: true,
        plantedAt: true,
        placement: true,
        notes: true,
        species: {
          select: plantSpeciesSelect,
        },
      },
    }),
  ]);

  return entries.map((entry) => ({
    id: entry.id,
    quantity: entry.quantity,
    plantedAt: entry.plantedAt?.toLocaleDateString("fr-FR") ?? "Non renseignee",
    status: entry.status,
    statusLabel: getPlantStatusLabel(entry.status),
    placement: entry.placement ?? entry.species.placement ?? "Non renseigne",
    notes: entry.notes,
    species: toSpeciesSummary(entry.species),
    analysis: buildSpeciesAnalysis(entry.species, entry.placement, context),
  }));
}
