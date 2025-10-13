-- Import Arabic translations for onboarding assessments
-- This is a TEMPLATE - you'll need to fill in the actual translations

-- STEP 1: Update assessment titles and descriptions
-- Replace the values below with your actual assessment IDs and translations

UPDATE onboarding_assessments
SET
  title_ar = 'PASTE_ARABIC_TITLE_HERE',
  description_ar = 'PASTE_ARABIC_DESCRIPTION_HERE'
WHERE id = 'PASTE_ASSESSMENT_ID_HERE';

-- Repeat for each assessment...

-- STEP 2: Update questions with Arabic translations
-- Example structure - you'll need to build this based on your CSV

UPDATE onboarding_assessments
SET questions = '[
  {
    "question": "What is the most important aspect of customer service?",
    "question_ar": "شنو هو أهم جانب ف خدمة العملاء؟",
    "options": [
      "Being polite and helpful",
      "Processing transactions quickly",
      "Knowing all product details",
      "Following company rules"
    ],
    "options_ar": [
      "نكون مهذب ونعاون",
      "نعالج المعاملات بسرعة",
      "نعرف كل تفاصيل المنتجات",
      "نتبع قواعد الشركة"
    ],
    "correct": 0
  },
  {
    "question": "Question 2 in French",
    "question_ar": "السؤال 2 بالعربية",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "options_ar": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
    "correct": 1
  }
]'::jsonb
WHERE id = 'PASTE_ASSESSMENT_ID_HERE';

-- Repeat for each assessment...

-- Verify the updates
SELECT
  id,
  title,
  title_ar,
  description,
  description_ar,
  jsonb_array_length(questions) as question_count
FROM onboarding_assessments
WHERE is_active = true;
