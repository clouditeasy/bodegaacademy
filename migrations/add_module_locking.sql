-- =====================================================
-- MIGRATION : LOGIQUE DE VERROUILLAGE DES MODULES
-- Bodega Academy
-- =====================================================
-- Cette migration ajoute la logique de verrouillage séquentiel
-- des modules basée sur l'order_index et la complétion
-- =====================================================

-- ÉTAPE 1 : Corriger les doublons d'order_index
-- =====================================================

-- Identifier et corriger les modules en doublon dans "Tronc Commun"
-- On garde order_index=0 pour "ONBOARDING" et order_index=1 pour "Hola, Bienvenido"

DO $$
DECLARE
    module_onboarding_id uuid;
    module_hola_id uuid;
BEGIN
    -- Trouver les IDs des modules
    SELECT id INTO module_onboarding_id
    FROM modules
    WHERE title LIKE '%ONBOARDING%'
    AND training_path_id IN (SELECT id FROM training_paths WHERE name = 'Tronc Commun')
    LIMIT 1;

    SELECT id INTO module_hola_id
    FROM modules
    WHERE title LIKE '%Hola%Bienvenido%'
    AND training_path_id IN (SELECT id FROM training_paths WHERE name = 'Tronc Commun')
    LIMIT 1;

    -- Assigner order_index = 0 à ONBOARDING (premier module)
    IF module_onboarding_id IS NOT NULL THEN
        UPDATE modules
        SET order_index = 0
        WHERE id = module_onboarding_id;

        RAISE NOTICE 'Module ONBOARDING défini avec order_index = 0';
    END IF;

    -- Assigner order_index = 1 à "Hola, Bienvenido" (deuxième module)
    IF module_hola_id IS NOT NULL THEN
        UPDATE modules
        SET order_index = 1
        WHERE id = module_hola_id;

        RAISE NOTICE 'Module Hola Bienvenido défini avec order_index = 1';
    END IF;
END $$;

-- Vérification : Afficher les modules corrigés
SELECT
    m.title,
    m.order_index,
    tp.name as parcours
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
WHERE tp.name = 'Tronc Commun'
ORDER BY m.order_index;


-- ÉTAPE 2 : Créer une fonction pour vérifier le verrouillage
-- =====================================================

