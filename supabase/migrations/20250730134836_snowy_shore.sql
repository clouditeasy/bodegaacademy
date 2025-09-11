/*
  # Fix RLS infinite recursion error

  1. Problem
    - The "Admins can read all profiles" policy creates infinite recursion
    - It queries user_profiles table within a policy ON user_profiles table
    
  2. Solution
    - Drop the problematic policy
    - Create simpler, non-recursive policies
    - Use direct auth.uid() comparisons instead of subqueries to same table
    
  3. Security
    - Users can read and update their own profile
    - Admins/HR will need to use service role for admin operations
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- For admin operations, we'll handle permissions at the application level
-- or use the service role key for admin dashboard queries