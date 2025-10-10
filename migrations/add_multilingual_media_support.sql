-- Migration: Add multilingual media support
-- Date: 2025-10-10
-- Description: Add separate video and presentation URLs for Arabic language

BEGIN;

-- ========================================
-- 1. Add Arabic media columns to modules table
-- ========================================
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS video_url_ar TEXT,
ADD COLUMN IF NOT EXISTS presentation_url_ar TEXT,
ADD COLUMN IF NOT EXISTS presentation_type_ar VARCHAR(20);

-- ========================================
-- 2. Add comments for documentation
-- ========================================
COMMENT ON COLUMN modules.video_url_ar IS 'Video URL for Arabic version (optional - if null, uses video_url)';
COMMENT ON COLUMN modules.presentation_url_ar IS 'Presentation URL for Arabic version (optional - if null, uses presentation_url)';
COMMENT ON COLUMN modules.presentation_type_ar IS 'Presentation type for Arabic version: pdf or powerpoint';

-- ========================================
-- 3. Create indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_modules_video_url_ar ON modules(video_url_ar) WHERE video_url_ar IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_modules_presentation_url_ar ON modules(presentation_url_ar) WHERE presentation_url_ar IS NOT NULL;

COMMIT;

-- ========================================
-- Migration completed successfully!
-- ========================================
-- Summary:
-- 1. Added video_url_ar for Arabic-specific videos
-- 2. Added presentation_url_ar for Arabic-specific presentations
-- 3. Added presentation_type_ar for Arabic presentation type
-- 4. If Arabic URLs are NULL, the system will fall back to French URLs
-- 5. Created performance indexes
--
-- Usage:
-- - video_url: French video (required if you want video)
-- - video_url_ar: Arabic video (optional, falls back to video_url if null)
-- - presentation_url: French presentation (required if you want presentation)
-- - presentation_url_ar: Arabic presentation (optional, falls back to presentation_url if null)
