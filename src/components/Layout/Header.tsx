import React from 'react';
import { useState } from 'react';
import { LogOut, User, Settings, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  currentView?: 'dashboard' | 'admin' | 'module';
  onViewChange?: (view: 'dashboard' | 'admin') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { userProfile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo à gauche */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo-bodega.jpg"
              alt="Bodega Academy Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Bodega Academy
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Plateforme de formation</p>
            </div>
          </div>

          {/* Icône utilisateur à droite */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="h-5 w-5 text-gray-600" />
            </button>

            {/* Menu déroulant */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                {/* Informations utilisateur */}
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-900 truncate">{userProfile?.full_name}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">
                    {userProfile?.role === 'admin' ? 'Administrateur' :
                     userProfile?.role === 'hr' ? 'Ressources Humaines' : 'Employé'}
                  </span>
                </div>

                {/* Navigation pour Admin/HR */}
                {(userProfile?.role === 'admin' || userProfile?.role === 'hr') && onViewChange && (
                  <>
                    <button
                      onClick={() => {
                        onViewChange('admin');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Back office</span>
                    </button>
                    <button
                      onClick={() => {
                        onViewChange('dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  </>
                )}

                {/* Déconnexion */}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}