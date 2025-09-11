import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { useAuth } from '../../hooks/useAuth';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    return result;
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const result = await signUp(email, password, fullName);
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
            Bodega Academy
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Forms */}
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} loading={loading} />
        ) : (
          <SignUpForm onSubmit={handleSignUp} loading={loading} />
        )}

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-900 hover:text-black font-medium"
          >
            {isLogin 
              ? "Pas encore de compte ? S'inscrire" 
              : "Déjà un compte ? Se connecter"
            }
          </button>
        </div>
      </div>
    </div>
  );
}