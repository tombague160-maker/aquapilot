-- CreateEnum
CREATE TYPE "AquariumType" AS ENUM ('FRESHWATER_COMMUNITY', 'PLANTED', 'SHRIMP', 'BETTA', 'BREEDING', 'QUARANTINE', 'BIOTOPE', 'OTHER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'COMPLETED', 'SNOOZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('WATER_CHANGE', 'WATER_TEST', 'FILTER_CLEANING', 'GLASS_CLEANING', 'SUBSTRATE_SIPHONING', 'FEEDING', 'FERTILIZATION', 'PLANT_TRIMMING', 'TEMPERATURE_CHECK', 'HEATER_CHECK', 'LIGHTING_CHECK', 'FISH_VISUAL_CHECK', 'CO2_CHECK', 'ALGAE_CHECK', 'EQUIPMENT_CHECK', 'MEDICATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFORMATION', 'ATTENTION', 'IMPORTANT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('WATER_PARAMETER', 'MAINTENANCE_OVERDUE', 'FEEDING_MISSED', 'FEEDING', 'EQUIPMENT', 'FISH_HEALTH', 'PLANT_HEALTH', 'SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('WATER_CHANGE', 'GLASS_CLEANING', 'FILTER_CLEANING', 'FILTER_MEDIA_RINSE', 'SUBSTRATE_SIPHONING', 'SUBSTRATE_CLEANING', 'PLANT_TRIMMING', 'FERTILIZATION', 'BACTERIA_ADDITION', 'CONDITIONER_ADDITION', 'PUMP_CLEANING', 'HEATER_CHECK', 'LIGHTING_CHECK', 'EQUIPMENT_SERVICE', 'WATER_TEST', 'TREATMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('FILTER', 'HEATER', 'LIGHT', 'CO2_SYSTEM', 'AIR_PUMP', 'DOSING_PUMP', 'SENSOR', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "LivestockStatus" AS ENUM ('ACTIVE', 'QUARANTINE', 'DECEASED', 'REHOMED');

-- CreateEnum
CREATE TYPE "FishSex" AS ENUM ('UNKNOWN', 'MALE', 'FEMALE', 'MIXED');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('ACTIVE', 'MELTING', 'REMOVED', 'PROPAGATED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT', 'REMINDER', 'SYSTEM', 'AI_RECOMMENDATION', 'MAINTENANCE', 'WATER_TEST', 'WATER_CHANGE');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('OBSERVATION', 'PROBLEM', 'IDEA', 'FISH_BEHAVIOR', 'PLANT', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiRecommendationStatus" AS ENUM ('PROPOSED', 'APPLIED', 'DISMISSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FeedingFoodType" AS ENUM ('FLAKES', 'GRANULES', 'TABLETS', 'FROZEN', 'LIVE', 'VEGETABLES', 'SHRIMP_FOOD', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aquarium" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AquariumType" NOT NULL DEFAULT 'FRESHWATER_COMMUNITY',
    "volumeLiters" DECIMAL(8,2),
    "lengthCm" DECIMAL(8,2),
    "widthCm" DECIMAL(8,2),
    "heightCm" DECIMAL(8,2),
    "startedAt" TIMESTAMP(3),
    "location" TEXT,
    "photoUrl" TEXT,
    "currentTemperatureC" DECIMAL(4,1),
    "targetTemperatureC" DECIMAL(4,1),
    "filtrationType" TEXT,
    "filterFlowLitersHour" INTEGER,
    "heaterType" TEXT,
    "heaterPowerWatts" INTEGER,
    "lightingType" TEXT,
    "lightingHoursPerDay" DECIMAL(4,1),
    "substrate" TEXT,
    "decorations" TEXT,
    "hasCo2" BOOLEAN NOT NULL DEFAULT false,
    "fertilizer" TEXT,
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aquarium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterParameter" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperatureC" DECIMAL(4,1),
    "ph" DECIMAL(3,1),
    "gh" INTEGER,
    "kh" INTEGER,
    "ammoniaMgL" DECIMAL(6,3),
    "nitriteMgL" DECIMAL(6,3),
    "nitrateMgL" DECIMAL(6,2),
    "phosphateMgL" DECIMAL(6,2),
    "ironMgL" DECIMAL(6,3),
    "conductivityUs" INTEGER,
    "tdsPpm" INTEGER,
    "oxygenMgL" DECIMAL(5,2),
    "co2MgL" DECIMAL(5,2),
    "chlorineMgL" DECIMAL(6,3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishSpecies" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "slug" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT,
    "family" TEXT,
    "origin" TEXT,
    "temperament" TEXT,
    "behavior" TEXT,
    "swimmingZone" TEXT,
    "diet" TEXT,
    "minTankLiters" INTEGER,
    "minTemperatureC" DECIMAL(4,1),
    "maxTemperatureC" DECIMAL(4,1),
    "minPh" DECIMAL(3,1),
    "maxPh" DECIMAL(3,1),
    "minGh" INTEGER,
    "maxGh" INTEGER,
    "adultSizeCm" DECIMAL(5,2),
    "careLevel" TEXT,
    "difficulty" TEXT,
    "minGroupSize" INTEGER,
    "lifeExpectancyYears" DECIMAL(4,1),
    "shrimpCompatibility" TEXT,
    "plantCompatibility" TEXT,
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AquariumFish" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "speciesId" UUID NOT NULL,
    "name" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sex" "FishSex" NOT NULL DEFAULT 'UNKNOWN',
    "status" "LivestockStatus" NOT NULL DEFAULT 'ACTIVE',
    "acquiredAt" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AquariumFish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantSpecies" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "slug" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT,
    "family" TEXT,
    "growthRate" TEXT,
    "lightNeed" TEXT,
    "co2Need" TEXT,
    "fertilizerNeed" TEXT,
    "placement" TEXT,
    "minTemperatureC" DECIMAL(4,1),
    "maxTemperatureC" DECIMAL(4,1),
    "minPh" DECIMAL(3,1),
    "maxPh" DECIMAL(3,1),
    "careLevel" TEXT,
    "difficulty" TEXT,
    "trimmingEveryDays" INTEGER,
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AquariumPlant" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "speciesId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "PlantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plantedAt" TIMESTAMP(3),
    "placement" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AquariumPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER,
    "waterChangeLiters" DECIMAL(8,2),
    "waterChangePercent" DECIMAL(5,2),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedingLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "foodType" "FeedingFoodType" NOT NULL,
    "amount" TEXT,
    "species" TEXT,
    "fedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "observationAfter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "repeatEveryDays" INTEGER,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "isAutoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'ATTENTION',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "fingerprint" TEXT,
    "probableCause" TEXT,
    "recommendedAction" TEXT,
    "recommendedDelay" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "installedAt" TIMESTAMP(3),
    "maintenanceEveryDays" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'OBSERVATION',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "notedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT NOT NULL DEFAULT '/dashboard',
    "fingerprint" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRecommendation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "context" JSONB,
    "content" JSONB,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "AiRecommendationStatus" NOT NULL DEFAULT 'PROPOSED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AquariumHealthScore" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aquariumId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT,
    "factors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AquariumHealthScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Aquarium_userId_idx" ON "Aquarium"("userId");

-- CreateIndex
CREATE INDEX "Aquarium_type_idx" ON "Aquarium"("type");

-- CreateIndex
CREATE INDEX "WaterParameter_userId_idx" ON "WaterParameter"("userId");

-- CreateIndex
CREATE INDEX "WaterParameter_aquariumId_idx" ON "WaterParameter"("aquariumId");

-- CreateIndex
CREATE INDEX "WaterParameter_aquariumId_measuredAt_idx" ON "WaterParameter"("aquariumId", "measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "FishSpecies_slug_key" ON "FishSpecies"("slug");

-- CreateIndex
CREATE INDEX "FishSpecies_userId_idx" ON "FishSpecies"("userId");

-- CreateIndex
CREATE INDEX "FishSpecies_commonName_idx" ON "FishSpecies"("commonName");

-- CreateIndex
CREATE INDEX "AquariumFish_userId_idx" ON "AquariumFish"("userId");

-- CreateIndex
CREATE INDEX "AquariumFish_aquariumId_idx" ON "AquariumFish"("aquariumId");

-- CreateIndex
CREATE INDEX "AquariumFish_speciesId_idx" ON "AquariumFish"("speciesId");

-- CreateIndex
CREATE INDEX "AquariumFish_status_idx" ON "AquariumFish"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlantSpecies_slug_key" ON "PlantSpecies"("slug");

-- CreateIndex
CREATE INDEX "PlantSpecies_userId_idx" ON "PlantSpecies"("userId");

-- CreateIndex
CREATE INDEX "PlantSpecies_commonName_idx" ON "PlantSpecies"("commonName");

-- CreateIndex
CREATE INDEX "AquariumPlant_userId_idx" ON "AquariumPlant"("userId");

-- CreateIndex
CREATE INDEX "AquariumPlant_aquariumId_idx" ON "AquariumPlant"("aquariumId");

-- CreateIndex
CREATE INDEX "AquariumPlant_speciesId_idx" ON "AquariumPlant"("speciesId");

-- CreateIndex
CREATE INDEX "AquariumPlant_status_idx" ON "AquariumPlant"("status");

-- CreateIndex
CREATE INDEX "MaintenanceLog_userId_idx" ON "MaintenanceLog"("userId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_aquariumId_idx" ON "MaintenanceLog"("aquariumId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_aquariumId_performedAt_idx" ON "MaintenanceLog"("aquariumId", "performedAt");

-- CreateIndex
CREATE INDEX "MaintenanceLog_type_idx" ON "MaintenanceLog"("type");

-- CreateIndex
CREATE INDEX "FeedingLog_userId_idx" ON "FeedingLog"("userId");

-- CreateIndex
CREATE INDEX "FeedingLog_aquariumId_idx" ON "FeedingLog"("aquariumId");

-- CreateIndex
CREATE INDEX "FeedingLog_aquariumId_fedAt_idx" ON "FeedingLog"("aquariumId", "fedAt");

-- CreateIndex
CREATE INDEX "FeedingLog_foodType_idx" ON "FeedingLog"("foodType");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");

-- CreateIndex
CREATE INDEX "Reminder_aquariumId_idx" ON "Reminder"("aquariumId");

-- CreateIndex
CREATE INDEX "Reminder_status_idx" ON "Reminder"("status");

-- CreateIndex
CREATE INDEX "Reminder_dueAt_idx" ON "Reminder"("dueAt");

-- CreateIndex
CREATE INDEX "Reminder_isAutoGenerated_idx" ON "Reminder"("isAutoGenerated");

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_aquariumId_idx" ON "Alert"("aquariumId");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_priority_idx" ON "Alert"("priority");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_fingerprint_idx" ON "Alert"("fingerprint");

-- CreateIndex
CREATE INDEX "Equipment_userId_idx" ON "Equipment"("userId");

-- CreateIndex
CREATE INDEX "Equipment_aquariumId_idx" ON "Equipment"("aquariumId");

-- CreateIndex
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "Note_aquariumId_idx" ON "Note"("aquariumId");

-- CreateIndex
CREATE INDEX "Note_type_idx" ON "Note"("type");

-- CreateIndex
CREATE INDEX "Note_notedAt_idx" ON "Note"("notedAt");

-- CreateIndex
CREATE INDEX "Note_pinned_idx" ON "Note"("pinned");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_aquariumId_idx" ON "Notification"("aquariumId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_fingerprint_idx" ON "Notification"("fingerprint");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AiRecommendation_userId_idx" ON "AiRecommendation"("userId");

-- CreateIndex
CREATE INDEX "AiRecommendation_aquariumId_idx" ON "AiRecommendation"("aquariumId");

-- CreateIndex
CREATE INDEX "AiRecommendation_status_idx" ON "AiRecommendation"("status");

-- CreateIndex
CREATE INDEX "AiRecommendation_priority_idx" ON "AiRecommendation"("priority");

-- CreateIndex
CREATE INDEX "AquariumHealthScore_userId_idx" ON "AquariumHealthScore"("userId");

-- CreateIndex
CREATE INDEX "AquariumHealthScore_aquariumId_idx" ON "AquariumHealthScore"("aquariumId");

-- CreateIndex
CREATE INDEX "AquariumHealthScore_aquariumId_calculatedAt_idx" ON "AquariumHealthScore"("aquariumId", "calculatedAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aquarium" ADD CONSTRAINT "Aquarium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterParameter" ADD CONSTRAINT "WaterParameter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterParameter" ADD CONSTRAINT "WaterParameter_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishSpecies" ADD CONSTRAINT "FishSpecies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumFish" ADD CONSTRAINT "AquariumFish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumFish" ADD CONSTRAINT "AquariumFish_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumFish" ADD CONSTRAINT "AquariumFish_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "FishSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantSpecies" ADD CONSTRAINT "PlantSpecies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumPlant" ADD CONSTRAINT "AquariumPlant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumPlant" ADD CONSTRAINT "AquariumPlant_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumPlant" ADD CONSTRAINT "AquariumPlant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingLog" ADD CONSTRAINT "FeedingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingLog" ADD CONSTRAINT "FeedingLog_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRecommendation" ADD CONSTRAINT "AiRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRecommendation" ADD CONSTRAINT "AiRecommendation_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumHealthScore" ADD CONSTRAINT "AquariumHealthScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AquariumHealthScore" ADD CONSTRAINT "AquariumHealthScore_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
