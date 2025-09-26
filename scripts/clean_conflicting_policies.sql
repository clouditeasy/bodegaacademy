-- Script pour nettoyer les politiques RLS conflictuelles
-- À exécuter dans votre Supabase SQL editor

BEGIN;

-- 1. Supprimer TOUTES les politiques redondantes qui créent des conflits
-- Garder seulement modules_admin_full_access et modules_users_read_active

DROP POLICY IF EXISTS "modules_admin_delete" ON modules;
DROP POLICY IF EXISTS "modules_admin_insert" ON modules;
DROP POLICY IF EXISTS "modules_admin_select" ON modules;
DROP POLICY IF EXISTS "modules_admin_update" ON modules;
DROP POLICY IF EXISTS "modules_select_active" ON modules;

-- 2. Vérifier que les bonnes politiques existent
-- Si modules_admin_full_access n'existe pas, la créer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'modules'
        AND policyname = 'modules_admin_full_access'
    ) THEN
        CREATE POLICY "modules_admin_full_access" ON modules
          FOR ALL
          TO public
          USING (is_admin_or_hr())
          WITH CHECK (is_admin_or_hr());
    END IF;
END $$;

-- 3. Vérifier que la politique de lecture existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'modules'
        AND policyname = 'modules_users_read_active'
    ) THEN
        CREATE POLICY "modules_users_read_active" ON modules
          FOR SELECT
          TO public
          USING (auth.uid() IS NOT NULL AND is_active = true);
    END IF;
END $$;

-- 4. S'assurer que la fonction is_admin_or_hr existe
CREATE OR REPLACE FUNCTION is_admin_or_hr()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    auth.email() = ANY (ARRAY['admin@bodega.ma'::text, 'stefan@bodega.ma'::text])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- 5. Vérifier le résultat final
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'modules'
ORDER BY policyname;