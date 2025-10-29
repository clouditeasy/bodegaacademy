import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { MainLayout } from './components/Layout/MainLayout';
import { LanguageProvider } from './contexts/LanguageContext';
import { QROnboardingForm } from './components/Onboarding/QROnboardingForm';
import { AssessmentQuiz } from './components/Onboarding/AssessmentQuiz';
import { AssessmentResults } from './components/Onboarding/AssessmentResults';

function AppContent() {
  const location = useLocation();

  // Check if we're on a public onboarding route
  const isOnboardingRoute = location.pathname.startsWith('/onboarding/');

  const { user, userProfile, loading } = useAuth();

  // Public onboarding routes don't require authentication
  if (isOnboardingRoute) {
    return (
      <Routes>
        <Route path="/onboarding/:code" element={<QROnboardingForm />} />
        <Route path="/onboarding/:code/assessment" element={<AssessmentQuiz />} />
        <Route path="/onboarding/:code/results" element={<AssessmentResults />} />
      </Routes>
    );
  }

  return loading ? (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <img
          src="/logo-bodega.jpg"
          alt="Bodega Academy Logo"
          className="w-20 h-20 mx-auto mb-4 rounded-lg animate-pulse"
        />
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  ) : !user || !userProfile ? (
    <AuthPage />
  ) : (
    <MainLayout />
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
