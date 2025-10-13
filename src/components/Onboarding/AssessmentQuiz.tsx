import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Languages } from 'lucide-react';
import { OnboardingAssessment, QuizQuestion } from '../../lib/supabase';
import { QROnboardingService } from '../../services/qrOnboardingService';
import { useTranslation } from '../../hooks/useTranslation';

interface LocationState {
  userId: string;
  jobRole: string;
  qrCodeId?: string;
}

export function AssessmentQuiz() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const state = location.state as LocationState;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<OnboardingAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  useEffect(() => {
    if (!state?.userId) {
      setError(t('onboarding.invalid_session'));
      setLoading(false);
      return;
    }

    loadAssessment();
  }, [state]);

  const loadAssessment = async () => {
    try {
      const assessmentData = await QROnboardingService.getAssessmentForRole(state?.jobRole);

      if (!assessmentData) {
        setError(t('onboarding.no_assessment'));
        setLoading(false);
        return;
      }

      setAssessment(assessmentData);
      // Initialize answers array with -1 (unanswered)
      setAnswers(new Array(assessmentData.questions.length).fill(-1));
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError(t('onboarding.assessment_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    // Save the answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    // Move to next question or submit
    if (currentQuestionIndex < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(newAnswers[currentQuestionIndex + 1] >= 0 ? newAnswers[currentQuestionIndex + 1] : null);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] >= 0 ? answers[currentQuestionIndex - 1] : null);
    }
  };

  const handleSubmit = async (finalAnswers: number[]) => {
    if (!assessment || !state?.userId) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await QROnboardingService.submitAssessmentResponse(
        state.userId,
        assessment.id,
        finalAnswers,
        state.qrCodeId
      );

      // Navigate to results page
      navigate(`/onboarding/${code}/results`, {
        state: {
          score: response.score,
          passed: response.passed,
          passingScore: assessment.passing_score,
          totalQuestions: assessment.questions.length,
        },
      });
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      setError(err.message || t('onboarding.assessment_submit_error'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('onboarding.assessment_loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none active:bg-gray-900"
              title={language === 'fr' ? 'تحويل إلى العربية' : 'Passer au français'}
            >
              <Languages className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">
                {language === 'fr' ? 'العربية' : 'FR'}
              </span>
            </button>
          </div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {t('error')}
          </h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;

  // Helper functions for translation
  const getAssessmentTitle = () => {
    return language === 'ar' && assessment.title_ar ? assessment.title_ar : assessment.title;
  };

  const getQuestionText = (question: QuizQuestion) => {
    return language === 'ar' && question.question_ar ? question.question_ar : question.question;
  };

  const getOptions = (question: QuizQuestion) => {
    return language === 'ar' && question.options_ar ? question.options_ar : question.options;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-3xl w-full">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none active:bg-gray-900"
            title={language === 'fr' ? 'تحويل إلى العربية' : 'Passer au français'}
          >
            <Languages className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">
              {language === 'fr' ? 'العربية' : 'FR'}
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-4">
            <img
              src="/logo-bodega.jpg"
              alt="Bodega Academy"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto object-contain rounded-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('onboarding.initial_assessment')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {getAssessmentTitle()}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {t('onboarding.question_progress')
                .replace('{current}', (currentQuestionIndex + 1).toString())
                .replace('{total}', assessment.questions.length.toString())}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {getQuestionText(currentQuestion)}
          </h2>

          {/* Options */}
          <div className="space-y-2 sm:space-y-3">
            {getOptions(currentQuestion).map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all touch-manipulation ${
                  selectedAnswer === index
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === index
                        ? 'border-gray-900 bg-gray-900'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswer === index && (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">{t('previous')}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null || submitting}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium touch-manipulation ${
              selectedAnswer === null || submitting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base">{t('onboarding.submitting')}</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-base">{isLastQuestion ? t('finish') : t('next')}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
