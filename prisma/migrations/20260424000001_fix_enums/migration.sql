-- Fix: Create PostgreSQL enum types that Prisma expects
-- and alter columns from TEXT to proper enum types

-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HabitState') THEN
        CREATE TYPE "HabitState" AS ENUM ('Active', 'Paused', 'Archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GoalType') THEN
        CREATE TYPE "GoalType" AS ENUM ('Daily', 'Weekly', 'Monthly', 'Ratio');
    END IF;
END $$;

-- Alter Habit columns to use enum types
ALTER TABLE "Habit" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Habit" ALTER COLUMN "state" TYPE "HabitState" USING ("state"::"HabitState");
ALTER TABLE "Habit" ALTER COLUMN "state" SET DEFAULT 'Active';

ALTER TABLE "Habit" ALTER COLUMN "goalType" DROP DEFAULT;
ALTER TABLE "Habit" ALTER COLUMN "goalType" TYPE "GoalType" USING ("goalType"::"GoalType");
ALTER TABLE "Habit" ALTER COLUMN "goalType" SET DEFAULT 'Daily';
