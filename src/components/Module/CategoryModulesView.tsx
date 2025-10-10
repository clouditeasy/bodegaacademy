import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, Trophy, Lock } from 'lucide-react';
import { Module, UserProgress, ModuleCategory } from '../../lib/supabase';
import { CategoryService } from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { PathProgressIndicator } from './PathProgressIndicator';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface ModuleWithProgress extends Module {
  progress?: UserProgress;
}

interface CategoryModulesViewProps {
  categoryId: string;
  modules: ModuleWithProgress[];
  onBack: () => void;
  onModuleSelect: (module: Module) => void;
}

export function CategoryModulesView({
  categoryId,
  modules,
  onBack,
  onModuleSelect
}: CategoryModulesViewProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [category, setCategory] = useState<ModuleCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter modules - DO NOT SORT, order comes from database
  const categoryModules = modules
    .filter(module => {
      // Support both old 'module_category' and new 'training_path_id' fields
      const modulePathId = module.training_path_id || module.module_category;
      const isUncategorized = !modulePathId;

      return modulePathId === categoryId ||
        (categoryId === 'uncategorized' && isUncategorized);
    });

  // Get module access status from database
  const { isModuleLocked, loading: accessLoading } = useModuleAccess(
    user?.id || '',
    categoryId
  );

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      if (categoryId === 'uncategorized') {
        setCategory(null);
      } else {
        const categoryData = await CategoryService.getCategoryById(categoryId);
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (moduleId: string, progress?: UserProgress) => {
    const locked = isModuleLocked(moduleId);

    if (locked) {
      return <Lock className="h-5 w-5 text-gray-400" />;
    } else if (!progress || progress.status === 'not_started') {
      return <Play className="h-5 w-5 text-gray-400" />;
    } else if (progress.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-900" />;
    }
  };

  const getButtonText = (moduleId: string, progress?: UserProgress) => {
    const locked = isModuleLocked(moduleId);

    if (locked) {
      return t('locked');
    } else if (!progress || progress.status === 'not_started') {
      return t('start');
    } else if (progress.status === 'completed') {
      return t('restart');
    } else {
      return t('continue');
    }
  };

  const handleModuleClick = (module: Module) => {
    const locked = isModuleLocked(module.id);
    if (!locked) {
      onModuleSelect(module);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-4 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('back_to_dashboard')}
        </button>

        <div className="flex items-center gap-4 mb-4">
          {category && (
            <>
              <div className="text-5xl">{category.icon}</div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {getTranslatedField(category, 'name', language)}
                </h1>
                <div
                  className="text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: getTranslatedField(category, 'description', language) }}
                />
              </div>
            </>
          )}
          {!category && categoryId === 'uncategorized' && (
            <>
              <div className="text-5xl">📚</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Autres Modules
                </h1>
                <p className="text-gray-600">
                  Modules non catégorisés
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {category && (
            <div className={`px-3 py-1 rounded-full text-white text-sm ${category.color}`}>
              {categoryModules.length} modules
            </div>
          )}
        </div>
      </div>

      {/* Path Progress Indicator */}
      {categoryModules.length > 0 && (
        <PathProgressIndicator
          modules={categoryModules.map(m => ({
            ...m,
            isLocked: isModuleLocked(m.id)
          }))}
          userId={user?.id || ''}
        />
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categoryModules.map((module) => {
          const locked = isModuleLocked(module.id);

          return (
            <div
              key={module.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col ${
                locked ? 'opacity-75' : ''
              }`}
            >
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                <div className="flex items-start gap-3 mb-3">
                  {getStatusIcon(module.id, module.progress)}
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1">
                    {getTranslatedField(module, 'title', language)}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {getTranslatedField(module, 'description', language)}
                </p>

                {module.progress && module.progress.score != null && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Trophy className="h-4 w-4" />
                    <span>Score: {module.progress.score}%</span>
                  </div>
                )}

                {/* Spacer pour pousser le bouton en bas */}
                <div className="flex-1"></div>

                <button
                  onClick={() => handleModuleClick(module)}
                  disabled={locked}
                  className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 sm:w-[160px] ${
                    locked
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : module.progress?.status === 'completed'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {locked ? (
                    <Lock className="h-4 w-4" />
                  ) : module.progress?.status === 'completed' ? null : (
                    module.progress?.status === 'in_progress' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )
                  )}
                  {getButtonText(module.id, module.progress)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {categoryModules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-500">Aucun module dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}
