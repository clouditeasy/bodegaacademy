-- Migration: QR Code Onboarding System V3 - Clean Version
-- Description: Safe migration that checks existing objects before creating
-- This version can be run multiple times safely

-- =========================================
-- STEP 1: Create Tables (if not exist)
-- =========================================

CREATE TABLE IF NOT EXISTS onboarding_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  description TEXT,
  CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE TABLE IF NOT EXISTS onboarding_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  target_roles JSONB,
  is_active BOOLEAN DEFAULT true,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES onboarding_assessments(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES onboarding_qr_codes(id) ON DELETE SET NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, assessment_id)
);

-- =========================================
-- STEP 2: Create Indexes (if not exist)
-- =========================================

CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON onboarding_qr_codes(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON onboarding_qr_codes(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_assessments_active ON onboarding_assessments(is_active);
CREATE INDEX IF NOT EXISTS idx_responses_user ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON onboarding_responses(assessment_id);

-- =========================================
-- STEP 3: Create Functions
-- =========================================

CREATE OR REPLACE FUNCTION is_qr_code_valid(qr_code_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  qr_record RECORD;
BEGIN
  SELECT is_active, expires_at, max_uses, current_uses
  INTO qr_record
  FROM onboarding_qr_codes
  WHERE id = qr_code_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF NOT qr_record.is_active THEN
    RETURN FALSE;
  END IF;

  IF qr_record.expires_at IS NOT NULL AND qr_record.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  IF qr_record.max_uses IS NOT NULL AND qr_record.current_uses >= qr_record.max_uses THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_qr_code_usage(qr_code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE onboarding_qr_codes
  SET current_uses = current_uses + 1
  WHERE id = qr_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- STEP 4: Insert Default Assessment
-- =========================================

INSERT INTO onboarding_assessments (title, description, questions, is_active, passing_score)
VALUES (
  'Évaluation initiale générale',
  'Évaluation des compétences de base pour tous les nouveaux employés',
  '[
    {
      "question": "Quelle est la priorité numéro un dans le service client ?",
      "options": [
        "Vendre le plus de produits possible",
        "Assurer la satisfaction du client",
        "Terminer les tâches rapidement",
        "Respecter les procédures strictement"
      ],
      "correct": 1
    },
    {
      "question": "Comment devez-vous réagir face à un client mécontent ?",
      "options": [
        "L''ignorer et continuer votre travail",
        "Écouter activement et chercher une solution",
        "Le diriger vers quelqu''un d''autre",
        "Lui expliquer qu''il a tort"
      ],
      "correct": 1
    },
    {
      "question": "Que signifie travailler en équipe ?",
      "options": [
        "Faire son travail sans déranger les autres",
        "Collaborer et s''entraider pour atteindre les objectifs communs",
        "Suivre les ordres du manager uniquement",
        "Compétitionner avec ses collègues"
      ],
      "correct": 1
    },
    {
      "question": "En cas de doute sur une procédure, que devez-vous faire ?",
      "options": [
        "Improviser en fonction de la situation",
        "Demander conseil à votre superviseur",
        "Faire comme bon vous semble",
        "Attendre que quelqu''un vous dise quoi faire"
      ],
      "correct": 1
    },
    {
      "question": "Quelle attitude adopter face aux règles d''hygiène et de sécurité ?",
      "options": [
        "Les respecter seulement quand le manager est présent",
        "Les appliquer rigoureusement en toute circonstance",
        "Les considérer comme des suggestions",
        "Les adapter selon les situations"
      ],
      "correct": 1
    }
  ]'::jsonb,
  true,
  70
) ON CONFLICT DO NOTHING;

-- =========================================
-- STEP 5: Enable RLS
-- =========================================

ALTER TABLE onboarding_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- =========================================
-- STEP 6: Drop and Recreate ALL Policies
-- =========================================

-- Drop ALL existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies for onboarding_qr_codes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'onboarding_qr_codes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON onboarding_qr_codes';
    END LOOP;

    -- Drop all policies for onboarding_assessments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'onboarding_assessments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON onboarding_assessments';
    END LOOP;

    -- Drop all policies for onboarding_responses
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'onboarding_responses') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON onboarding_responses';
    END LOOP;
END $$;

-- Create fresh policies for onboarding_qr_codes
CREATE POLICY "Admins can manage QR codes"
  ON onboarding_qr_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can read active QR codes"
  ON onboarding_qr_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Anonymous users can read active QR codes"
  ON onboarding_qr_codes
  FOR SELECT
  TO anon
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Create fresh policies for onboarding_assessments
CREATE POLICY "Admins can manage assessments"
  ON onboarding_assessments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can read active assessments"
  ON onboarding_assessments
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Anonymous users can read active assessments"
  ON onboarding_assessments
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Create fresh policies for onboarding_responses
CREATE POLICY "Users can insert their own responses"
  ON onboarding_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own responses"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all responses"
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

-- =========================================
-- STEP 7: Grant Permissions
-- =========================================

GRANT ALL ON onboarding_qr_codes TO authenticated;
GRANT ALL ON onboarding_assessments TO authenticated;
GRANT ALL ON onboarding_responses TO authenticated;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON onboarding_qr_codes TO anon;
GRANT SELECT ON onboarding_assessments TO anon;

GRANT EXECUTE ON FUNCTION is_qr_code_valid(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_qr_code_valid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_qr_code_usage(UUID) TO authenticated;

-- =========================================
-- STEP 8: Add Comments
-- =========================================

COMMENT ON TABLE onboarding_qr_codes IS 'QR codes generated by admins for employee onboarding';
COMMENT ON TABLE onboarding_assessments IS 'Initial skill assessment questionnaires for new employees';
COMMENT ON TABLE onboarding_responses IS 'Employee responses to initial assessments with scores';

-- =========================================
-- STEP 9: Verification
-- =========================================

DO $$
DECLARE
    qr_table_exists BOOLEAN;
    assessment_table_exists BOOLEAN;
    response_table_exists BOOLEAN;
    assessment_count INTEGER;
BEGIN
    -- Check tables
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'onboarding_qr_codes'
    ) INTO qr_table_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'onboarding_assessments'
    ) INTO assessment_table_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'onboarding_responses'
    ) INTO response_table_exists;

    -- Check assessments
    SELECT COUNT(*) INTO assessment_count
    FROM onboarding_assessments
    WHERE is_active = true;

    -- Report
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✓ QR Onboarding System V3 Migration Complete!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Tables:';
    RAISE NOTICE '  - onboarding_qr_codes: %', CASE WHEN qr_table_exists THEN '✓' ELSE '✗' END;
    RAISE NOTICE '  - onboarding_assessments: %', CASE WHEN assessment_table_exists THEN '✓' ELSE '✗' END;
    RAISE NOTICE '  - onboarding_responses: %', CASE WHEN response_table_exists THEN '✓' ELSE '✗' END;
    RAISE NOTICE 'Active assessments: %', assessment_count;
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh Supabase schema cache (Settings → API → Reload)';
    RAISE NOTICE '2. Refresh your application (F5)';
    RAISE NOTICE '3. Test creating a QR code!';
    RAISE NOTICE '==========================================';
END $$;
