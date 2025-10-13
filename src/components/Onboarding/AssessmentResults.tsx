import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

interface LocationState {
  score: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
}

export function AssessmentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.score && state?.score !== 0) {
      // If no state, redirect to home
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-4 sm:mb-6">
            <img
              src="/logo-bodega.jpg"
              alt="Bodega Academy"
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain rounded-lg"
            />
          </div>

          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-4 sm:mb-6">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Évaluation terminée !
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Bienvenue chez Bodega Academy
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 sm:py-4 rounded-xl hover:from-gray-800 hover:to-gray-700 active:from-gray-700 active:to-gray-600 transition-all font-semibold flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
        >
          <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          Accéder à mon espace de formation
        </button>
      </div>
    </div>
  );
}
