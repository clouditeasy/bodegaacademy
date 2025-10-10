import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { MainLayout } from './components/Layout/MainLayout';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
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
    );
  }

  if (!user || !userProfile) {
    return <AuthPage />;
  }

  return (
    <LanguageProvider>
      <Router>
        <MainLayout />
      </Router>
    </LanguageProvider>
  );
}

export default App;
