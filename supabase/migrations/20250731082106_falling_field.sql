/*
  # Promouvoir un utilisateur existant en admin

  1. Changes
    - Promouvoir ali.lotfi@moojood.ma en administrateur
    - Permettre la connexion avec les identifiants admin

  2. Alternative
    - L'utilisateur peut aussi créer le compte admin via le Dashboard Supabase
*/

-- Promouvoir ali.lotfi@moojood.ma en admin
UPDATE user_profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE email = 'ali.lotfi@moojood.ma';

-- Vérifier que la promotion a fonctionné
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE email = 'ali.lotfi@moojood.ma' AND role = 'admin'
  ) THEN
    RAISE NOTICE 'User ali.lotfi@moojood.ma has been promoted to admin successfully';
  ELSE
    RAISE NOTICE 'Failed to promote user to admin';
  END IF;
END $$;