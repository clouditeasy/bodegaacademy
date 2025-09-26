import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, AlertCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { TrainingPathQuiz, TrainingPathProgress } from '../../lib/supabase';
import { TrainingPathService } from '../../services/trainingPathService';
import { useAuth } from '../../hooks/useAuth';

interface TrainingPathQuizProps {
  trainingPathId: string;
  trainingPathName: string;
  onBack: () => void;
  onComplete: () => void;
}

export function TrainingPathQuiz({ trainingPathId, trainingPathName, onBack, onComplete }: TrainingPathQuizProps) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<TrainingPathQuiz | null>(null);
  const [progress, setProgress] = useState<TrainingPathProgress | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadQuizData();
    }
  }, [trainingPathId, user?.id]);

  const loadQuizData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Charger le quiz et les progrès en parallèle
      const [quizData, progressData] = await Promise.all([
        TrainingPathService.getTrainingPathQuiz(trainingPathId),
        TrainingPathService.getUserTrainingPathProgress(user.id, trainingPathId)
      ]);

      setQuiz(quizData);
      setProgress(progressData);

      // Vérifier si l'utilisateur a déjà terminé tous les modules
      const completedAllModules = await TrainingPathService.hasUserCompletedAllModules(user.id, trainingPathId);

      if (!completedAllModules) {
        setError('Vous devez terminer tous les modules du parcours avant de passer le quiz final.');
        return;
      }

      // Initialiser les réponses
      if (quizData) {
        setAnswers(new Array(quizData.questions.length).fill(-1));
      }

    } catch (err) {
      console.error('Error loading quiz data:', err);
      setError('Erreur lors du chargement du quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !quiz) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(newAnswers[currentQuestionIndex + 1] !== -1 ? newAnswers[currentQuestionIndex + 1] : null);
    } else {
      // Dernière question, calculer le score
      calculateScore(newAnswers);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] !== -1 ? answers[currentQuestionIndex - 1] : null);
    }
  };

  const calculateScore = (finalAnswers: number[]) => {
    if (!quiz) return;

    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correct) {
        correct++;
      }
    });

    const percentage = Math.round((correct / quiz.questions.length) * 100);
    setScore(percentage);
    setShowResults(true);
  };

  const handleSubmitQuiz = async () => {
    if (!user?.id || !quiz) return;

    try {
      setSubmitting(true);
      setError(null);

      await TrainingPathService.submitTrainingPathQuiz(user.id, trainingPathId, answers, score);

      if (score >= quiz.passing_score) {
        onComplete();
      }

      // Recharger les données de progrès
      const updatedProgress = await TrainingPathService.getUserTrainingPathProgress(user.id, trainingPathId);
      setProgress(updatedProgress);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Erreur lors de la soumission du quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    if (!quiz) return;

    setCurrentQuestionIndex(0);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setSelectedAnswer(null);
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au parcours
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Accès non autorisé</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au parcours
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Quiz non disponible</h3>
              <p className="text-yellow-700">Le quiz final pour ce parcours n'est pas encore configuré.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const canProceed = selectedAnswer !== null;
  const passed = score >= quiz.passing_score;
  const attemptsRemaining = Math.max(0, quiz.max_attempts - (progress?.quiz_attempts || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au parcours
      </button>

      {showResults ? (
        /* Results View */
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-4">
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Félicitations !' : 'Quiz non réussi'}
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              {passed
                ? `Vous avez terminé avec succès le parcours "${trainingPathName}"`
                : `Vous avez obtenu ${score}% (minimum requis: ${quiz.passing_score}%)`
              }
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{score}%</div>
                  <div className="text-sm text-gray-600">Score obtenu</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{quiz.passing_score}%</div>
                  <div className="text-sm text-gray-600">Score requis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{progress?.quiz_attempts || 0}/{quiz.max_attempts}</div>
                  <div className="text-sm text-gray-600">Tentatives</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {passed ? (
                <button
                  onClick={onComplete}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Trophy className="h-5 w-5" />
                  Terminer le parcours
                </button>
              ) : attemptsRemaining > 0 ? (
                <button
                  onClick={handleRetryQuiz}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Recommencer ({attemptsRemaining} tentative{attemptsRemaining > 1 ? 's' : ''} restante{attemptsRemaining > 1 ? 's' : ''})
                </button>
              ) : (
                <div className="text-red-600 font-medium">
                  Nombre maximum de tentatives atteint
                </div>
              )}

              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Sauvegarde...' : 'Sauvegarder le résultat'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz View */
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
              <span className="text-sm text-gray-500">
                Tentative {(progress?.quiz_attempts || 0) + 1}/{quiz.max_attempts}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAnswer === index
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>

            <div className="flex items-center gap-2">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-500'
                      : answers[index] !== -1
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={!canProceed}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLastQuestion ? 'Terminer' : 'Suivant'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Quiz final du parcours :</p>
            <p>
              Vous devez obtenir au moins {quiz.passing_score}% pour valider ce parcours de formation.
              Vous avez {quiz.max_attempts} tentative{quiz.max_attempts > 1 ? 's' : ''} maximum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}