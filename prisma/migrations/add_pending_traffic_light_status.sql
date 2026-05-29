-- Migration: Add PENDING to TrafficLightStatus enum
-- Run this SQL on your PostgreSQL database

-- Add PENDING value to the TrafficLightStatus enum
-- PostgreSQL requires recreating the type for enum modifications
ALTER TYPE "TrafficLightStatus" ADD VALUE IF NOT EXISTS 'PENDING';

-- Alternative method if the above doesn't work:
-- First, back up your data
-- Then drop and recreate the type:
-- DROP TYPE IF EXISTS "TrafficLightStatus";
-- CREATE TYPE "TrafficLightStatus" AS ENUM ('PENDING', 'RED', 'AMBER', 'GREEN');
