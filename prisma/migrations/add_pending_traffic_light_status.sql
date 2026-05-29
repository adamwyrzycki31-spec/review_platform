-- Migration: Add PENDING to TrafficLightStatus and add ApprovalStatus fields
-- Run this SQL on your PostgreSQL database

-- Step 1: Add PENDING value to TrafficLightStatus enum
ALTER TYPE "TrafficLightStatus" ADD VALUE IF NOT EXISTS 'PENDING';

-- Step 2: Create ApprovalStatus enum
DO $$ BEGIN
    CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Add approvalStatus column
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "approval_status" "ApprovalStatus" DEFAULT 'PENDING';

-- Step 4: Add approvedAt, rejectedAt, rejectionReason columns
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;

-- Alternative method if the above doesn't work for enum:
-- First, back up your data
-- Then drop and recreate the type:
-- DROP TYPE IF EXISTS "TrafficLightStatus";
-- CREATE TYPE "TrafficLightStatus" AS ENUM ('PENDING', 'RED', 'AMBER', 'GREEN');
