-- Fix RLS policies for onboarding_responses
-- Allow newly registered users to submit their assessment responses

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can read their own responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Admins can read all responses" ON onboarding_responses;

-- Create more permissive INSERT policy for authenticated users
-- This allows any authenticated user to insert their own response
CREATE POLICY "Authenticated users can insert their own responses"
  ON onboarding_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Allow users to read their own responses
CREATE POLICY "Users can read their own responses"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to read all responses
CREATE POLICY "Admins can read all responses"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'hr')
    )
  );

-- Verify the policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'onboarding_responses'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ RLS policies for onboarding_responses updated successfully!';
    RAISE NOTICE 'Authenticated users can now submit their assessment responses.';
END $$;
