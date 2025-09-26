-- Script pour corriger la table modules et ajouter les colonnes manquantes
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- 1. Ajouter les colonnes manquantes à la table modules
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS target_job_roles TEXT[],
ADD COLUMN IF NOT EXISTS target_departments TEXT[],
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS prerequisite_modules TEXT[],
ADD COLUMN IF NOT EXISTS training_path_id VARCHAR(255);

-- 2. Ajouter les contraintes si elles n'existent pas
DO $$
BEGIN
    -- Contrainte pour category
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'modules_category_check') THEN
        ALTER TABLE modules
        ADD CONSTRAINT modules_category_check
        CHECK (category IN ('welcome', 'job_specific', 'general', 'compliance'));
    END IF;
END
$$;

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_mandatory ON modules(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(order_index);
CREATE INDEX IF NOT EXISTS idx_modules_training_path_id ON modules(training_path_id);

-- 4. Mettre à jour les modules existants avec des valeurs par défaut
UPDATE modules SET
    order_index = COALESCE(order_index, 0),
    category = COALESCE(category, 'general'),
    is_mandatory = COALESCE(is_mandatory, FALSE)
WHERE order_index IS NULL OR category IS NULL OR is_mandatory IS NULL;

-- 5. Ajouter une clé étrangère vers training_paths si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_paths') THEN
        -- Supprimer la contrainte si elle existe déjà
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'modules_training_path_id_fkey') THEN
            ALTER TABLE modules DROP CONSTRAINT modules_training_path_id_fkey;
        END IF;

        -- Ajouter la nouvelle contrainte
        ALTER TABLE modules
        ADD CONSTRAINT modules_training_path_id_fkey
        FOREIGN KEY (training_path_id) REFERENCES training_paths(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- 6. Vérifier la structure de la table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'modules'
ORDER BY ordinal_position;

COMMIT;