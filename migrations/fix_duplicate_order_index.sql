-- Migration: Fix duplicate order_index and add missing columns
-- Date: 2025-10-10
-- Description: Fix duplicate order_index issues and add all missing columns

BEGIN;

-- ========================================
-- STEP 1: Add missing columns first
-- ========================================

-- Add Arabic translation columns to training_paths
ALTER TABLE training_paths
ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Add Arabic translation columns and multi-page support to modules
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT,
ADD COLUMN IF NOT EXISTS has_multiple_pages BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pages JSONB DEFAULT NULL;

-- Set default values for existing modules
UPDATE modules
SET has_multiple_pages = COALESCE(has_multiple_pages, false)
WHERE has_multiple_pages IS NULL;

-- ========================================
-- STEP 2: Diagnostic - Find duplicate order_index
-- ========================================

-- This will show you which training paths have duplicate order_index
-- Run this separately first to see the issues:
-- SELECT training_path_id, order_index, COUNT(*) as count,
--        STRING_AGG(title, ', ') as modules
-- FROM modules
-- WHERE training_path_id IS NOT NULL
-- GROUP BY training_path_id, order_index
-- HAVING COUNT(*) > 1
-- ORDER BY training_path_id, order_index;

-- ========================================
-- STEP 3: Fix duplicate order_index
-- ========================================

-- Create a temporary function to fix order_index within each training path
DO $$
DECLARE
    path_record RECORD;
    module_record RECORD;
    new_order INTEGER;
BEGIN
    -- Loop through each training path
    FOR path_record IN
        SELECT DISTINCT training_path_id
        FROM modules
        WHERE training_path_id IS NOT NULL
        ORDER BY training_path_id
    LOOP
        RAISE NOTICE 'Processing training path: %', path_record.training_path_id;

        new_order := 0;

        -- Loop through modules in this path, ordered by current order_index and created_at
        FOR module_record IN
            SELECT id, title, order_index, created_at
            FROM modules
            WHERE training_path_id = path_record.training_path_id
            ORDER BY order_index ASC NULLS LAST, created_at ASC
        LOOP
            -- Update the module with the new sequential order_index
            UPDATE modules
            SET order_index = new_order,
                updated_at = NOW()
            WHERE id = module_record.id;

            RAISE NOTICE '  Module: % - Old order: % -> New order: %',
                         module_record.title, module_record.order_index, new_order;

            new_order := new_order + 1;
        END LOOP;

        RAISE NOTICE 'Fixed % modules in path %', new_order, path_record.training_path_id;
    END LOOP;

    -- Also fix modules without a training path
    new_order := 0;
    FOR module_record IN
        SELECT id, title, order_index
        FROM modules
        WHERE training_path_id IS NULL
        ORDER BY order_index ASC NULLS LAST, created_at ASC
    LOOP
        UPDATE modules
        SET order_index = new_order,
            updated_at = NOW()
        WHERE id = module_record.id;

        new_order := new_order + 1;
    END LOOP;

    IF new_order > 0 THEN
        RAISE NOTICE 'Fixed % modules without training path', new_order;
    END IF;
END $$;

-- ========================================
-- STEP 4: Verify the fix
-- ========================================

-- Show the new order for each training path
DO $$
DECLARE
    path_record RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION - Current module order:';
    RAISE NOTICE '========================================';

    FOR path_record IN
        SELECT
            COALESCE(training_path_id, 'NO PATH') as path_id,
            order_index,
            title,
            id
        FROM modules
        ORDER BY
            COALESCE(training_path_id, 'zzz') ASC,
            order_index ASC
    LOOP
        RAISE NOTICE 'Path: % | Order: % | Module: %',
                     path_record.path_id,
                     path_record.order_index,
                     path_record.title;
    END LOOP;
END $$;

