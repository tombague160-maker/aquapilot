import { prisma } from "@/lib/prisma";

type DecimalLike = {
  toString(): string;
};

type RawFishSpecies = {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string | null;
  family: string | null;
  origin: string | null;
  temperament: string | null;
  behavior: string | null;
  swimmingZone: string | null;
  diet: string | null;
  minTankLiters: number | null;
  minTemperatureC: DecimalLike | null;
  maxTemperatureC: DecimalLike | null;
  minPh: DecimalLike | null;
  maxPh: DecimalLike | null;
  minGh: number | null;
  maxGh: number | null;
  adultSizeCm: DecimalLike | null;
  careLevel: string | null;
  difficulty: string | null;
  minGroupSize: number | null;
  lifeExpectancyYears: DecimalLike | null;
  shrimpCompatibility: string | null;
  plantCompatibility: string | null;
  notes: string | null;
  isPublic: boolean;
};

type AquariumFishContext = {
  volumeLiters: number | null;
  temperatureC: number | null;
  ph: number | null;
  gh: number | null;
};

export type FishAnalysisStatus = "ok" | "warning" | "unknown" | "info";

export type FishAnalysisItem = {
  label: string;
  status: FishAnalysisStatus;
  message: string;
};

export type FishSpeciesSummary = {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  behavior: string;
  swimmingZone: string;
  diet: string;
  minTank: string;
  temperatureRange: string;
  phRange: string;
  ghRange: string;
  adultSize: string;
  difficulty: string;
  minGroupSize: string;
  lifeExpectancy: string;
  shrimpCompatibility: string;
  plantCompatibility: string;
  notes: string;
  isPublic: boolean;
  analysisBadges: FishAnalysisItem[];
};

export type FishSpeciesOption = {
  id: string;
  label: string;
};

export type AquariumFishEntry = {
  id: string;
  quantity: number;
  acquiredAt: string;
  notes: string | null;
  species: FishSpeciesSummary;
  analysis: FishAnalysisItem[];
};

const fishSpeciesSelect = {
  id: true,
  slug: true,
  commonName: true,
  scientificName: true,
  family: true,
  origin: true,
  temperament: true,
  behavior: true,
  swimmingZone: true,
  diet: true,
  minTankLiters: true,
  minTemperatureC: true,
  maxTemperatureC: true,
  minPh: true,
  maxPh: true,
  minGh: true,
  maxGh: true,
  adultSizeCm: true,
  careLevel: true,
  difficulty: true,
  minGroupSize: true,
  lifeExpectancyYears: true,
  shrimpCompatibility: true,
  plantCompatibility: true,
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

function formatDecimal(value: DecimalLike | null, suffix = "") {
  const numberValue = decimalToNumber(value);

  if (numberValue === null) {
    return "Non renseigne";
  }

  return suffix ? `${numberValue.toString()} ${suffix}` : numberValue.toString();
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
    return `${minValue.toString()}-${maxValue.toString()}${suffix ? ` ${suffix}` : ""}`;
  }

  if (minValue !== null) {
    return `min ${minValue.toString()}${suffix ? ` ${suffix}` : ""}`;
  }

  return `max ${maxValue?.toString()}${suffix ? ` ${suffix}` : ""}`;
}

function formatIntegerRange(min: number | null, max: number | null, suffix = "") {
  if (min === null && max === null) {
    return "Non renseigne";
  }

  if (min !== null && max !== null) {
    return `${min}-${max}${suffix ? ` ${suffix}` : ""}`;
  }

  if (min !== null) {
    return `min ${min}${suffix ? ` ${suffix}` : ""}`;
  }

  return `max ${max}${suffix ? ` ${suffix}` : ""}`;
}

function compatibilityStatus(value: string): FishAnalysisStatus {
  const normalizedValue = value.toLowerCase();

  if (normalizedValue.includes("non") || normalizedValue.includes("prudence")) {
    return "warning";
  }

  if (normalizedValue.includes("compatible")) {
    return "ok";
  }

  return "unknown";
}

function toSpeciesSummary(species: RawFishSpecies): FishSpeciesSummary {
  const shrimpCompatibility = species.shrimpCompatibility ?? "Non renseigne";
  const plantCompatibility = species.plantCompatibility ?? "Non renseigne";

  return {
    id: species.id,
    slug: species.slug,
    commonName: species.commonName,
    scientificName: species.scientificName ?? "Non renseigne",
    family: species.family ?? "Non renseigne",
    origin: species.origin ?? "Non renseigne",
    behavior: species.behavior ?? species.temperament ?? "Non renseigne",
    swimmingZone: species.swimmingZone ?? "Non renseigne",
    diet: species.diet ?? "Non renseigne",
    minTank: species.minTankLiters
      ? `${species.minTankLiters} L minimum`
      : "Non renseigne",
    temperatureRange: formatDecimalRange(
      species.minTemperatureC,
      species.maxTemperatureC,
      "C"
    ),
    phRange: formatDecimalRange(species.minPh, species.maxPh),
    ghRange: formatIntegerRange(species.minGh, species.maxGh),
    adultSize: formatDecimal(species.adultSizeCm, "cm"),
    difficulty: species.difficulty ?? species.careLevel ?? "Non renseigne",
    minGroupSize: species.minGroupSize
      ? `${species.minGroupSize} minimum`
      : "Non renseigne",
    lifeExpectancy: formatDecimal(species.lifeExpectancyYears, "ans"),
    shrimpCompatibility,
    plantCompatibility,
    notes: species.notes ?? "",
    isPublic: species.isPublic,
    analysisBadges: [
      {
        label: `Volume ${species.minTankLiters ?? "?"} L`,
        status: species.minTankLiters ? "info" : "unknown",
        message: species.minTankLiters
          ? `Volume minimum conseille : ${species.minTankLiters} L.`
          : "Volume minimum non renseigne.",
      },
      {
        label: `Groupe ${species.minGroupSize ?? "?"}`,
        status: species.minGroupSize ? "info" : "unknown",
        message: species.minGroupSize
          ? `Groupe minimum conseille : ${species.minGroupSize}.`
          : "Taille de groupe minimum non renseignee.",
      },
      {
        label: `Crevettes : ${shrimpCompatibility}`,
        status: compatibilityStatus(shrimpCompatibility),
        message: `Compatibilite crevettes : ${shrimpCompatibility}.`,
      },
      {
        label: `Plantes : ${plantCompatibility}`,
        status: compatibilityStatus(plantCompatibility),
        message: `Compatibilite plantes : ${plantCompatibility}.`,
      },
    ],
  };
}

