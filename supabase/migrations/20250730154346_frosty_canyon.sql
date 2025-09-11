/*
  # Correction de la fonction de promotion admin

  1. Mise à jour de la fonction handle_admin_promotion()
     - Promotion automatique pour admin@moojood.ma
     - Mise à jour des comptes existants

  2. Vérifications
     - S'assurer que le trigger fonctionne
     - Promouvoir les comptes existants si nécessaire
*/

-- Mettre à jour la fonction de promotion admin
CREATE OR REPLACE FUNCTION handle_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Promouvoir automatiquement admin@moojood.ma en admin
  IF NEW.email = 'admin@moojood.ma' THEN
    NEW.role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS promote_admin_trigger ON user_profiles;
CREATE TRIGGER promote_admin_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_promotion();

-- Mettre à jour tout compte existant avec admin@moojood.ma
UPDATE user_profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'admin@moojood.ma' AND role != 'admin';