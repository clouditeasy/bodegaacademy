import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../../lib/supabase';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onBack: () => void;
  previousScore?: number;
  attempts: number;
}

export function Quiz({ questions, onComplete, onBack, previousScore, attempts }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and show results
      const correctAnswers = answers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].correct ? 1 : 0);
      }, 0);
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    onComplete(score);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const passed = score >= 80;
    const correctCount = answers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correct ? 1 : 0);
    }, 0);

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-8">
            {passed ? (
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {passed ? 'Félicitations !' : 'Quiz non validé'}
            </h2>
            
            <div className="text-4xl sm:text-6xl font-bold mb-4" style={{ 
              color: passed ? '#10b981' : '#ef4444' 
            }}>
              {score}%
            </div>
            
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Vous avez obtenu {correctCount} bonnes réponses sur {questions.length}
              {attempts > 0 && ` (Tentative ${attempts + 1})`}
            </p>

            {previousScore && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  Score précédent: {previousScore}%
                  {score > previousScore && (
                    <span className="text-green-600 ml-2">📈 Amélioration !</span>
                  )}
                </p>
              </div>
            )}

            {passed ? (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">
                  Module terminé avec succès ! Vous pouvez passer au module suivant.
                </p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <p className="text-red-800">
                  Score minimum requis: 80%. Vous pouvez refaire le quiz pour améliorer votre score.
                </p>
              </div>
            )}
          </div>

          {/* Review answers */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Correction détaillée</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correct;
                
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                        <div className="space-y-1 text-sm">
                          <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            Votre réponse: {question.options[userAnswer] || 'Aucune réponse'}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700">
                              Bonne réponse: {question.options[question.correct]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={handleFinish}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <CheckCircle className="h-4 w-4" />
              Terminer
            </button>
            
            {!passed && (
              <button
                onClick={handleRetry}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <RotateCcw className="h-4 w-4" />
                Refaire le quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour au module</span>
          <span className="sm:hidden">Retour</span>
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quiz de validation</h1>
          <span className="text-xs sm:text-sm text-gray-500">
            Question {currentQuestion + 1} sur {questions.length}
            {attempts > 0 && ` • Tentative ${attempts + 1}`}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gray-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
            {question.question}
          </h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all text-sm sm:text-base ${
                  answers[currentQuestion] === index
                    ? 'border-black bg-gray-50 text-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    answers[currentQuestion] === index
                      ? 'border-black bg-gray-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>
          
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === -1}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}