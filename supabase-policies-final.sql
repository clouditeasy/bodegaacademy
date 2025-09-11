-- Policies RLS corrigées pour Bodega Academy
-- Script final avec syntaxe PostgreSQL correcte

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow authenticated users to read active modules" ON modules;
DROP POLICY IF EXISTS "Allow admins to read all modules" ON modules;
DROP POLICY IF EXISTS "Allow admins to insert modules" ON modules;
DROP POLICY IF EXISTS "Allow admins to update modules" ON modules;
DROP POLICY IF EXISTS "Allow admins to delete modules" ON modules;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Admins can read all progress" ON user_progress;
DROP POLICY IF EXISTS "Enable read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable admin read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read active modules" ON modules;
DROP POLICY IF EXISTS "Enable admin full access modules" ON modules;
DROP POLICY IF EXISTS "Enable own progress management" ON user_progress;
DROP POLICY IF EXISTS "Enable admin read all progress" ON user_progress;

-- Politiques pour user_profiles (simples, sans récursion)
CREATE POLICY "user_profiles_select_own" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Politique pour les admins spécifiques (basée sur l'email)
CREATE POLICY "user_profiles_admin_select" ON user_profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);

CREATE POLICY "user_profiles_admin_update" ON user_profiles
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);

CREATE POLICY "user_profiles_admin_insert" ON user_profiles
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);

-- Politiques pour modules
-- Lecture des modules actifs pour tous
CREATE POLICY "modules_select_active" ON modules
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_active = true
);

-- Admins peuvent tout faire sur les modules
CREATE POLICY "modules_admin_select" ON modules
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);

CREATE POLICY "modules_admin_insert" ON modules
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma') AND
  created_by = auth.uid()
);

CREATE POLICY "modules_admin_update" ON modules
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);

CREATE POLICY "modules_admin_delete" ON modules
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);

-- Politiques pour user_progress
CREATE POLICY "user_progress_select_own" ON user_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own" ON user_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own" ON user_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Admins peuvent voir toutes les progressions
CREATE POLICY "user_progress_admin_select" ON user_progress
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  auth.email() IN ('admin@bodega.ma', 'stefan@bodega.ma')
);