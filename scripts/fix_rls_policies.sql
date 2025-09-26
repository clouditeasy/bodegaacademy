-- Script pour corriger les politiques RLS et résoudre les problèmes de sauvegarde
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- 1. Supprimer les politiques redondantes pour modules
DROP POLICY IF EXISTS "allow_admin_manage_modules" ON modules;
DROP POLICY IF EXISTS "allow_read_active_modules" ON modules;

-- 2. Créer ou recréer la fonction is_admin_or_hr si elle n'existe pas
CREATE OR REPLACE FUNCTION is_admin_or_hr()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    auth.email() = ANY (ARRAY['admin@bodega.ma'::text, 'stefan@bodega.ma'::text])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Simplifier les politiques modules - garder seulement les essentielles
-- Politique pour que les admins puissent tout faire
CREATE POLICY "modules_admin_full_access" ON modules
  FOR ALL
  TO public
  USING (is_admin_or_hr())
  WITH CHECK (is_admin_or_hr());

-- Politique pour que tous les utilisateurs authentifiés puissent lire les modules actifs
CREATE POLICY "modules_users_read_active" ON modules
  FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- 4. Vérifier que RLS est activé
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- 5. Nettoyer les politiques user_profiles redondantes
DROP POLICY IF EXISTS "allow_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_select_profiles" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;

-- Garder seulement les politiques admin et own pour user_profiles
-- (Les autres politiques sont conservées)

-- 6. Nettoyer les politiques user_progress redondantes
DROP POLICY IF EXISTS "allow_insert_own_progress" ON user_progress;
DROP POLICY IF EXISTS "allow_read_own_progress" ON user_progress;
DROP POLICY IF EXISTS "allow_update_own_progress" ON user_progress;

-- 7. Vérifier les permissions
GRANT USAGE ON SCHEMA public TO public;
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;

COMMIT;

-- 8. Tester les politiques
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'modules'
ORDER BY tablename, policyname;