-- ========================================
-- STEP 5: Update training_paths with Arabic translations
-- ========================================
UPDATE training_paths
SET
    name_ar = CASE id
        WHEN 'tronc-commun' THEN 'الجذع المشترك'
        WHEN 'operations-magasin' THEN 'عمليات المتجر'
        WHEN 'operations-entrepot' THEN 'عمليات المستودع'
        WHEN 'management' THEN 'الإدارة والقيادة'
        WHEN 'fonctions-support' THEN 'وظائف الدعم'
        WHEN 'securite-qualite' THEN 'السلامة والجودة'
        ELSE name_ar
    END,
    description_ar = CASE id
        WHEN 'tronc-commun' THEN 'تدريبات إلزامية لجميع موظفي أكاديمية بوديجا'
        WHEN 'operations-magasin' THEN 'تدريب لموظفي المتجر وخدمة العملاء'
        WHEN 'operations-entrepot' THEN 'تدريب لموظفي المستودع والخدمات اللوجستية'
        WHEN 'management' THEN 'تدريب متقدم للمدراء والمشرفين'
        WHEN 'fonctions-support' THEN 'تدريب للفرق الإدارية والدعم'
        WHEN 'securite-qualite' THEN 'تدريب شامل على السلامة والجودة'
        ELSE description_ar
    END
WHERE name_ar IS NULL OR description_ar IS NULL;

-- ========================================
-- STEP 6: Update modules with basic Arabic translations
-- ========================================

-- Update "Hola Bienvenido" / Welcome module
UPDATE modules
SET
    title_ar = 'مرحباً بك',
    description_ar = 'مقدمة إلى أكاديمية بوديجا - قيمنا ومهمتنا وثقافتنا',
    content_ar = '<h2>مرحباً بك في أكاديمية بوديجا!</h2>
<p>نحن سعداء بانضمامك إلى فريقنا. ستساعدك هذه المنصة على تطوير مهاراتك والنجاح في دورك.</p>
<h3>قيمنا</h3>
<ul>
<li><strong>الجودة</strong> - نسعى للتميز في كل ما نقوم به</li>
<li><strong>الخدمة</strong> - عملاؤنا هم أولويتنا</li>
<li><strong>الابتكار</strong> - نحن نتحسن باستمرار</li>
<li><strong>العمل الجماعي</strong> - النجاح معاً</li>
</ul>
<p>استمتع برحلة التدريب الخاصة بك!</p>'
WHERE (title ILIKE '%bienvenido%' OR title ILIKE '%bienvenue%' OR title ILIKE '%welcome%')
AND title_ar IS NULL;

-- ========================================
-- STEP 7: Create indexes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_modules_has_multiple_pages ON modules(has_multiple_pages);
CREATE INDEX IF NOT EXISTS idx_training_paths_name_ar ON training_paths(name_ar);
CREATE INDEX IF NOT EXISTS idx_modules_title_ar ON modules(title_ar);

-- ========================================
-- STEP 8: Add documentation
-- ========================================
COMMENT ON COLUMN training_paths.name_ar IS 'Arabic translation of the training path name';
COMMENT ON COLUMN training_paths.description_ar IS 'Arabic translation of the training path description';
COMMENT ON COLUMN modules.title_ar IS 'Arabic translation of the module title';
COMMENT ON COLUMN modules.description_ar IS 'Arabic translation of the module description';
COMMENT ON COLUMN modules.content_ar IS 'Arabic translation of the module content (HTML)';
COMMENT ON COLUMN modules.has_multiple_pages IS 'Indicates if the module uses multiple pages instead of single content';
COMMENT ON COLUMN modules.pages IS 'JSON array of pages for multi-page modules';

COMMIT;

-- ========================================
-- Migration completed successfully!
-- ========================================
-- Summary:
-- 1. Added all missing columns (Arabic translations + multi-page support)
-- 2. Fixed all duplicate order_index issues by resequencing modules
-- 3. Added Arabic translations for training paths
-- 4. Added basic Arabic translation for welcome module
-- 5. Created performance indexes
-- 6. You can now save modules without errors!
