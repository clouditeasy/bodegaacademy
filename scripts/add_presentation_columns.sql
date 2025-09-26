-- Script pour ajouter les colonnes presentation manquantes à la table modules
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- Ajouter les colonnes presentation_url et presentation_type
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS presentation_url TEXT,
ADD COLUMN IF NOT EXISTS presentation_type TEXT;

-- Ajouter une contrainte pour presentation_type
DO $$
BEGIN
    -- Contrainte pour presentation_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'modules_presentation_type_check') THEN
        ALTER TABLE modules
        ADD CONSTRAINT modules_presentation_type_check
        CHECK (presentation_type IS NULL OR presentation_type IN ('pdf', 'powerpoint'));
    END IF;
END
$$;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_modules_presentation_type ON modules(presentation_type);

COMMIT;

-- Vérifier que les colonnes ont été ajoutées
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'modules'
    AND table_schema = 'public'
    AND column_name IN ('presentation_url', 'presentation_type')
ORDER BY column_name;