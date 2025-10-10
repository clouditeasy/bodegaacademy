-- =====================================================
-- SCRIPT D'AUDIT - LOGIQUE DE VERROUILLAGE
-- Bodega Academy - Audit de la base de données
-- =====================================================
-- Ce script analyse la structure actuelle de la base de données
-- pour préparer l'implémentation de la logique de verrouillage des modules
-- =====================================================

-- 1. AUDIT DES TABLES EXISTANTES
-- =====================================================

SELECT '========================================' as separator;
SELECT '1. STRUCTURE DES TABLES' as section;
SELECT '========================================' as separator;

-- 1.1 Structure de la table modules
SELECT '1.1 Structure table MODULES:' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'modules'
ORDER BY ordinal_position;

SELECT '----------------------------------------' as separator;

-- 1.2 Structure de la table training_paths
SELECT '1.2 Structure table TRAINING_PATHS:' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'training_paths'
ORDER BY ordinal_position;

SELECT '----------------------------------------' as separator;

-- 1.3 Structure de la table user_progress
SELECT '1.3 Structure table USER_PROGRESS:' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

SELECT '----------------------------------------' as separator;

-- 2. ANALYSE DES DONNÉES ACTUELLES
-- =====================================================

SELECT '========================================' as separator;
SELECT '2. ANALYSE DES DONNÉES' as section;
SELECT '========================================' as separator;

-- 2.1 Nombre total de modules par training path
SELECT '2.1 Modules par parcours de formation:' as info;
SELECT
    tp.id as path_id,
    tp.name as path_name,
    COUNT(m.id) as module_count,
    COUNT(CASE WHEN m.is_mandatory THEN 1 END) as mandatory_count
FROM training_paths tp
LEFT JOIN modules m ON m.training_path_id = tp.id
GROUP BY tp.id, tp.name
ORDER BY tp.name;

SELECT '----------------------------------------' as separator;

-- 2.2 Modules avec order_index
SELECT '2.2 Distribution des order_index par parcours:' as info;
SELECT
    tp.name as path_name,
    m.id,
    m.title,
    m.order_index,
    m.is_mandatory
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
WHERE m.training_path_id IS NOT NULL
ORDER BY tp.name, m.order_index;

SELECT '----------------------------------------' as separator;

-- 2.3 Modules sans training_path_id (ancienne structure)
SELECT '2.3 Modules sans parcours (structure ancienne):' as info;
SELECT
    COUNT(*) as count,
    ARRAY_AGG(DISTINCT category) as categories_used
FROM modules
WHERE training_path_id IS NULL OR module_category IS NOT NULL;

SELECT '----------------------------------------' as separator;

-- 2.4 Vérification de la cohérence des order_index
SELECT '2.4 Problèmes potentiels avec order_index:' as info;

-- Vérifier les doublons d'order_index dans un même parcours
SELECT
    'Doublons order_index' as issue_type,
    training_path_id,
    order_index,
    COUNT(*) as duplicate_count
FROM modules
WHERE training_path_id IS NOT NULL
GROUP BY training_path_id, order_index
HAVING COUNT(*) > 1

UNION ALL

-- Vérifier les gaps dans la séquence
SELECT
    'Gaps dans séquence' as issue_type,
    m1.training_path_id,
    m1.order_index as current_index,
    1 as note
FROM modules m1
WHERE m1.training_path_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules m2
    WHERE m2.training_path_id = m1.training_path_id
    AND m2.order_index = m1.order_index - 1
  )
  AND m1.order_index > 0;

SELECT '----------------------------------------' as separator;

-- 3. ANALYSE DE LA PROGRESSION DES UTILISATEURS
-- =====================================================

SELECT '========================================' as separator;
SELECT '3. PROGRESSION UTILISATEURS' as section;
SELECT '========================================' as separator;

-- 3.1 Statistiques de progression par utilisateur
SELECT '3.1 Stats de progression par utilisateur:' as info;
SELECT
    up.user_id,
    prof.full_name,
    prof.job_role,
    COUNT(*) as modules_started,
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN up.status = 'in_progress' THEN 1 END) as in_progress,
    ROUND(AVG(CASE WHEN up.score IS NOT NULL THEN up.score END), 2) as avg_score
FROM user_progress up
LEFT JOIN user_profiles prof ON prof.id = up.user_id
GROUP BY up.user_id, prof.full_name, prof.job_role
ORDER BY completed DESC
LIMIT 10;

