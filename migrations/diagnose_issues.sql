-- Diagnostic script: Check for issues in the database
-- Date: 2025-10-10
-- Description: Run this first to see what needs to be fixed

-- ========================================
-- 1. Check if columns exist
-- ========================================
SELECT
    'Column Check' as check_type,
    table_name,
    column_name,
    data_type,
    'EXISTS' as status
FROM information_schema.columns
WHERE table_name IN ('modules', 'training_paths')
    AND column_name IN ('name_ar', 'description_ar', 'title_ar', 'content_ar', 'has_multiple_pages', 'pages')
ORDER BY table_name, column_name;

-- ========================================
-- 2. Find duplicate order_index issues
-- ========================================
SELECT
    'Duplicate Order Index' as issue_type,
    training_path_id,
    order_index,
    COUNT(*) as duplicate_count,
    STRING_AGG(title || ' (ID: ' || id || ')', ' | ') as affected_modules
FROM modules
WHERE training_path_id IS NOT NULL
GROUP BY training_path_id, order_index
HAVING COUNT(*) > 1
ORDER BY training_path_id, order_index;

-- ========================================
-- 3. Show current module order per training path
-- ========================================
SELECT
    'Current Module Order' as info_type,
    COALESCE(m.training_path_id, 'NO PATH') as training_path,
    tp.name as path_name,
    m.order_index,
    m.title as module_title,
    m.is_active,
    m.created_at
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
ORDER BY
    COALESCE(m.training_path_id, 'zzz'),
    m.order_index ASC NULLS LAST,
    m.created_at;

-- ========================================
-- 4. Count modules per training path
-- ========================================
SELECT
    'Modules per Path' as info_type,
    COALESCE(m.training_path_id, 'NO PATH') as training_path,
    tp.name as path_name,
    COUNT(*) as module_count,
    MIN(m.order_index) as min_order,
    MAX(m.order_index) as max_order
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
GROUP BY m.training_path_id, tp.name
ORDER BY training_path;

-- ========================================
-- 5. Check for missing translations
-- ========================================
SELECT
    'Missing Arabic Translations' as check_type,
    'training_paths' as table_name,
    id,
    name,
    CASE
        WHEN name_ar IS NULL THEN 'Missing name_ar'
        WHEN description_ar IS NULL THEN 'Missing description_ar'
        ELSE 'Has translations'
    END as translation_status
FROM training_paths
ORDER BY id;

-- ========================================
-- Summary
-- ========================================
-- This diagnostic script will show you:
-- 1. Which columns exist or are missing
-- 2. Which modules have duplicate order_index
-- 3. Current order of all modules
-- 4. How many modules are in each training path
-- 5. Which training paths need Arabic translations
