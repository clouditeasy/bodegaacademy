-- Script to run the training paths alignment for Bodega Academy
-- This script should be executed in your Supabase SQL editor
-- Make sure to back up your data before running this script

-- 1. First, run the alignment migration
\i 'migrations/align_training_paths_bodega.sql'

-- 2. Verify the training paths were created
SELECT
    id,
    name,
    description,
    icon,
    order_index,
    target_roles,
    estimated_duration,
    priority
FROM training_paths
ORDER BY order_index;

-- 3. Verify the training path quizzes were created
SELECT
    tp.name as training_path_name,
    tpq.title as quiz_title,
    tpq.passing_score,
    tpq.max_attempts
FROM training_path_quizzes tpq
JOIN training_paths tp ON tpq.training_path_id = tp.id
ORDER BY tp.order_index;

-- 4. Check modules assignment to training paths
SELECT
    tp.name as training_path_name,
    COUNT(m.id) as modules_count,
    string_agg(m.title, ', ' ORDER BY m.title) as module_titles
FROM training_paths tp
LEFT JOIN modules m ON m.training_path_id = tp.id
GROUP BY tp.id, tp.name, tp.order_index
ORDER BY tp.order_index;

-- 5. Show unassigned modules (modules without training_path_id)
SELECT
    id,
    title,
    description,
    is_active,
    created_at
FROM modules
WHERE training_path_id IS NULL
ORDER BY created_at DESC;