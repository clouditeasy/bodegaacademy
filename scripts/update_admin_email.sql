-- Script pour mettre à jour l'email admin et assurer les bons droits
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- 1. Mise à jour du profil admin existant s'il existe
UPDATE user_profiles
SET
    role = 'admin',
    email = 'admin@bodega.ma'
WHERE email = 'admin@bodega.ma' OR id IN (
    SELECT id FROM auth.users WHERE email = 'admin@bodega.ma'
);

-- 2. Créer le profil admin s'il n'existe pas mais que le compte auth existe
INSERT INTO user_profiles (id, email, full_name, role, has_completed_onboarding)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Administrateur'),
    'admin',
    true
FROM auth.users u
WHERE u.email = 'admin@bodega.ma'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = u.id);

-- 3. Vérification : afficher le profil admin
SELECT
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.has_completed_onboarding,
    up.created_at
FROM user_profiles up
WHERE up.email = 'admin@bodega.ma';

COMMIT;

-- Instructions :
-- 1. Copiez et collez ce script dans votre Supabase SQL editor
-- 2. Exécutez le script
-- 3. Vérifiez que l'admin apparaît avec le bon rôle
-- 4. Vous pouvez maintenant vous connecter avec admin@bodega.ma