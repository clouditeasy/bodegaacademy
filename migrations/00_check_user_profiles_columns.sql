-- Migration: Check and add missing columns to user_profiles
-- This should be run BEFORE the QR onboarding migration

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add has_completed_onboarding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'has_completed_onboarding'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column: has_completed_onboarding';
    ELSE
        RAISE NOTICE 'Column has_completed_onboarding already exists';
    END IF;

    -- Check and add job_role
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'job_role'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN job_role VARCHAR(100);
        RAISE NOTICE 'Added column: job_role';
    ELSE
        RAISE NOTICE 'Column job_role already exists';
    END IF;

    -- Check and add department
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'department'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN department VARCHAR(100);
        RAISE NOTICE 'Added column: department';
    ELSE
        RAISE NOTICE 'Column department already exists';
    END IF;

    -- Check and add initial_assessment_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'initial_assessment_score'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN initial_assessment_score INTEGER;
        RAISE NOTICE 'Added column: initial_assessment_score';
    ELSE
        RAISE NOTICE 'Column initial_assessment_score already exists';
    END IF;

    -- Check and add initial_assessment_completed_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'initial_assessment_completed_at'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN initial_assessment_completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added column: initial_assessment_completed_at';
    ELSE
        RAISE NOTICE 'Column initial_assessment_completed_at already exists';
    END IF;

    -- Check and add onboarded_via_qr
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'onboarded_via_qr'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN onboarded_via_qr BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column: onboarded_via_qr';
    ELSE
        RAISE NOTICE 'Column onboarded_via_qr already exists';
    END IF;

    -- Check and add birth_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'birth_date'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN birth_date DATE;
        RAISE NOTICE 'Added column: birth_date';
    ELSE
        RAISE NOTICE 'Column birth_date already exists';
    END IF;

END $$;

-- Display current structure of user_profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ user_profiles table structure verified and updated!';
END $$;
