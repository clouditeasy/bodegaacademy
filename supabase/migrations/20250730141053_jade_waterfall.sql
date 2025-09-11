/*
  # Ensure Admin Account Creation

  1. Updates
    - Update the trigger function to automatically promote admin@moojood.ma to admin role
    - Ensure the admin account gets proper permissions

  2. Security
    - Maintains existing RLS policies
    - Admin account will have admin privileges automatically
*/

-- Update the trigger function to handle admin promotion
CREATE OR REPLACE FUNCTION handle_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is the admin email
  IF NEW.email = 'admin@moojood.ma' THEN
    NEW.role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS promote_admin_trigger ON user_profiles;
CREATE TRIGGER promote_admin_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_promotion();

-- If there's already a user with admin@moojood.ma, promote them to admin
UPDATE user_profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'admin@moojood.ma' AND role != 'admin';