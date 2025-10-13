-- Fix RLS policies for onboarding_responses table to allow admins to read all responses

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to read all responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Allow users to read own responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Allow system to insert responses" ON onboarding_responses;

-- Enable RLS
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all responses
CREATE POLICY "Admins can read all onboarding responses"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy for users to read their own responses
CREATE POLICY "Users can read own onboarding responses"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for inserting responses (for the RPC function)
CREATE POLICY "Allow authenticated users to insert responses"
  ON onboarding_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for updating responses (for the RPC function)
CREATE POLICY "Allow authenticated users to update own responses"
  ON onboarding_responses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ RLS policies for onboarding_responses updated!';
  RAISE NOTICE '  - Admins can now read all onboarding responses';
  RAISE NOTICE '  - Users can read their own responses';
  RAISE NOTICE '  - INSERT and UPDATE policies configured';
END $$;