SELECT '----------------------------------------' as separator;

-- 3.2 Modules complétés par parcours
SELECT '3.2 Progression par parcours (tous utilisateurs):' as info;
SELECT
    tp.name as path_name,
    m.title as module_title,
    m.order_index,
    COUNT(DISTINCT up.user_id) as users_completed
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
LEFT JOIN user_progress up ON up.module_id = m.id AND up.status = 'completed'
WHERE m.training_path_id IS NOT NULL
GROUP BY tp.name, m.title, m.order_index
ORDER BY tp.name, m.order_index;

SELECT '----------------------------------------' as separator;

-- 4. VÉRIFICATION DES COLONNES NÉCESSAIRES
-- =====================================================

SELECT '========================================' as separator;
SELECT '4. COLONNES POUR VERROUILLAGE' as section;
SELECT '========================================' as separator;

-- 4.1 Vérifier si les colonnes nécessaires existent
SELECT '4.1 Colonnes existantes pour la logique de verrouillage:' as info;
SELECT
    table_name,
    column_name,
    data_type,
    CASE
        WHEN column_name IN ('training_path_id', 'order_index', 'is_mandatory') THEN '✓ Nécessaire'
        WHEN column_name IN ('module_category', 'category') THEN '⚠ Ancienne structure'
        ELSE '○ Standard'
    END as importance
FROM information_schema.columns
WHERE table_name = 'modules'
    AND column_name IN (
        'training_path_id',
        'module_category',
        'order_index',
        'is_mandatory',
        'category',
        'has_multiple_pages',
        'pages'
    )
ORDER BY
    CASE column_name
        WHEN 'training_path_id' THEN 1
        WHEN 'order_index' THEN 2
        WHEN 'is_mandatory' THEN 3
        ELSE 4
    END;

SELECT '----------------------------------------' as separator;

-- 5. RECOMMANDATIONS
-- =====================================================

SELECT '========================================' as separator;
SELECT '5. RECOMMANDATIONS' as section;
SELECT '========================================' as separator;

SELECT '5.1 Actions recommandées:' as info;

-- Compter les modules à migrer
WITH migration_stats AS (
    SELECT
        COUNT(*) FILTER (WHERE training_path_id IS NULL) as sans_path,
        COUNT(*) FILTER (WHERE training_path_id IS NOT NULL AND order_index IS NULL) as sans_order,
        COUNT(*) FILTER (WHERE training_path_id IS NOT NULL AND order_index IS NOT NULL) as avec_order
    FROM modules
)
SELECT
    CASE
        WHEN sans_path > 0 THEN '⚠ ' || sans_path || ' modules sans training_path_id - Migration nécessaire'
        ELSE '✓ Tous les modules ont un training_path_id'
    END as recommendation
FROM migration_stats
WHERE sans_path > 0

UNION ALL

SELECT
    CASE
        WHEN sans_order > 0 THEN '⚠ ' || sans_order || ' modules sans order_index - Indexation nécessaire'
        ELSE '✓ Tous les modules ont un order_index'
    END
FROM migration_stats
WHERE sans_order > 0

UNION ALL

SELECT '✓ ' || avec_order || ' modules prêts pour le verrouillage'
FROM migration_stats
WHERE avec_order > 0;

SELECT '----------------------------------------' as separator;

-- 6. STRUCTURE PROPOSÉE POUR LE VERROUILLAGE
-- =====================================================

SELECT '========================================' as separator;
SELECT '6. STRUCTURE PROPOSÉE' as section;
SELECT '========================================' as separator;

SELECT '6.1 Colonnes à ajouter/modifier:' as info;
SELECT
    'modules' as table_name,
    'requires_previous_completion' as column_suggestion,
    'BOOLEAN DEFAULT TRUE' as type_suggestion,
    'Indique si le module nécessite la complétion du module précédent' as description

UNION ALL

SELECT
    'modules',
    'unlock_conditions',
    'JSONB',
    'Conditions personnalisées de déverrouillage (optionnel)'

UNION ALL

SELECT
    'user_progress',
    'unlocked_at',
    'TIMESTAMP',
    'Date/heure de déverrouillage du module pour l''utilisateur';

SELECT '========================================' as separator;
SELECT 'FIN DE L''AUDIT' as status;
SELECT '========================================' as separator;
