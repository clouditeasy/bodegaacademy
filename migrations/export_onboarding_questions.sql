-- Export all onboarding assessment questions for translation
-- Run this in Supabase SQL Editor and copy the results to a CSV file

WITH question_data AS (
  SELECT
    oa.id as assessment_id,
    oa.title as assessment_title,
    oa.description as assessment_description,
    jsonb_array_elements(oa.questions) as question_obj,
    row_number() OVER (PARTITION BY oa.id ORDER BY ordinality) as question_number
  FROM
    onboarding_assessments oa,
    jsonb_array_elements(oa.questions) WITH ORDINALITY
  WHERE
    oa.is_active = true
)
SELECT
  assessment_id,
  assessment_title,
  assessment_description,
  question_number,
  question_obj->>'question' as question_text,
  question_obj->'options'->>0 as option_1,
  question_obj->'options'->>1 as option_2,
  question_obj->'options'->>2 as option_3,
  question_obj->'options'->>3 as option_4,
  (question_obj->>'correct')::int as correct_answer_index
FROM
  question_data
ORDER BY
  assessment_id, question_number;

-- Instructions:
-- 1. Copy the results to Excel/Google Sheets
-- 2. Add columns: assessment_title_ar, assessment_description_ar, question_text_ar, option_1_ar, option_2_ar, option_3_ar, option_4_ar
-- 3. Translate each row
-- 4. Save as CSV with UTF-8 encoding
-- 5. Use the import script to load the translations back
