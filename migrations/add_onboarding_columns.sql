-- Migration: Add onboarding and job role columns to user_profiles table
-- Date: 2025-09-12

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS job_role TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE NOT NULL;

-- Add new columns to modules table for categorization and targeting
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' NOT NULL,
ADD COLUMN IF NOT EXISTS target_job_roles TEXT[],
ADD COLUMN IF NOT EXISTS target_departments TEXT[],
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS prerequisite_modules TEXT[],
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0 NOT NULL;

-- Add check constraint for category values
ALTER TABLE modules 
ADD CONSTRAINT modules_category_check 
CHECK (category IN ('welcome', 'job_specific', 'general', 'compliance'));

-- Create index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_mandatory ON modules(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(order_index);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(has_completed_onboarding);
CREATE INDEX IF NOT EXISTS idx_user_profiles_job_role ON user_profiles(job_role);

-- Insert a sample welcome module if it doesn't exist
INSERT INTO modules (
    id, 
    title, 
    description, 
    content, 
    category, 
    is_mandatory, 
    order_index, 
    is_active,
    created_by,
    created_at,
    updated_at,
    quiz_questions
) 
SELECT 
    gen_random_uuid(),
    'Module de Bienvenue'::text,
    'Module d''introduction obligatoire pour tous les nouveaux employés'::text,
    'Bienvenue chez Bodega Academy ! Ce module vous présente notre plateforme de formation et vous guide dans votre parcours personnalisé.'::text,
    'welcome'::text,
    true,
    0,
    true,
    COALESCE(
        (SELECT id FROM auth.users WHERE email = 'admin@bodega.ma' LIMIT 1),
        (SELECT id FROM auth.users LIMIT 1)
    ),
    NOW(),
    NOW(),
    '[]'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM modules WHERE category = 'welcome' AND is_mandatory = true
);