-- Version simplifiée - Structure des tables seulement
-- À exécuter dans votre Supabase SQL editor

-- Structure de la table modules
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'modules'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Structure de la table user_profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Structure de la table user_progress
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Lister toutes les tables existantes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
ORDER BY table_name;