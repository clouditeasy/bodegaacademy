/*
  # Créer un compte administrateur par défaut

  1. Instructions pour créer le compte admin
    - Utilisez l'interface d'inscription de l'application
    - Ou utilisez l'API Supabase Auth
    
  2. Note importante
    - Les comptes utilisateurs ne peuvent pas être créés directement via SQL
    - Ils doivent passer par l'API d'authentification Supabase
    
  3. Pour créer le compte admin@moojood.ma :
    - Allez sur votre application
    - Cliquez sur "S'inscrire"  
    - Utilisez : admin@moojood.ma / Moojood@2025!
    - Puis exécutez la requête ci-dessous pour le promouvoir admin
*/

-- Promouvoir l'utilisateur en admin une fois créé via l'interface
-- Cette requête doit être exécutée APRÈS avoir créé le compte via l'inscription
UPDATE user_profiles 
SET role = 'admin'
WHERE email = 'admin@moojood.ma';