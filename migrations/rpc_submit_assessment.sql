-- Create RPC function to submit assessment responses
-- This function bypasses RLS and allows newly registered users to submit

CREATE OR REPLACE FUNCTION submit_onboarding_assessment(
  p_user_id UUID,
  p_assessment_id UUID,
  p_qr_code_id UUID,
  p_answers JSONB,
  p_score INTEGER,
  p_passed BOOLEAN
)
RETURNS jsonb AS $$
DECLARE
  v_response_id UUID;
  v_result jsonb;
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;

  -- Verify assessment exists
  IF NOT EXISTS (SELECT 1 FROM onboarding_assessments WHERE id = p_assessment_id) THEN
    RAISE EXCEPTION 'Assessment does not exist';
  END IF;

  -- Insert response (bypasses RLS because of SECURITY DEFINER)
  INSERT INTO onboarding_responses (
    user_id,
    assessment_id,
    qr_code_id,
    answers,
    score,
    passed
  ) VALUES (
    p_user_id,
    p_assessment_id,
    p_qr_code_id,
    p_answers,
    p_score,
    p_passed
  )
  ON CONFLICT (user_id, assessment_id)
  DO UPDATE SET
    answers = EXCLUDED.answers,
    score = EXCLUDED.score,
    passed = EXCLUDED.passed,
    completed_at = NOW()
  RETURNING id INTO v_response_id;

  -- Update user profile with assessment score
  UPDATE user_profiles
  SET
    initial_assessment_score = p_score,
    initial_assessment_completed_at = NOW(),
    has_completed_onboarding = true
  WHERE id = p_user_id;

  -- Build result
  v_result := jsonb_build_object(
    'id', v_response_id,
    'user_id', p_user_id,
    'assessment_id', p_assessment_id,
    'score', p_score,
    'passed', p_passed,
    'completed_at', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_onboarding_assessment(UUID, UUID, UUID, JSONB, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_onboarding_assessment(UUID, UUID, UUID, JSONB, INTEGER, BOOLEAN) TO anon;

-- Add comment
COMMENT ON FUNCTION submit_onboarding_assessment IS 'Submit onboarding assessment response - bypasses RLS for QR onboarding flow';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ RPC function submit_onboarding_assessment created!';
  RAISE NOTICE 'This allows users to submit assessments even with strict RLS policies.';
END $$;
