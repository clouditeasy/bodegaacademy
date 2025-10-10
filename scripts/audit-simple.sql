-- =====================================================
-- AUDIT SIMPLE - LOGIQUE DE VERROUILLAGE
-- Bodega Academy - À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. STRUCTURE DES TABLES PRINCIPALES
-- =====================================================
SELECT
    '=== STRUCTURE TABLE MODULES ===' as info,
    NULL as column_name,
    NULL as data_type,
    NULL as is_nullable
UNION ALL
SELECT
    NULL,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'modules'
    AND table_schema = 'public'
ORDER BY 1 NULLS LAST, 2;

-- Séparateur
SELECT '----------------------------------------' as separator;

-- 2. MODULES PAR PARCOURS
-- =====================================================
SELECT
    COALESCE(tp.name, 'Sans parcours') as path_name,
    COUNT(m.id) as module_count,
    COUNT(CASE WHEN m.is_mandatory THEN 1 END) as mandatory_count
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
GROUP BY tp.name
ORDER BY tp.name NULLS LAST;

SELECT '----------------------------------------' as separator;

-- 3. VÉRIFICATION ORDER_INDEX
-- =====================================================
SELECT
    COALESCE(tp.name, 'Sans parcours') as path_name,
    m.title as module_title,
    m.order_index,
    m.is_mandatory
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
ORDER BY tp.name NULLS LAST, m.order_index NULLS LAST;

SELECT '----------------------------------------' as separator;

-- 4. PROBLÈMES POTENTIELS
-- =====================================================
-- 4.1 Modules sans training_path_id
SELECT
    'PROBLÈME: Modules sans parcours' as issue,
    COUNT(*) as count
FROM modules
WHERE training_path_id IS NULL;

-- 4.2 Modules sans order_index
SELECT
    'PROBLÈME: Modules sans order_index' as issue,
    COUNT(*) as count
FROM modules
WHERE order_index IS NULL AND training_path_id IS NOT NULL;

-- 4.3 Doublons order_index
SELECT
    'PROBLÈME: Doublons order_index' as issue,
    training_path_id,
    order_index,
    COUNT(*) as duplicate_count
FROM modules
WHERE training_path_id IS NOT NULL
GROUP BY training_path_id, order_index
HAVING COUNT(*) > 1;

SELECT '----------------------------------------' as separator;

-- 5. PROGRESSION UTILISATEURS
-- =====================================================
SELECT
    COALESCE(prof.full_name, 'Utilisateur ' || up.user_id::text) as user_name,
    COUNT(*) as modules_started,
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN up.status = 'in_progress' THEN 1 END) as in_progress,
    ROUND(AVG(CASE WHEN up.score IS NOT NULL THEN up.score END), 2) as avg_score
FROM user_progress up
LEFT JOIN user_profiles prof ON prof.id = up.user_id
GROUP BY up.user_id, prof.full_name
ORDER BY completed DESC;

SELECT '----------------------------------------' as separator;

-- 6. MODULES COMPLÉTÉS PAR ORDRE
-- =====================================================
SELECT
    tp.name as path_name,
    m.order_index,
    m.title as module_title,
    COUNT(DISTINCT up.user_id) as users_completed
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
LEFT JOIN user_progress up ON up.module_id = m.id AND up.status = 'completed'
WHERE m.training_path_id IS NOT NULL
GROUP BY tp.name, m.order_index, m.title
ORDER BY tp.name, m.order_index;

SELECT '----------------------------------------' as separator;

-- 7. COLONNES NÉCESSAIRES POUR VERROUILLAGE
-- =====================================================
SELECT
    column_name,
    data_type,
    is_nullable,
    CASE
        WHEN column_name = 'training_path_id' THEN '✓ Nécessaire pour verrouillage'
        WHEN column_name = 'order_index' THEN '✓ Nécessaire pour séquence'
        WHEN column_name = 'is_mandatory' THEN '✓ Utile'
        WHEN column_name IN ('module_category', 'category') THEN '⚠ Ancienne structure'
        ELSE '○ Standard'
    END as status
FROM information_schema.columns
WHERE table_name = 'modules'
    AND table_schema = 'public'
    AND column_name IN (
        'id', 'title', 'training_path_id', 'module_category',
        'order_index', 'is_mandatory', 'category',
        'has_multiple_pages', 'pages', 'created_at', 'updated_at'
    )
ORDER BY
    CASE column_name
        WHEN 'training_path_id' THEN 1
        WHEN 'order_index' THEN 2
        WHEN 'is_mandatory' THEN 3
        ELSE 4
    END;

SELECT '----------------------------------------' as separator;

-- 8. DÉTAILS DES PARCOURS DE FORMATION
-- =====================================================
SELECT
    tp.id,
    tp.name,
    tp.description,
    tp.icon,
    tp.color
FROM training_paths tp
ORDER BY tp.name;

SELECT '----------------------------------------' as separator;

-- 9. RÉSUMÉ FINAL
-- =====================================================
SELECT 'RÉSUMÉ GLOBAL' as section, '---' as value
UNION ALL
SELECT 'Total modules', COUNT(*)::text FROM modules
UNION ALL
SELECT 'Modules avec parcours', COUNT(*)::text FROM modules WHERE training_path_id IS NOT NULL
UNION ALL
SELECT 'Modules sans parcours', COUNT(*)::text FROM modules WHERE training_path_id IS NULL
UNION ALL
SELECT 'Modules avec order_index', COUNT(*)::text FROM modules WHERE order_index IS NOT NULL
UNION ALL
SELECT 'Modules sans order_index', COUNT(*)::text FROM modules WHERE order_index IS NULL
UNION ALL
SELECT 'Parcours de formation', COUNT(*)::text FROM training_paths
UNION ALL
SELECT 'Utilisateurs avec progression', COUNT(DISTINCT user_id)::text FROM user_progress
UNION ALL
SELECT 'Total progressions enregistrées', COUNT(*)::text FROM user_progress;

-- FIN DE L'AUDIT
SELECT '=== AUDIT TERMINÉ ===' as status;
