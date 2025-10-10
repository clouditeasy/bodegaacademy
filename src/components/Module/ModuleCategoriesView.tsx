import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Module, ModuleCategory } from '../../lib/supabase';
import { CategoryService } from '../../services/categoryService';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface ModuleCategoriesViewProps {
  modules: Module[];
  onCategorySelect: (categoryId: string) => void;
  onModuleSelect: (module: Module) => void;
}

export function ModuleCategoriesView({ modules, onCategorySelect, onModuleSelect }: ModuleCategoriesViewProps) {
  const { t, language } = useLanguage();
  const [categoriesWithCount, setCategoriesWithCount] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoriesWithCounts();
  }, [modules]);

  const loadCategoriesWithCounts = async () => {
    try {
      setLoading(true);
      
      // Load categories from database
      const dbCategories = await CategoryService.getAllCategories();
      
      // Count modules per category
      const categoryCount: Record<string, number> = {};
      
      modules.forEach(module => {
        const categoryId = module.training_path_id || 'uncategorized';
        categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
      });

      // Create categories with counts
      const categoriesWithCounts = dbCategories.map(category => ({
        ...category,
        moduleCount: categoryCount[category.id] || 0
      }));

      // Add uncategorized modules if they exist
      if (categoryCount.uncategorized > 0) {
        categoriesWithCounts.push({
          id: 'uncategorized',
          name: 'Autres Modules',
          description: 'Modules non catégorisés',
          color: 'bg-gray-500',
          icon: '📚',
          order_index: 999,
          moduleCount: categoryCount.uncategorized,
          is_active: true,
          created_at: '',
          updated_at: ''
        });
      }

      setCategoriesWithCount(categoriesWithCounts.filter(cat => cat.moduleCount > 0));
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback: show uncategorized if there are modules
      if (modules.length > 0) {
        setCategoriesWithCount([{
          id: 'uncategorized',
          name: 'Tous les Modules',
          description: 'Modules disponibles',
          color: 'bg-gray-500',
          icon: '📚',
          order_index: 1,
          moduleCount: modules.length,
          is_active: true,
          created_at: '',
          updated_at: ''
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-0">
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithCount.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
          >
            <div className={`${category.color} h-2 rounded-t-lg`}></div>

            <div className="p-6 flex flex-col flex-1">
              {/* En-tête avec icône et nombre de modules */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl flex-shrink-0">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                    {getTranslatedField(category, 'name', language)}
                  </h3>
                </div>
              </div>

              {/* Footer - aligné en bas */}
              <div className="flex items-center justify-between mt-auto">
                <div className={`px-3 py-1 rounded-full text-white text-sm ${category.color}`}>
                  {category.moduleCount} {t('modules')}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categoriesWithCount.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('no_modules_available')}
          </h3>
          <p className="text-gray-600">
            {t('modules_coming_soon')}
          </p>
        </div>
      )}
    </div>
  );
}