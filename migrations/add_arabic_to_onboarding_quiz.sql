-- Add Arabic translation support to onboarding assessments
-- This migration adds _ar suffix columns for title and questions

-- Add title_ar column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_assessments' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE onboarding_assessments
    ADD COLUMN title_ar TEXT;
  END IF;
END $$;

-- Add description_ar column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_assessments' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE onboarding_assessments
    ADD COLUMN description_ar TEXT;
  END IF;
END $$;

-- Note: The questions field in onboarding_assessments is JSONB
-- Each question object in the array should support the following structure:
-- {
--   "question": "Question in French",
--   "question_ar": "Question in Arabic",
--   "options": ["Option 1 FR", "Option 2 FR", "Option 3 FR"],
--   "options_ar": ["Option 1 AR", "Option 2 AR", "Option 3 AR"],
--   "correct": 0
-- }

-- This is already supported by the QuizQuestion type in lib/supabase.ts
-- No schema changes needed for questions, just update the JSONB data

SELECT 'Migration complete. You can now add Arabic translations to onboarding assessments.' AS status;
