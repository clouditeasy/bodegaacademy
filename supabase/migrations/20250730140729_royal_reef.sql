/*
  # Configuration pour compte admin automatique

  1. Fonction trigger
    - Détecte la création de admin@moojood.ma
    - Le promeut automatiquement en admin
  
  2. Sécurité
    - S'applique uniquement à cet email spécifique
    - Aucun impact sur les autres utilisateurs
*/

-- Fonction pour promouvoir automatiquement l'admin
CREATE OR REPLACE FUNCTION handle_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est l'email admin spécifique, le promouvoir automatiquement
  IF NEW.email = 'admin@moojood.ma' THEN
    NEW.role := 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute avant l'insertion dans user_profiles
DROP TRIGGER IF EXISTS promote_admin_trigger ON user_profiles;
CREATE TRIGGER promote_admin_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_promotion();