function buildMinimumAnalysis(
  label: string,
  actual: number | null,
  minimum: number | null,
  unit: string
): FishAnalysisItem {
  if (minimum === null) {
    return {
      label: `${label} ?`,
      status: "unknown",
      message: `${label} minimum non renseigne.`,
    };
  }

  if (actual === null) {
    return {
      label: `${label} ${minimum} ${unit}`,
      status: "unknown",
      message: `${label} actuel non renseigne pour comparer.`,
    };
  }

  const isOk = actual >= minimum;

  return {
    label: `${label} ${isOk ? "OK" : "A verifier"}`,
    status: isOk ? "ok" : "warning",
    message: `${actual} ${unit} disponible pour ${minimum} ${unit} minimum.`,
  };
}

function buildRangeAnalysis(
  label: string,
  actual: number | null,
  min: number | null,
  max: number | null,
  unit = ""
): FishAnalysisItem {
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

function buildSpeciesAnalysis(
  species: RawFishSpecies,
  quantity: number,
  context: AquariumFishContext | null
): FishAnalysisItem[] {
  return [
    buildMinimumAnalysis(
      "Volume",
      context?.volumeLiters ?? null,
      species.minTankLiters,
      "L"
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
    buildRangeAnalysis("GH", context?.gh ?? null, species.minGh, species.maxGh),
    buildMinimumAnalysis(
      "Groupe",
      quantity,
      species.minGroupSize,
      "ind."
    ),
    {
      label: `Taille ${formatDecimal(species.adultSizeCm, "cm")}`,
      status: species.adultSizeCm ? "info" : "unknown",
      message: `Taille adulte : ${formatDecimal(species.adultSizeCm, "cm")}.`,
    },
    {
      label: `Crevettes : ${species.shrimpCompatibility ?? "?"}`,
      status: compatibilityStatus(species.shrimpCompatibility ?? ""),
      message: `Compatibilite crevettes : ${
        species.shrimpCompatibility ?? "Non renseigne"
      }.`,
    },
    {
      label: `Plantes : ${species.plantCompatibility ?? "?"}`,
      status: compatibilityStatus(species.plantCompatibility ?? ""),
      message: `Compatibilite plantes : ${
        species.plantCompatibility ?? "Non renseigne"
      }.`,
    },
  ];
}

async function getAquariumFishContext(
  userId: string,
  aquariumId: string
): Promise<AquariumFishContext | null> {
  const [aquarium, latestWaterParameter] = await Promise.all([
    prisma.aquarium.findFirst({
      where: {
        id: aquariumId,
        userId,
        isArchived: false,
      },
      select: {
        volumeLiters: true,
        currentTemperatureC: true,
        targetTemperatureC: true,
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
        gh: true,
      },
    }),
  ]);

  if (!aquarium) {
    return null;
  }

  return {
    volumeLiters: decimalToNumber(aquarium.volumeLiters),
    temperatureC:
      decimalToNumber(latestWaterParameter?.temperatureC) ??
      decimalToNumber(aquarium.currentTemperatureC) ??
      decimalToNumber(aquarium.targetTemperatureC),
    ph: decimalToNumber(latestWaterParameter?.ph),
    gh: latestWaterParameter?.gh ?? null,
  };
}

export async function getFishSpeciesCatalog(userId: string) {
  const species = await prisma.fishSpecies.findMany({
    where: {
      OR: [{ isPublic: true }, { userId }],
    },
    orderBy: {
      commonName: "asc",
    },
    select: fishSpeciesSelect,
  });

  return species.map(toSpeciesSummary);
}

export async function getFishSpeciesBySlug(userId: string, slug: string) {
  const species = await prisma.fishSpecies.findFirst({
    where: {
      slug,
      OR: [{ isPublic: true }, { userId }],
    },
    select: fishSpeciesSelect,
  });

  return species ? toSpeciesSummary(species) : null;
}

export async function getFishSpeciesOptions(
  userId: string
): Promise<FishSpeciesOption[]> {
  const species = await prisma.fishSpecies.findMany({
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

export async function getAquariumFishEntries(
  userId: string,
  aquariumId: string
): Promise<AquariumFishEntry[]> {
  const [context, entries] = await Promise.all([
    getAquariumFishContext(userId, aquariumId),
    prisma.aquariumFish.findMany({
      where: {
        userId,
        aquariumId,
        status: "ACTIVE",
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
        acquiredAt: true,
        notes: true,
        species: {
          select: fishSpeciesSelect,
        },
      },
    }),
  ]);

  return entries.map((entry) => ({
    id: entry.id,
    quantity: entry.quantity,
    acquiredAt:
      entry.acquiredAt?.toLocaleDateString("fr-FR") ?? "Non renseignee",
    notes: entry.notes,
    species: toSpeciesSummary(entry.species),
    analysis: buildSpeciesAnalysis(entry.species, entry.quantity, context),
  }));
}
