-- =====================================================
-- FONCTION RPC POUR L'ACCÈS AUX MODULES
-- Bodega Academy - Compatible avec le frontend
-- =====================================================

-- Créer une fonction RPC compatible avec le hook useModuleAccess
CREATE OR REPLACE FUNCTION get_module_access_status(
    p_user_id uuid,
    p_training_path_id varchar
)
RETURNS TABLE (
    module_id uuid,
    module_title text,
    order_index integer,
    is_locked boolean,
    reason text,
    previous_module_title text
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
        CASE
            WHEN is_module_locked(p_user_id, m.id) THEN
                'Vous devez compléter le module précédent: ' || COALESCE(prev.title, '')
            ELSE
                'Module disponible'
        END as reason,
        prev.title as previous_module_title
    FROM modules m
    LEFT JOIN modules prev ON
        prev.training_path_id = m.training_path_id
        AND prev.order_index = m.order_index - 1
    WHERE m.training_path_id = p_training_path_id
        AND m.is_active = true
    ORDER BY m.order_index;
END;
$$;

-- Ajouter un commentaire
COMMENT ON FUNCTION get_module_access_status(uuid, varchar) IS
'Fonction RPC pour obtenir le statut d''accès aux modules d''un parcours.
Utilisée par le hook useModuleAccess dans le frontend.';

-- Tester la fonction
SELECT 'Test de la fonction get_module_access_status:' as info;
SELECT
    module_title,
    order_index,
    is_locked,
    reason
FROM get_module_access_status(
    (SELECT id FROM user_profiles LIMIT 1),
    (SELECT id FROM training_paths WHERE name = 'Tronc Commun')
)
LIMIT 5;
