-- Script pour nettoyer les URLs vidéo invalides de la base de données
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- Fonction pour valider si une URL vidéo est valide
CREATE OR REPLACE FUNCTION is_valid_video_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Retourner false si l'URL est NULL ou vide
    IF url IS NULL OR TRIM(url) = '' THEN
        RETURN FALSE;
    END IF;

    -- Vérifier si c'est une URL Azure Blob Storage valide
    IF url ~ '^https://[a-zA-Z0-9]+\.blob\.core\.windows\.net/' THEN
        RETURN TRUE;
    END IF;

    -- Vérifier si c'est une URL directe vers un fichier vidéo
    IF url ~ '^https://.*\.(mp4|webm|avi|mov|mkv)(\?.*)?$' THEN
        RETURN TRUE;
    END IF;

    -- YouTube et Vimeo ne sont plus supportés - considérer comme invalides
    -- IF url ~ '^https://(www\.)?(youtube|youtu\.be|vimeo)\.' THEN
    --     RETURN TRUE;
    -- END IF;

    -- Si aucun pattern ne correspond, considérer comme invalide
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Afficher les modules avec des URLs vidéo invalides
SELECT
    id,
    title,
    video_url,
    is_valid_video_url(video_url) as is_valid
FROM modules
WHERE video_url IS NOT NULL
  AND video_url != ''
  AND NOT is_valid_video_url(video_url);

-- Nettoyer les URLs vidéo invalides
UPDATE modules
SET video_url = NULL,
    updated_at = NOW()
WHERE video_url IS NOT NULL
  AND video_url != ''
  AND NOT is_valid_video_url(video_url);

-- Afficher le résultat
SELECT
    COUNT(*) as modules_nettoyes
FROM modules
WHERE video_url IS NULL;

-- Supprimer la fonction temporaire
DROP FUNCTION is_valid_video_url(TEXT);

COMMIT;

-- Vérifier qu'il ne reste plus d'URLs invalides
SELECT
    id,
    title,
    video_url
FROM modules
WHERE video_url IS NOT NULL
  AND video_url != '';