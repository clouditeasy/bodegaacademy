import React from 'react';
import { useState } from 'react';
import { LogOut, User, Settings, LayoutDashboard, Users, Languages } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  currentView?: string;
  onViewChange?: (view: 'dashboard' | 'admin') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { userProfile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
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
                {t('app_name')}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">{t('app_tagline')}</p>
            </div>
          </div>

          {/* Language & User Menu */}
          <div className="flex items-center gap-2">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:bg-gray-900"
              title={language === 'fr' ? 'تحويل إلى العربية' : 'Passer au français'}
            >
              <Languages className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white hidden sm:inline">
                {language === 'fr' ? 'العربية' : 'FR'}
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* User Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="font-medium text-gray-900 truncate">{userProfile?.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">{userProfile?.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {userProfile?.role === 'admin' ? t('role_admin') :
                       userProfile?.role === 'hr' ? t('role_hr') : t('role_employee')}
                    </span>
                  </div>
                  
                  {/* Admin Navigation */}
                  {userProfile?.role === 'admin' && onViewChange && (
                    <div className="border-b">
                      <button
                        onClick={() => {
                          onViewChange('admin');
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          currentView === 'admin' 
                            ? 'bg-orange-50 text-orange-800' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{t('back_office')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onViewChange('dashboard');
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          currentView === 'dashboard' 
                            ? 'bg-orange-50 text-orange-800' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{t('dashboard')}</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('logout')}</span>
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