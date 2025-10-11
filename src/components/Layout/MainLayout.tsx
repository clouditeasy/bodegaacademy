import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { EmployeeDashboard } from '../Dashboard/EmployeeDashboard';
import { AdminDashboard } from '../Admin/AdminDashboard';
import { ModulePage } from '../Module/ModulePage';
import { Module } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

type View = 'dashboard' | 'admin' | 'module';

export function MainLayout() {
  const { user, userProfile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousDashboardView, setPreviousDashboardView] = useState<'categories' | 'category' | 'modules'>('categories');
  const [previousCategoryId, setPreviousCategoryId] = useState<string>('');

  useEffect(() => {
    if (userProfile && !loading && !isInitialized) {
      // Initialiser la vue dashboard pour tous les utilisateurs par défaut
      setCurrentView('dashboard');
      setIsInitialized(true);
    }
  }, [userProfile, loading, isInitialized]);


  const handleSelectModule = (module: Module, dashboardView: 'categories' | 'category' | 'modules', categoryId: string) => {
    setSelectedModule(module);
    setCurrentView('module');
    // Sauvegarder l'état du dashboard pour le retour
    setPreviousDashboardView(dashboardView);
    setPreviousCategoryId(categoryId);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
    setCurrentView('dashboard');
    // Ne pas réinitialiser previousDashboardView et previousCategoryId pour que le dashboard revienne à la vue précédente
  };

  const handleViewChange = (view: 'dashboard' | 'admin') => {
    setCurrentView(view);
    setSelectedModule(null);
  };

  // Show loading while checking user profile or initializing
  if (loading || !currentView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Always show header */}
      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main>
        {currentView === 'dashboard' && (
          <EmployeeDashboard
            onSelectModule={handleSelectModule}
            initialView={previousDashboardView}
            initialCategoryId={previousCategoryId}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}

        {currentView === 'module' && selectedModule && (
          <ModulePage
            module={selectedModule}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}