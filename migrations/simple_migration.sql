-- Simple Migration: Add onboarding columns to existing tables
-- Execute this in Supabase SQL Editor

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS job_role TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Add new columns to modules table for categorization and targeting
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS module_category TEXT,
ADD COLUMN IF NOT EXISTS target_job_roles TEXT[],
ADD COLUMN IF NOT EXISTS target_departments TEXT[],
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS prerequisite_modules TEXT[],
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_mandatory ON modules(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_user_profiles_job_role ON user_profiles(job_role);