-- =====================================================
-- AUDIT UNIFIÉ - LOGIQUE DE VERROUILLAGE
-- Bodega Academy - Résultats en une seule requête
-- =====================================================

-- Tout en un seul résultat
WITH
-- 1. Structure de la table modules
structure_modules AS (
    SELECT
        '1. STRUCTURE MODULES' as section,
        column_name as info,
        data_type as detail,
        is_nullable as extra
    FROM information_schema.columns
    WHERE table_name = 'modules' AND table_schema = 'public'
),

-- 2. Modules par parcours
modules_par_parcours AS (
    SELECT
        '2. MODULES PAR PARCOURS' as section,
        COALESCE(tp.name, 'Sans parcours') as info,
        COUNT(m.id)::text as detail,
        COUNT(CASE WHEN m.is_mandatory THEN 1 END)::text as extra
    FROM modules m
    LEFT JOIN training_paths tp ON m.training_path_id = tp.id
    GROUP BY tp.name
),

-- 3. Liste des modules avec order_index
modules_ordre AS (
    SELECT
        '3. MODULES ORDRE' as section,
        COALESCE(tp.name, 'Sans parcours') || ' - ' || m.title as info,
        COALESCE(m.order_index::text, 'NULL') as detail,
        m.is_mandatory::text as extra
    FROM modules m
    LEFT JOIN training_paths tp ON m.training_path_id = tp.id
    ORDER BY tp.name NULLS LAST, m.order_index NULLS LAST
    LIMIT 50
),

-- 4. Problèmes détectés
problemes AS (
    SELECT
        '4. PROBLÈMES' as section,
        'Modules sans parcours' as info,
        COUNT(*)::text as detail,
        '' as extra
    FROM modules
    WHERE training_path_id IS NULL

    UNION ALL

    SELECT
        '4. PROBLÈMES',
        'Modules sans order_index',
        COUNT(*)::text,
        ''
    FROM modules
    WHERE order_index IS NULL AND training_path_id IS NOT NULL

    UNION ALL

    SELECT
        '4. PROBLÈMES',
        'Doublons order_index',
        COUNT(*)::text,
        ''
    FROM (
        SELECT training_path_id, order_index
        FROM modules
        WHERE training_path_id IS NOT NULL
        GROUP BY training_path_id, order_index
        HAVING COUNT(*) > 1
    ) dup
),

-- 5. Progression utilisateurs
progression AS (
    SELECT
        '5. PROGRESSION USERS' as section,
        COALESCE(prof.full_name, 'User-' || up.user_id::text) as info,
        COUNT(*)::text || ' démarrés' as detail,
        COUNT(CASE WHEN up.status = 'completed' THEN 1 END)::text || ' complétés' as extra
    FROM user_progress up
    LEFT JOIN user_profiles prof ON prof.id = up.user_id
    GROUP BY up.user_id, prof.full_name
    ORDER BY COUNT(CASE WHEN up.status = 'completed' THEN 1 END) DESC
    LIMIT 20
),

-- 6. Colonnes pour verrouillage
colonnes AS (
    SELECT
        '6. COLONNES VERROUILLAGE' as section,
        column_name as info,
        data_type as detail,
        CASE
            WHEN column_name = 'training_path_id' THEN '✓ Nécessaire'
            WHEN column_name = 'order_index' THEN '✓ Nécessaire'
            WHEN column_name = 'is_mandatory' THEN '○ Utile'
            ELSE '○ Standard'
        END as extra
    FROM information_schema.columns
    WHERE table_name = 'modules'
        AND table_schema = 'public'
        AND column_name IN (
            'id', 'title', 'training_path_id', 'module_category',
            'order_index', 'is_mandatory', 'category',
            'has_multiple_pages', 'pages'
        )
),

-- 7. Détails des parcours
parcours AS (
    SELECT
        '7. PARCOURS FORMATION' as section,
        tp.name as info,
        COALESCE(tp.description, 'Pas de description') as detail,
        tp.icon || ' ' || COALESCE(tp.color, '') as extra
    FROM training_paths tp
),

-- 8. Résumé
resume AS (
    SELECT
        '8. RÉSUMÉ' as section,
        'Total modules' as info,
        COUNT(*)::text as detail,
        '' as extra
    FROM modules

    UNION ALL

    SELECT
        '8. RÉSUMÉ',
        'Modules avec parcours',
        COUNT(*)::text,
        ''
    FROM modules
    WHERE training_path_id IS NOT NULL

    UNION ALL

    SELECT
        '8. RÉSUMÉ',
        'Modules avec order_index',
        COUNT(*)::text,
        ''
    FROM modules
    WHERE order_index IS NOT NULL

    UNION ALL

    SELECT
        '8. RÉSUMÉ',
        'Parcours de formation',
        COUNT(*)::text,
        ''
    FROM training_paths

    UNION ALL

    SELECT
        '8. RÉSUMÉ',
        'Utilisateurs actifs',
        COUNT(DISTINCT user_id)::text,
        ''
    FROM user_progress
)

-- Combiner tous les résultats
SELECT * FROM structure_modules
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM modules_par_parcours
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM modules_ordre
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM problemes
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM progression
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM colonnes
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM parcours
UNION ALL
SELECT '---', '---', '---', '---'
UNION ALL
SELECT * FROM resume
UNION ALL
SELECT '===', 'AUDIT TERMINÉ', '===', '==='
ORDER BY section, info;
