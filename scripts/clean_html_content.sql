-- Script pour nettoyer le contenu HTML des modules
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- Fonction pour nettoyer le contenu HTML
CREATE OR REPLACE FUNCTION clean_html_content(content TEXT)
RETURNS TEXT AS $$
BEGIN
    IF content IS NULL OR TRIM(content) = '' THEN
        RETURN content;
    END IF;

    -- Nettoyer le contenu HTML
    RETURN TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(content,
                            '<p>\s*<br\s*/?>\s*</p>', '', 'gi'), -- Supprimer <p><br></p>
                        '<p><br></p>', '', 'gi'), -- Supprimer <p><br></p> exact
                    '<br\s*/?>', E'\n', 'gi'), -- Convertir <br> en retours à la ligne
                '<p>', '', 'gi'), -- Supprimer <p>
            '</p>', E'\n', 'gi') -- Convertir </p> en retours à la ligne
    );
END;
$$ LANGUAGE plpgsql;

-- Afficher les modules avec du contenu HTML problématique
SELECT
    id,
    title,
    LENGTH(content) as content_length,
    content LIKE '%<p><br></p>%' as has_empty_p_tags,
    content LIKE '%<p>%' as has_p_tags
FROM modules
WHERE content IS NOT NULL
  AND (content LIKE '%<p><br></p>%' OR content LIKE '%<br>%' OR content LIKE '%<p>%');

-- Nettoyer le contenu de tous les modules
UPDATE modules
SET content = clean_html_content(content),
    updated_at = NOW()
WHERE content IS NOT NULL
  AND (content LIKE '%<p><br></p>%' OR content LIKE '%<br>%' OR content LIKE '%<p>%');

-- Vérifier le résultat
SELECT
    id,
    title,
    LENGTH(content) as content_length_after,
    content LIKE '%<p><br></p>%' as still_has_empty_p_tags,
    content LIKE '%<p>%' as still_has_p_tags
FROM modules
WHERE content IS NOT NULL
  AND LENGTH(content) > 0;

-- Supprimer la fonction temporaire
DROP FUNCTION clean_html_content(TEXT);

COMMIT;