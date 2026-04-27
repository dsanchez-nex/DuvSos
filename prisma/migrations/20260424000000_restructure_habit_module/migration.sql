-- Manual migration for restructure-habit-module
-- Creates new tables, extends Habit, renames Completion → HabitCompletion

-- ─── 1. Create Category table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Category_userId_idx" ON "Category"("userId");
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_userId_fkey";
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 2. Create Objective table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Objective" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Objective_userId_idx" ON "Objective"("userId");
ALTER TABLE "Objective" DROP CONSTRAINT IF EXISTS "Objective_userId_fkey";
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 3. Extend Habit table ───────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'state') THEN
        ALTER TABLE "Habit" ADD COLUMN "state" TEXT NOT NULL DEFAULT 'Active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'isPermanent') THEN
        ALTER TABLE "Habit" ADD COLUMN "isPermanent" BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'startDate') THEN
        ALTER TABLE "Habit" ADD COLUMN "startDate" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'endDate') THEN
        ALTER TABLE "Habit" ADD COLUMN "endDate" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'goalType') THEN
        ALTER TABLE "Habit" ADD COLUMN "goalType" TEXT NOT NULL DEFAULT 'Daily';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'goalValue') THEN
        ALTER TABLE "Habit" ADD COLUMN "goalValue" INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'categoryId') THEN
        ALTER TABLE "Habit" ADD COLUMN "categoryId" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Habit' AND column_name = 'objectiveId') THEN
        ALTER TABLE "Habit" ADD COLUMN "objectiveId" INTEGER;
    END IF;
END $$;

-- Habit foreign keys
ALTER TABLE "Habit" DROP CONSTRAINT IF EXISTS "Habit_categoryId_fkey";
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Habit" DROP CONSTRAINT IF EXISTS "Habit_objectiveId_fkey";
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Habit indexes
CREATE INDEX IF NOT EXISTS "Habit_state_idx" ON "Habit"("state");
CREATE INDEX IF NOT EXISTS "Habit_endDate_idx" ON "Habit"("endDate");
CREATE INDEX IF NOT EXISTS "Habit_categoryId_idx" ON "Habit"("categoryId");
CREATE INDEX IF NOT EXISTS "Habit_objectiveId_idx" ON "Habit"("objectiveId");

-- ─── 4. Rename Completion → HabitCompletion, add completedAt ─────────────
-- Check if old table exists and new doesn't
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Completion')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'HabitCompletion') THEN
        ALTER TABLE "Completion" RENAME TO "HabitCompletion";
        ALTER TABLE "HabitCompletion" RENAME CONSTRAINT "Completion_pkey" TO "HabitCompletion_pkey";
        ALTER TABLE "HabitCompletion" RENAME CONSTRAINT "Completion_habitId_fkey" TO "HabitCompletion_habitId_fkey";
    END IF;
END $$;

-- Add completedAt if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'HabitCompletion' AND column_name = 'completedAt') THEN
        ALTER TABLE "HabitCompletion" ADD COLUMN "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Rename indexes on HabitCompletion
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Completion_habitId_idx') THEN
        ALTER INDEX "Completion_habitId_idx" RENAME TO "HabitCompletion_habitId_idx";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Completion_habitId_date_key') THEN
        ALTER INDEX "Completion_habitId_date_key" RENAME TO "HabitCompletion_habitId_date_key";
    END IF;
END $$;

-- Add composite index on HabitCompletion
CREATE INDEX IF NOT EXISTS "HabitCompletion_habitId_date_idx" ON "HabitCompletion"("habitId", "date");

-- ─── 5. Create HabitBlocker table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "HabitBlocker" (
    "id" SERIAL NOT NULL,
    "habitId" INTEGER NOT NULL,
    "blockerHabitId" INTEGER NOT NULL,

    CONSTRAINT "HabitBlocker_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "HabitBlocker_habitId_blockerHabitId_key" UNIQUE ("habitId", "blockerHabitId")
);

CREATE INDEX IF NOT EXISTS "HabitBlocker_habitId_idx" ON "HabitBlocker"("habitId");
CREATE INDEX IF NOT EXISTS "HabitBlocker_blockerHabitId_idx" ON "HabitBlocker"("blockerHabitId");

ALTER TABLE "HabitBlocker" DROP CONSTRAINT IF EXISTS "HabitBlocker_habitId_fkey";
ALTER TABLE "HabitBlocker" ADD CONSTRAINT "HabitBlocker_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HabitBlocker" DROP CONSTRAINT IF EXISTS "HabitBlocker_blockerHabitId_fkey";
ALTER TABLE "HabitBlocker" ADD CONSTRAINT "HabitBlocker_blockerHabitId_fkey" FOREIGN KEY ("blockerHabitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 6. Create UserProgression table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "UserProgression" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserProgression_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserProgression_userId_key" UNIQUE ("userId")
);

ALTER TABLE "UserProgression" DROP CONSTRAINT IF EXISTS "UserProgression_userId_fkey";
ALTER TABLE "UserProgression" ADD CONSTRAINT "UserProgression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 7. Create EnergyLog table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "EnergyLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "EnergyLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EnergyLog_userId_date_key" UNIQUE ("userId", "date")
);

CREATE INDEX IF NOT EXISTS "EnergyLog_userId_idx" ON "EnergyLog"("userId");
CREATE INDEX IF NOT EXISTS "EnergyLog_userId_date_idx" ON "EnergyLog"("userId", "date");

ALTER TABLE "EnergyLog" DROP CONSTRAINT IF EXISTS "EnergyLog_userId_fkey";
ALTER TABLE "EnergyLog" ADD CONSTRAINT "EnergyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 8. Data migration: default category and habit defaults ──────────────
-- Create default "General" category for each user that has habits
INSERT INTO "Category" ("name", "color", "userId")
SELECT 'General', '#3b82f6', "userId"
FROM (
    SELECT DISTINCT "userId" FROM "Habit" WHERE "userId" IS NOT NULL
) AS users
ON CONFLICT DO NOTHING;

-- Assign existing habits to default category if they don't have one
UPDATE "Habit" h
SET "categoryId" = c."id"
FROM "Category" c
WHERE h."categoryId" IS NULL
  AND c."name" = 'General'
  AND c."userId" = h."userId";

-- Ensure all existing habits have default values for new columns
UPDATE "Habit"
SET "state" = 'Active',
    "isPermanent" = true,
    "goalType" = 'Daily',
    "goalValue" = 1
WHERE "state" IS NULL OR "isPermanent" IS NULL OR "goalType" IS NULL OR "goalValue" IS NULL;

-- ─── 9. Create enum types for PostgreSQL (Prisma handles these at app layer) ───
-- Note: Prisma enums are validated at the application layer with PostgreSQL
-- The TEXT columns already have CHECK constraints implicitly via Prisma Client
