-- Migration: Add Arabic translation columns to training_paths
-- Date: 2025-10-10
-- Description: Add name_ar and description_ar columns for bilingual support

BEGIN;

-- Add Arabic translation columns to training_paths table
ALTER TABLE training_paths
ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Update existing records with placeholder Arabic translations
-- You can update these with actual translations later
UPDATE training_paths
SET
    name_ar = CASE id
        WHEN 'tronc-commun' THEN 'الجذع المشترك'
        WHEN 'employe-salle-comptoir' THEN 'مسار موظف القاعة / الكاونتر'
        WHEN 'commis-cuisine' THEN 'مسار مساعد الطبخ'
        WHEN 'chef-cuisine' THEN 'مسار رئيس الطهاة'
        WHEN 'assistant-manager' THEN 'مسار مساعد المدير'
        WHEN 'manager' THEN 'مسار المدير'
        ELSE name_ar
    END,
    description_ar = CASE id
        WHEN 'tronc-commun' THEN 'تدريبات إلزامية لجميع المناصب'
        WHEN 'employe-salle-comptoir' THEN 'تدريب متخصص لموظفي القاعة والكاونتر'
        WHEN 'commis-cuisine' THEN 'تدريب لمساعدي المطبخ'
        WHEN 'chef-cuisine' THEN 'تدريب متقدم لرؤساء الطهاة'
        WHEN 'assistant-manager' THEN 'تدريب إداري لمساعدي المدراء'
        WHEN 'manager' THEN 'تدريب شامل في القيادة وإدارة الفريق'
        ELSE description_ar
    END
WHERE name_ar IS NULL OR description_ar IS NULL;

-- Create comment on columns for documentation
COMMENT ON COLUMN training_paths.name_ar IS 'Arabic translation of the training path name';
COMMENT ON COLUMN training_paths.description_ar IS 'Arabic translation of the training path description';

COMMIT;

-- Migration completed successfully
-- Note: Run this script in your Supabase SQL Editor
