-- Policies RLS corrigées pour Bodega Academy
-- Exécutez d'abord ce script pour supprimer les anciennes politiques qui causent la récursion

-- Supprimer toutes les politiques existantes pour éviter les conflits
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

-- Politique simple pour user_profiles (sans récursion)
-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Enable read own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Enable update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Utiliser auth.jwt() pour les vérifications de rôle admin (évite la récursion)
-- Politique pour que les admins puissent lire tous les profils
CREATE POLICY "Enable admin read all profiles" ON user_profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email' = 'admin@bodega-academy.com' OR
   (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'))
);

-- Politique pour modules - lecture des modules actifs pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read active modules" ON modules
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_active = true
);

-- Politique pour modules - les admins peuvent tout faire
CREATE POLICY "Enable admin full access modules" ON modules
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email' = 'admin@bodega-academy.com' OR
   (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'))
);

-- Politiques pour user_progress
-- Les utilisateurs peuvent gérer leur propre progression
CREATE POLICY "Enable own progress management" ON user_progress
FOR ALL USING (auth.uid() = user_id);

-- Les admins peuvent voir toutes les progressions
CREATE POLICY "Enable admin read all progress" ON user_progress
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email' = 'admin@bodega-academy.com' OR
   (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'))
);