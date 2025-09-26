import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Module, UserProgress, ModuleCategory } from '../../lib/supabase';
// import { CategoryService } from '../../services/categoryService'; // No longer needed

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
  const [category, setCategory] = useState<ModuleCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const categoryModules = modules.filter(module =>
    module.training_path_id === categoryId ||
    (categoryId === 'uncategorized' && !module.training_path_id)
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
        // Charger directement depuis la table training_paths au lieu du CategoryService
        const { supabase } = await import('../../lib/supabase');
        const { data, error } = await supabase
          .from('training_paths')
          .select('*')
          .eq('id', categoryId)
          .single();

        if (error) throw error;
        setCategory(data);
      }
    } catch (error) {
      console.error('Error loading training path:', error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return <Play className="h-5 w-5 text-gray-400" />;
    } else if (progress.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getButtonText = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return 'Commencer';
    } else {
      return 'Continuer';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux parcours
        </button>

        <div className="flex items-center gap-4 mb-4">
          {category && (
            <>
              <div className="text-5xl">{category.icon}</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {category.name}
                </h1>
                <p className="text-gray-600">
                  {category.description}
                </p>
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

      {/* Modules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {categoryModules.map((module) => (
            <div key={module.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start sm:items-center gap-3 mb-2 flex-wrap">
                    {getStatusIcon(module.progress)}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 min-w-0">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">
                    {module.description}
                  </p>
                  {module.progress && module.progress.score != null && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                      <Trophy className="h-4 w-4" />
                      <span>Score: {module.progress.score}%</span>
                      {module.progress.attempts > 1 && (
                        <span>• {module.progress.attempts} tentatives</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onModuleSelect(module)}
                  className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-28"
                >
                  {module.progress?.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {getButtonText(module.progress)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {categoryModules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun module dans ce parcours
          </h3>
          <p className="text-gray-600">
            Les modules de ce parcours de formation seront bientôt disponibles.
          </p>
        </div>
      )}
    </div>
  );
}