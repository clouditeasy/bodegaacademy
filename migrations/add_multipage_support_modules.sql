-- Migration: Add multi-page support to modules
-- Date: 2025-10-10
-- Description: Add has_multiple_pages and pages columns for multi-page module functionality

BEGIN;

-- ========================================
-- 1. Add multi-page columns to modules table
-- ========================================
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS has_multiple_pages BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pages JSONB DEFAULT NULL;

-- ========================================
-- 2. Add comments for documentation
-- ========================================
COMMENT ON COLUMN modules.has_multiple_pages IS 'Indicates if the module uses multiple pages instead of single content';
COMMENT ON COLUMN modules.pages IS 'JSON array of pages for multi-page modules. Each page contains: {order_index, title, title_ar, content, content_ar, video_url, pdf_url, presentation_url, presentation_type}';

-- ========================================
-- 3. Set default values for existing modules
-- ========================================
UPDATE modules
SET has_multiple_pages = false
WHERE has_multiple_pages IS NULL;

-- ========================================
-- 4. Create index for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_modules_has_multiple_pages ON modules(has_multiple_pages);

COMMIT;

-- ========================================
-- Migration completed successfully
-- ========================================
-- Note: This migration adds multi-page support to modules.
-- After running this script:
-- 1. Modules can now have multiple pages with navigation
-- 2. Each page can have its own content, video, and presentation
-- 3. Pages are stored as JSONB for flexibility
-- 4. Existing modules default to single-page mode (has_multiple_pages = false)
