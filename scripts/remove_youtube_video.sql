-- Script pour supprimer l'URL YouTube du module spécifique
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- Vérifier le module avant suppression
SELECT
    id,
    title,
    video_url
FROM modules
WHERE id = '6a9729cf-1b4f-4e2d-91bd-fff3d81d350e';

-- Supprimer l'URL YouTube du module
UPDATE modules
SET video_url = NULL,
    updated_at = NOW()
WHERE id = '6a9729cf-1b4f-4e2d-91bd-fff3d81d350e'
  AND video_url = 'https://www.youtube.com/watch?v=KfR5KyuUcSc';

-- Vérifier que la modification a été effectuée
SELECT
    id,
    title,
    video_url,
    'URL YouTube supprimée' as status
FROM modules
WHERE id = '6a9729cf-1b4f-4e2d-91bd-fff3d81d350e';

COMMIT;