-- Cette fonction vérifie si un module est verrouillé pour un utilisateur
CREATE OR REPLACE FUNCTION is_module_locked(
    p_user_id uuid,
    p_module_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_training_path_id varchar;
    v_order_index integer;
    v_previous_module_id uuid;
    v_previous_completed boolean;
BEGIN
    -- Récupérer le training_path_id et l'order_index du module
    SELECT training_path_id, order_index
    INTO v_training_path_id, v_order_index
    FROM modules
    WHERE id = p_module_id;

    -- Si pas de parcours ou order_index = 0, le module est déverrouillé
    IF v_training_path_id IS NULL OR v_order_index = 0 THEN
        RETURN false;
    END IF;

    -- Trouver le module précédent dans le même parcours
    SELECT id INTO v_previous_module_id
    FROM modules
    WHERE training_path_id = v_training_path_id
        AND order_index = v_order_index - 1
    LIMIT 1;

    -- Si pas de module précédent, déverrouillé
    IF v_previous_module_id IS NULL THEN
        RETURN false;
    END IF;

    -- Vérifier si le module précédent est complété
    SELECT COALESCE(
        (SELECT status = 'completed'
         FROM user_progress
         WHERE user_id = p_user_id
           AND module_id = v_previous_module_id),
        false
    ) INTO v_previous_completed;

    -- Le module est verrouillé si le précédent n'est pas complété
    RETURN NOT v_previous_completed;
END;
$$;

-- Ajouter un commentaire sur la fonction
COMMENT ON FUNCTION is_module_locked(uuid, uuid) IS
'Vérifie si un module est verrouillé pour un utilisateur donné.
Un module est verrouillé si le module précédent (order_index - 1)
dans le même parcours n''est pas complété.';


-- ÉTAPE 3 : Créer une fonction pour obtenir tous les modules verrouillés d'un parcours
-- =====================================================

CREATE OR REPLACE FUNCTION get_locked_modules_for_user(
    p_user_id uuid,
    p_training_path_id varchar
)
RETURNS TABLE (
    module_id uuid,
    module_title text,
    order_index integer,
    is_locked boolean,
    required_module_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id as module_id,
        m.title as module_title,
        m.order_index,
        is_module_locked(p_user_id, m.id) as is_locked,
        prev.title as required_module_title
    FROM modules m
    LEFT JOIN modules prev ON
        prev.training_path_id = m.training_path_id
        AND prev.order_index = m.order_index - 1
    WHERE m.training_path_id = p_training_path_id
    ORDER BY m.order_index;
END;
$$;

-- Ajouter un commentaire
COMMENT ON FUNCTION get_locked_modules_for_user(uuid, varchar) IS
'Retourne la liste de tous les modules d''un parcours avec leur statut de verrouillage pour un utilisateur.';


-- ÉTAPE 4 : Créer une vue pour faciliter l'accès
-- =====================================================

CREATE OR REPLACE VIEW user_module_access AS
SELECT
    u.id as user_id,
    m.id as module_id,
    m.title as module_title,
    m.training_path_id,
    m.order_index,
    tp.name as training_path_name,
    prog.status,
    prog.score,
    -- Le module est verrouillé si order_index > 0 ET module précédent non complété
    CASE
        WHEN m.order_index = 0 THEN false
        WHEN m.training_path_id IS NULL THEN false
        ELSE (
            SELECT NOT COALESCE(
                (SELECT status = 'completed'
                 FROM user_progress up_prev
                 WHERE up_prev.user_id = u.id
                   AND up_prev.module_id = prev_module.id),
                false
            )
            FROM modules prev_module
            WHERE prev_module.training_path_id = m.training_path_id
              AND prev_module.order_index = m.order_index - 1
            LIMIT 1
        )
    END as is_locked
FROM modules m
LEFT JOIN training_paths tp ON m.training_path_id = tp.id
CROSS JOIN user_profiles u
LEFT JOIN user_progress prog ON prog.user_id = u.id AND prog.module_id = m.id
WHERE m.is_active = true;

-- Ajouter un commentaire
COMMENT ON VIEW user_module_access IS
'Vue combinant les modules, les parcours et la progression utilisateur avec le statut de verrouillage.';


-- ÉTAPE 5 : Créer des index pour optimiser les performances
-- =====================================================

-- Index sur training_path_id et order_index pour les requêtes de verrouillage
CREATE INDEX IF NOT EXISTS idx_modules_path_order
ON modules(training_path_id, order_index)
WHERE training_path_id IS NOT NULL;

-- Index sur user_progress pour les vérifications de complétion
CREATE INDEX IF NOT EXISTS idx_user_progress_user_module_status
ON user_progress(user_id, module_id, status);

-- Index sur user_progress pour trouver rapidement les modules complétés
CREATE INDEX IF NOT EXISTS idx_user_progress_completed
ON user_progress(user_id, status)
WHERE status = 'completed';


-- ÉTAPE 6 : Ajouter des contraintes pour éviter les doublons futurs
-- =====================================================

-- Créer un index unique partiel sur (training_path_id, order_index)
-- pour éviter les doublons d'order_index dans un même parcours
DROP INDEX IF EXISTS unique_training_path_order_index;

CREATE UNIQUE INDEX unique_training_path_order_index
ON modules(training_path_id, order_index)
WHERE training_path_id IS NOT NULL;


-- ÉTAPE 7 : Créer une fonction trigger pour valider l'order_index
-- =====================================================

CREATE OR REPLACE FUNCTION validate_module_order_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier que order_index est >= 0
    IF NEW.order_index < 0 THEN
        RAISE EXCEPTION 'order_index doit être >= 0';
    END IF;

    -- Si le module a un parcours, s'assurer qu'il n'y a pas de gap
    IF NEW.training_path_id IS NOT NULL AND NEW.order_index > 0 THEN
        -- Vérifier qu'il existe un module avec order_index - 1
        IF NOT EXISTS (
            SELECT 1 FROM modules
            WHERE training_path_id = NEW.training_path_id
              AND order_index = NEW.order_index - 1
              AND id != NEW.id
        ) THEN
            RAISE WARNING 'Attention: gap détecté dans la séquence pour training_path_id %', NEW.training_path_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_validate_module_order ON modules;
CREATE TRIGGER trigger_validate_module_order
    BEFORE INSERT OR UPDATE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION validate_module_order_index();


-- ÉTAPE 8 : Tests et vérifications
-- =====================================================

-- Test 1 : Vérifier qu'il n'y a plus de doublons
SELECT
    'TEST 1: Doublons order_index' as test,
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS - Aucun doublon'
        ELSE '✗ FAIL - ' || COUNT(*) || ' doublons détectés'
    END as resultat
FROM (
    SELECT training_path_id, order_index, COUNT(*) as cnt
    FROM modules
    WHERE training_path_id IS NOT NULL
    GROUP BY training_path_id, order_index
    HAVING COUNT(*) > 1
) duplicates;

-- Test 2 : Vérifier que la fonction de verrouillage existe
SELECT
    'TEST 2: Fonction is_module_locked' as test,
    CASE
        WHEN COUNT(*) > 0 THEN '✓ PASS - Fonction créée'
        ELSE '✗ FAIL - Fonction manquante'
    END as resultat
FROM pg_proc
WHERE proname = 'is_module_locked';

-- Test 3 : Vérifier que la vue existe
SELECT
    'TEST 3: Vue user_module_access' as test,
    CASE
        WHEN COUNT(*) > 0 THEN '✓ PASS - Vue créée'
        ELSE '✗ FAIL - Vue manquante'
    END as resultat
FROM pg_views
WHERE viewname = 'user_module_access';

-- Test 4 : Vérifier que les index existent
SELECT
    'TEST 4: Index de performance' as test,
    CASE
        WHEN COUNT(*) >= 3 THEN '✓ PASS - ' || COUNT(*) || ' index créés'
        ELSE '✗ FAIL - Seulement ' || COUNT(*) || ' index'
    END as resultat
FROM pg_indexes
WHERE tablename IN ('modules', 'user_progress')
    AND indexname LIKE 'idx_%';


-- RÉSUMÉ DE LA MIGRATION
-- =====================================================
SELECT '========================================' as separator;
SELECT '✓ MIGRATION TERMINÉE' as statut;
SELECT '========================================' as separator;
SELECT 'Fonctionnalités ajoutées:' as info
UNION ALL SELECT '1. Fonction is_module_locked(user_id, module_id)'
UNION ALL SELECT '2. Fonction get_locked_modules_for_user(user_id, path_id)'
UNION ALL SELECT '3. Vue user_module_access'
UNION ALL SELECT '4. Contrainte unique sur (training_path_id, order_index)'
UNION ALL SELECT '5. Index de performance'
UNION ALL SELECT '6. Trigger de validation order_index'
UNION ALL SELECT '7. Correction des doublons order_index';
