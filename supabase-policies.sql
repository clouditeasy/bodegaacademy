-- Policies RLS pour Bodega Academy
-- Exécutez ce script dans votre console Supabase (SQL Editor)

-- 1. Politique pour la lecture des modules (tous les utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to read active modules" ON modules
FOR SELECT USING (
  auth.role() = 'authenticated' AND is_active = true
);

-- 2. Politique pour que les admins puissent lire tous les modules
CREATE POLICY "Allow admins to read all modules" ON modules
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Politique pour que les admins puissent créer des modules
CREATE POLICY "Allow admins to insert modules" ON modules
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) AND
  created_by = auth.uid()
);

-- 4. Politique pour que les admins puissent modifier des modules
CREATE POLICY "Allow admins to update modules" ON modules
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Politique pour que les admins puissent supprimer des modules
CREATE POLICY "Allow admins to delete modules" ON modules
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Politiques pour user_profiles
-- 6. Permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can read own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- 7. Permettre aux admins de lire tous les profils
CREATE POLICY "Admins can read all profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 8. Permettre aux admins de modifier les profils
CREATE POLICY "Admins can update profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Politiques pour user_progress
-- 9. Les utilisateurs peuvent lire leur propre progression
CREATE POLICY "Users can read own progress" ON user_progress
FOR SELECT USING (auth.uid() = user_id);

-- 10. Les utilisateurs peuvent insérer/mettre à jour leur propre progression
CREATE POLICY "Users can insert own progress" ON user_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. Les admins peuvent lire toutes les progressions
CREATE POLICY "Admins can read all progress" ON user_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);