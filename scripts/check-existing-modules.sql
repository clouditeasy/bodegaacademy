-- Script pour vérifier les modules existants dans le parcours Tronc Commun
-- et trouver le prochain order_index disponible

-- 1. Voir tous les modules du parcours Tronc Commun
SELECT
  id,
  title,
  order_index,
  is_active,
  is_mandatory,
  created_at
FROM modules
WHERE training_path_id = 'tronc-commun'
ORDER BY order_index ASC;

-- 2. Trouver le prochain order_index disponible
SELECT
  COALESCE(MAX(order_index), 0) + 1 as next_order_index
FROM modules
WHERE training_path_id = 'tronc-commun';
