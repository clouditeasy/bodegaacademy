import { supabase, OnboardingQRCode, OnboardingAssessment, OnboardingResponse } from '../lib/supabase';

export class QROnboardingService {
  /**
   * Generate a new QR code for onboarding
   */
  static async generateQRCode(
    createdBy: string,
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      description?: string;
    }
  ): Promise<OnboardingQRCode> {
    // Generate a unique code
    const code = this.generateUniqueCode();

    // Calculate expiration if provided
    let expiresAt: string | undefined;
    if (options?.expiresInHours) {
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + options.expiresInHours);
      expiresAt = expiration.toISOString();
    }

    const { data, error } = await supabase
      .from('onboarding_qr_codes')
      .insert({
        code,
        created_by: createdBy,
        expires_at: expiresAt,
        max_uses: options?.maxUses,
        description: options?.description,
        is_active: true,
        current_uses: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Generate a unique alphanumeric code
   */
  private static generateUniqueCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}${random}`.toUpperCase();
  }

  /**
   * Get all QR codes (admin only)
   */
  static async getAllQRCodes(): Promise<OnboardingQRCode[]> {
    const { data, error } = await supabase
      .from('onboarding_qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Validate a QR code by its code string
   */
  static async validateQRCode(code: string): Promise<{
    valid: boolean;
    qrCode?: OnboardingQRCode;
    reason?: string;
  }> {
    const { data, error } = await supabase
      .from('onboarding_qr_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      return { valid: false, reason: 'Code QR invalide' };
    }

    // Check if active
    if (!data.is_active) {
      return { valid: false, reason: 'Code QR désactivé', qrCode: data };
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, reason: 'Code QR expiré', qrCode: data };
    }

    // Check max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false, reason: 'Limite d\'utilisation atteinte', qrCode: data };
    }

    return { valid: true, qrCode: data };
  }

  /**
   * Increment usage count for a QR code
   */
  static async incrementQRCodeUsage(qrCodeId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_qr_code_usage', {
      qr_code_id: qrCodeId,
    });

    if (error) throw error;
  }

  /**
   * Deactivate a QR code
   */
  static async deactivateQRCode(qrCodeId: string): Promise<void> {
    const { error } = await supabase
      .from('onboarding_qr_codes')
      .update({ is_active: false })
      .eq('id', qrCodeId);

    if (error) throw error;
  }

  /**
   * Delete a QR code
   */
  static async deleteQRCode(qrCodeId: string): Promise<void> {
    const { error } = await supabase
      .from('onboarding_qr_codes')
      .delete()
      .eq('id', qrCodeId);

    if (error) throw error;
  }

  /**
   * Get active assessment for a job role
   */
  static async getAssessmentForRole(jobRole?: string): Promise<OnboardingAssessment | null> {
    // For now, get the first active assessment
    // In the future, we can filter by job role using RPC functions
    const { data, error } = await supabase
      .from('onboarding_assessments')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  /**
   * Submit assessment response
   */
  static async submitAssessmentResponse(
    userId: string,
    assessmentId: string,
    answers: number[],
    qrCodeId?: string
  ): Promise<OnboardingResponse> {
    // Get the assessment to calculate score
    const { data: assessment, error: assessmentError } = await supabase
      .from('onboarding_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError) throw assessmentError;

    // Calculate score
    const questions = assessment.questions as any[];
    let correctAnswers = 0;

    answers.forEach((answer, index) => {
      if (questions[index] && questions[index].correct === answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= assessment.passing_score;

    // Use RPC function to bypass RLS issues
    const { data, error } = await supabase.rpc('submit_onboarding_assessment', {
      p_user_id: userId,
      p_assessment_id: assessmentId,
      p_qr_code_id: qrCodeId || null,
      p_answers: answers,
      p_score: score,
      p_passed: passed,
    });

    if (error) throw error;

    // Return the response object
    return {
      id: data.id,
      user_id: data.user_id,
      assessment_id: data.assessment_id,
      qr_code_id: qrCodeId,
      answers,
      score: data.score,
      passed: data.passed,
      completed_at: data.completed_at,
    };
  }

  /**
   * Get assessment response for a user
   */
  static async getUserAssessmentResponse(
    userId: string,
    assessmentId: string
  ): Promise<OnboardingResponse | null> {
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('assessment_id', assessmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Get all assessment responses (admin only)
   */
  static async getAllAssessmentResponses(): Promise<OnboardingResponse[]> {
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select(`
        *,
        user_profiles!onboarding_responses_user_id_fkey (
          full_name,
          email,
          job_role
        )
      `)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create or update an assessment (admin only)
   */
  static async createAssessment(
    assessment: Omit<OnboardingAssessment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<OnboardingAssessment> {
    const { data, error } = await supabase
      .from('onboarding_assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all assessments (admin only)
   */
  static async getAllAssessments(): Promise<OnboardingAssessment[]> {
    const { data, error } = await supabase
      .from('onboarding_assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update assessment status (admin only)
   */
  static async updateAssessmentStatus(
    assessmentId: string,
    isActive: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('onboarding_assessments')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', assessmentId);

    if (error) throw error;
  }
}
