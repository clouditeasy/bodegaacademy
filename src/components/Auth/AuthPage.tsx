import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 mx-3">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo-bodega.jpg"
            alt="Bodega Academy Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t('app_name')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Login Form */}
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
}