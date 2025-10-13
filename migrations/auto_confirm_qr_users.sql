-- Auto-confirm users created via QR onboarding
-- This trigger automatically confirms email for users onboarded via QR

CREATE OR REPLACE FUNCTION auto_confirm_qr_onboarding_users()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is onboarded via QR, auto-confirm their email
  IF NEW.onboarded_via_qr = true THEN
    -- Update the auth.users table to confirm email
    UPDATE auth.users
    SET email_confirmed_at = NOW(),
        confirmed_at = NOW()
    WHERE id = NEW.id
    AND email_confirmed_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_profiles
DROP TRIGGER IF EXISTS trigger_auto_confirm_qr_users ON user_profiles;
CREATE TRIGGER trigger_auto_confirm_qr_users
  AFTER INSERT OR UPDATE OF onboarded_via_qr ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_qr_onboarding_users();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Auto-confirmation trigger created!';
  RAISE NOTICE 'Users onboarded via QR will be automatically confirmed.';
END $$;
