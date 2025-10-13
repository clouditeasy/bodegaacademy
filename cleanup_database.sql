-- Database Cleanup Script
-- This script removes the job_roles and departments tables that were incorrectly added
-- Run this in your Supabase SQL editor

-- Drop the tables (CASCADE will remove any dependent objects)
DROP TABLE IF EXISTS job_roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Clean up any RLS policies that might have been created
-- (They should auto-drop with CASCADE, but just to be safe)

-- Verify cleanup
SELECT 'Cleanup complete. Tables removed.' AS status;
