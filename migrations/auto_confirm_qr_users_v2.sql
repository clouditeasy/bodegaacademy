-- Auto-confirm users created via QR onboarding - V2
-- This trigger automatically confirms email for users onboarded via QR
-- Fixed: confirmed_at is a generated column

-- Drop old function and trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_confirm_qr_users ON user_profiles;
DROP FUNCTION IF EXISTS auto_confirm_qr_onboarding_users();

CREATE OR REPLACE FUNCTION auto_confirm_qr_onboarding_users()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is onboarded via QR, auto-confirm their email
  IF NEW.onboarded_via_qr = true THEN
    -- Update the auth.users table to confirm email
    -- Note: confirmed_at is a generated column, so we only set email_confirmed_at
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = NEW.id
    AND email_confirmed_at IS NULL;

    RAISE NOTICE 'Auto-confirmed user % via QR onboarding', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_profiles
CREATE TRIGGER trigger_auto_confirm_qr_users
  AFTER INSERT OR UPDATE OF onboarded_via_qr ON user_profiles
  FOR EACH ROW
  WHEN (NEW.onboarded_via_qr = true)
  EXECUTE FUNCTION auto_confirm_qr_onboarding_users();

-- Test: Check if trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_confirm_qr_users';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✓ Auto-confirmation trigger V2 created!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Users onboarded via QR will be automatically email-confirmed.';
  RAISE NOTICE 'This allows them to sign in immediately after registration.';
  RAISE NOTICE '==========================================';
END $$;
