import React from 'react';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { Module, UserProgress } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface ModuleWithProgress extends Module {
  progress?: UserProgress;
  isLocked?: boolean;
}

interface PathProgressIndicatorProps {
  modules: ModuleWithProgress[];
  userId: string;
}

export function PathProgressIndicator({ modules, userId }: PathProgressIndicatorProps) {
  const { t, language } = useLanguage();
  // NO SORTING - order comes from database
  const completedCount = modules.filter(m => m.progress?.status === 'completed').length;
  const totalCount = modules.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getModuleIcon = (module: ModuleWithProgress) => {
    if (module.progress?.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-white" />;
    } else {
      return <Circle className="h-5 w-5 text-white" />;
    }
  };

  const getModuleStatus = (module: ModuleWithProgress) => {
    if (module.isLocked) {
      return 'locked';
    } else if (module.progress?.status === 'completed') {
      return 'completed';
    } else if (module.progress?.status === 'in_progress') {
      return 'in_progress';
    } else {
      return 'available';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('path_progress')}
        </h3>
        <span className="text-sm font-medium text-gray-600">
          {completedCount}/{totalCount} {t('modules')}
        </span>
      </div>

      {/* Barre de progression globale */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Timeline des modules */}
      <div className="space-y-3">
        {modules.map((module, index) => {
          const status = getModuleStatus(module);

          return (
            <div key={module.id} className="flex items-center gap-3">
              {/* Numéro et icône */}
              <div className="flex-shrink-0 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    status === 'locked'
                      ? 'bg-gray-400 text-white'
                      : status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'in_progress'
                      ? 'bg-gray-900 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {status === 'locked' ? (
                    <Lock className="h-5 w-5" />
                  ) : status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Ligne de connexion */}
                {index < modules.length - 1 && (
                  <div
                    className={`absolute left-1/2 -bottom-3 w-0.5 h-3 -translate-x-1/2 ${
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>

              {/* Titre et info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate text-gray-900">
                  {getTranslatedField(module, 'title', language)}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {status === 'locked' && (
                    <span className="text-xs text-gray-900 font-medium">{t('locked')}</span>
                  )}
                  {status === 'completed' && module.progress?.score != null && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ {module.progress.score}%
                    </span>
                  )}
                  {status === 'in_progress' && (
                    <span className="text-xs text-gray-900 font-medium">{t('in_progress')}</span>
                  )}
                  {status === 'available' && (
                    <span className="text-xs text-gray-900 font-medium">{t('available')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message de motivation */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium text-center">
            🎉 {t('congratulations')} ! {t('path_completed')}
          </p>
        </div>
      )}

      {completedCount < totalCount && totalCount > 0 && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            {t('continue_progress')} {totalCount - completedCount} {t('remaining_modules')}.
          </p>
        </div>
      )}
    </div>
  );
}
