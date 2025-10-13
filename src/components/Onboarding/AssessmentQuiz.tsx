import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingAssessment, QuizQuestion } from '../../lib/supabase';
import { QROnboardingService } from '../../services/qrOnboardingService';

interface LocationState {
  userId: string;
  jobRole: string;
  qrCodeId?: string;
}

export function AssessmentQuiz() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<OnboardingAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!state?.userId) {
      setError('Session invalide. Veuillez recommencer le processus d\'inscription.');
      setLoading(false);
      return;
    }

    loadAssessment();
  }, [state]);

  const loadAssessment = async () => {
    try {
      const assessmentData = await QROnboardingService.getAssessmentForRole(state?.jobRole);

      if (!assessmentData) {
        setError('Aucune évaluation disponible pour le moment.');
        setLoading(false);
        return;
      }

      setAssessment(assessmentData);
      // Initialize answers array with -1 (unanswered)
      setAnswers(new Array(assessmentData.questions.length).fill(-1));
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Erreur lors du chargement de l\'évaluation');
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
      setError(err.message || 'Erreur lors de la soumission de l\'évaluation');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'évaluation...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Erreur
          </h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-3xl w-full">
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
            Évaluation initiale
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {assessment.title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} sur {assessment.questions.length}
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
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option, index) => (
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
            <span className="text-sm sm:text-base">Précédent</span>
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
                <span className="text-sm sm:text-base">Soumission...</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-base">{isLastQuestion ? 'Terminer' : 'Suivant'}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
