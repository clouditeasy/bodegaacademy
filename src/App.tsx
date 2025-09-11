import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { Header } from './components/Layout/Header';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ModulePage } from './components/Module/ModulePage';
import { Module } from './lib/supabase';

function App() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'module'>('dashboard');
  const [selectedModule, setSelectedModule] = React.useState<Module | null>(null);

  const handleSelectModule = (module: Module) => {
    setSelectedModule(module);
    setCurrentView('module');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedModule(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo-bodega.jpg" 
            alt="Bodega Academy Logo" 
            className="w-20 h-20 mx-auto mb-4 rounded-lg animate-pulse"
          />
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        {currentView === 'module' && selectedModule ? (
          <ModulePage 
            module={selectedModule} 
            onBack={handleBackToDashboard}
          />
        ) : profile.role === 'admin' || profile.role === 'hr' ? (
          <AdminDashboard />
        ) : (
          <EmployeeDashboard onSelectModule={handleSelectModule} />
        )}
      </div>
    </Router>
  );
}

export default App;
