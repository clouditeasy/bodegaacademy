/*
  # Promote Stefan to Admin

  1. Changes
    - Promote `stefan@moojood.ma` from employee to admin role
    - Update the updated_at timestamp

  This will give Stefan full administrative privileges in the platform.
*/

-- Promote Stefan to admin
UPDATE user_profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE email = 'stefan@moojood.ma';