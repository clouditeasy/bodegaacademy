-- Migration: Ajouter le champ image_url aux parcours de formation
-- Date: 2025-01-29
-- Description: Permet d'uploader une image pour chaque catégorie/parcours de formation

-- Ajouter la colonne image_url à la table training_paths
ALTER TABLE training_paths
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN training_paths.image_url IS 'URL de l''image de la catégorie stockée dans Azure Blob Storage';
