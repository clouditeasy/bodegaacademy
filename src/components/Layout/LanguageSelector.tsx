import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'onboarding';
}

export function LanguageSelector({ className = '', variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  const isOnboarding = variant === 'onboarding';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className={`${isOnboarding ? 'h-4 w-4' : 'h-5 w-5'} text-gray-600`} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'fr' | 'ar')}
        className={`
          ${isOnboarding
            ? 'px-3 py-1.5 text-sm'
            : 'px-4 py-2 text-base'
          }
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-orange-500 focus:border-transparent
          bg-white cursor-pointer
          transition-all
        `}
      >
        <option value="fr">🇫🇷 Français</option>
        <option value="ar">🇲🇦 العربية</option>
      </select>
    </div>
  );
}
