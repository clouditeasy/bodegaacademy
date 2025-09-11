import React from 'react';
import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <img 
              src="/logo-bodega.jpg" 
              alt="Bodega Academy Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Bodega Academy
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Plateforme de formation</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium truncate max-w-32">{profile?.full_name}</span>
                <span className="px-2 py-1 bg-gray-900 text-white rounded-full text-xs font-medium whitespace-nowrap">
                  {profile?.role === 'admin' ? 'Admin' : 
                   profile?.role === 'hr' ? 'RH' : 'Employé'}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Mobile Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="font-medium text-gray-900 truncate">{profile?.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">
                      {profile?.role === 'admin' ? 'Administrateur' : 
                       profile?.role === 'hr' ? 'Ressources Humaines' : 'Employé'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}