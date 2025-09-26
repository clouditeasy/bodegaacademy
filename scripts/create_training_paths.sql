-- Script pour créer des parcours de formation de base
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- Créer la table training_paths si elle n'existe pas
CREATE TABLE IF NOT EXISTS training_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚',
    color TEXT DEFAULT '#f97316',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    target_roles TEXT[],
    has_end_quiz BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer des parcours de formation de base pour Bodega Academy
INSERT INTO training_paths (name, description, icon, color, order_index, target_roles, has_end_quiz)
VALUES
    ('Tronc Commun', 'Formation de base obligatoire pour tous les employés', '🏛️', '#3b82f6', 0, ARRAY['all'], false),
    ('Opérations Magasin', 'Formation spécialisée pour les équipes magasin', '🏪', '#10b981', 1, ARRAY['Store Manager', 'Sales Associate', 'Cashier'], true),
    ('Opérations Entrepôt', 'Formation pour les équipes logistique et entrepôt', '📦', '#8b5cf6', 2, ARRAY['Warehouse Manager', 'Warehouse Associate', 'Logistics Coordinator'], true),
    ('Management', 'Formation leadership et gestion d''équipe', '👥', '#f59e0b', 3, ARRAY['Store Manager', 'Warehouse Manager', 'Department Head'], true),
    ('Fonctions Support', 'Formation pour les équipes administratives', '💼', '#6b7280', 4, ARRAY['HR Specialist', 'Accountant', 'Admin Assistant'], false),
    ('Sécurité et Qualité', 'Normes de sécurité et contrôle qualité', '🛡️', '#ef4444', 5, ARRAY['all'], true)
ON CONFLICT (name) DO NOTHING;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_training_paths_is_active ON training_paths(is_active);
CREATE INDEX IF NOT EXISTS idx_training_paths_order_index ON training_paths(order_index);

-- Mettre à jour les modules existants pour les assigner au Tronc Commun par défaut
UPDATE modules
SET training_path_id = (
    SELECT id FROM training_paths WHERE name = 'Tronc Commun' LIMIT 1
)
WHERE training_path_id IS NULL;

COMMIT;

-- Vérifier les parcours créés
SELECT
    name,
    description,
    icon,
    order_index,
    is_active
FROM training_paths
ORDER BY order_index;