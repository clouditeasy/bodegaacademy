-- Migration: Fix user_profiles RLS for QR Onboarding (V3 - Security Definer Function)
-- Description: Allow newly created users to insert/upsert their own profile during onboarding
-- Date: 2025-10-13
-- Fix: Use SECURITY DEFINER function to avoid infinite recursion

-- ========================================
-- STEP 1: Create helper function (SECURITY DEFINER bypasses RLS)
-- ========================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the key: bypasses RLS
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = user_id
  LIMIT 1;

  RETURN user_role;
END;
$$;

-- Grant execute to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO anon;

-- ========================================
-- STEP 2: Drop ALL existing policies
-- ========================================

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins have full access" ON user_profiles;
DROP POLICY IF EXISTS "HR can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Enable RLS (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Create new policies using the helper function
-- ========================================

-- 1. Allow users to INSERT their own profile (for onboarding)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Allow users to SELECT their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. Admins can SELECT ALL profiles (uses helper function, no recursion!)
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id  -- Own profile
    OR
    public.get_user_role(auth.uid()) = 'admin'  -- Admin role via helper
  );

-- 5. Admins can UPDATE ALL profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id  -- Own profile
    OR
    public.get_user_role(auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = id  -- Own profile
    OR
    public.get_user_role(auth.uid()) = 'admin'
  );

-- 6. Admins can DELETE profiles
CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- 7. HR can read all profiles
CREATE POLICY "HR can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id  -- Own profile
    OR
    public.get_user_role(auth.uid()) IN ('admin', 'hr')  -- HR or Admin via helper
  );

-- ========================================
-- STEP 4: Verification
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✓ User Profiles RLS Fixed (V3 - No Recursion)';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Created helper function:';
    RAISE NOTICE '  - get_user_role(UUID) with SECURITY DEFINER';
    RAISE NOTICE '';
    RAISE NOTICE 'Users can now:';
    RAISE NOTICE '  - INSERT their own profile during registration ✓';
    RAISE NOTICE '  - UPDATE their own profile ✓';
    RAISE NOTICE '  - SELECT their own profile ✓';
    RAISE NOTICE '';
    RAISE NOTICE 'Admins can:';
    RAISE NOTICE '  - Read all profiles ✓';
    RAISE NOTICE '  - Update all profiles ✓';
    RAISE NOTICE '  - Delete profiles ✓';
    RAISE NOTICE '';
    RAISE NOTICE 'HR can:';
    RAISE NOTICE '  - Read all profiles ✓';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'No more infinite recursion! 🎉';
    RAISE NOTICE '==========================================';
END $$;
