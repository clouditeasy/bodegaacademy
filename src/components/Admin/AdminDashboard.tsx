import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, BookOpen, TrendingUp, BarChart3, Settings, UserCheck, Database, Grid3X3 } from 'lucide-react';
import { supabase, Module, TrainingPath } from '../../lib/supabase';
import { ModuleForm } from './ModuleForm';
import { ProgressTracking } from './ProgressTracking';
import { UserManagement } from './UserManagement';
import { Analytics } from './Analytics';
import { SystemSettings } from './SystemSettings';
import { DatabaseMigration } from './DatabaseMigration';
import { CategoryManagement } from './CategoryManagement';
import { CategoryService } from '../../services/categoryService';

export function AdminDashboard() {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<TrainingPath[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentView, setCurrentView] = useState<'modules' | 'progress' | 'form' | 'users' | 'analytics' | 'settings' | 'training-paths'>('modules');
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [stats, setStats] = useState({
    totalModules: 0,
    totalUsers: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
    fetchStats();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Log pour déboguer les catégories manquantes
      const modulesWithoutCategory = (data || []).filter(m => !m.training_path_id);
      if (modulesWithoutCategory.length > 0) {
        console.log(`${modulesWithoutCategory.length} modules sans parcours trouvés:`,
          modulesWithoutCategory.map(m => ({ id: m.id, title: m.title, training_path_id: m.training_path_id }))
        );
      }

      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Count modules
      const { count: moduleCount } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true });

      // Count users
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate completion rate
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('status');

      const completions = progressData?.filter(p => p.status === 'completed').length || 0;
      const total = progressData?.length || 0;
      const completionRate = total > 0 ? Math.round((completions / total) * 100) : 0;

      setStats({
        totalModules: moduleCount || 0,
        totalUsers: userCount || 0,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      
      setModules(modules.filter(m => m.id !== moduleId));
      fetchStats();
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const handleToggleActive = async (moduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ is_active: !isActive })
        .eq('id', moduleId);

      if (error) throw error;
      
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, is_active: !isActive } : m
      ));
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const handleModuleSaved = () => {
    setCurrentView('modules');
    setEditingModule(null);
    fetchModules();
    fetchStats();
  };


  // Filtrer les modules par catégorie
  const filteredModules = selectedCategory
    ? modules.filter(module => module.training_path_id === selectedCategory)
    : modules;

  // Grouper les modules par catégorie pour l'affichage
  const groupedModules = modules.reduce((acc, module) => {
    const categoryId = module.training_path_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  // Obtenir le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'uncategorized') return 'Sans catégorie';
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Catégorie inconnue';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'form') {
    return (
      <ModuleForm
        module={editingModule}
        onSave={handleModuleSaved}
        onCancel={() => {
          setCurrentView('modules');
          setEditingModule(null);
        }}
      />
    );
  }

  if (currentView === 'progress') {
    return (
      <ProgressTracking onBack={() => setCurrentView('modules')} />
    );
  }

  if (currentView === 'users') {
    return (
      <UserManagement onBack={() => setCurrentView('modules')} />
    );
  }

  if (currentView === 'analytics') {
    return (
      <Analytics onBack={() => setCurrentView('modules')} />
    );
  }

  if (currentView === 'settings') {
    return (
      <SystemSettings onBack={() => setCurrentView('modules')} />
    );
  }


  if (currentView === 'training-paths') {
    return (
      <CategoryManagement onBack={() => setCurrentView('modules')} />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setCurrentView('progress')}
            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Suivi des progressions</span>
            <span className="sm:hidden">Suivi</span>
          </button>
          <button
            onClick={() => setCurrentView('users')}
            className="bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <UserCheck className="h-4 w-4" />
            Utilisateurs
          </button>
          <button
            onClick={() => setCurrentView('analytics')}
            className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </button>
          <button
            onClick={() => setCurrentView('training-paths')}
            className="bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <Grid3X3 className="h-4 w-4" />
            Parcours
          </button>
          <button
            onClick={() => {
              setEditingModule(null);
              setCurrentView('form');
            }}
            className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau module</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Modules</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Utilisateurs</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 col-span-1 sm:col-span-3 lg:col-span-1">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Taux de réussite</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Modules de formation</h2>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
                Catégorie:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
                <option value="uncategorized">Sans catégorie</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredModules.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              {selectedCategory
                ? 'Aucun module dans cette catégorie'
                : 'Aucun module créé pour le moment'
              }
            </p>
            {!selectedCategory && (
              <button
                onClick={() => {
                  setEditingModule(null);
                  setCurrentView('form');
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                Créer le premier module
              </button>
            )}
          </div>
        ) : selectedCategory ? (
          // Vue filtrée par catégorie
          <div className="divide-y">
            {filteredModules.map((module) => (
              <div key={module.id} className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start sm:items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 min-w-0">
                        {module.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{module.description}</p>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                      <span>{module.quiz_questions.length} questions</span>
                      <span>Créé le {new Date(module.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:ml-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      module.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {module.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <button
                      onClick={() => handleToggleActive(module.id, module.is_active)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                        module.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {module.is_active ? 'Désactiver' : 'Activer'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingModule(module);
                        setCurrentView('form');
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vue groupée par catégories
          <div>
            {Object.entries(groupedModules).map(([categoryId, categoryModules]) => (
              <div key={categoryId} className="border-b last:border-b-0">
                {/* Category Header */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900">
                      {getCategoryName(categoryId)}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {categoryModules.length} module{categoryModules.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Category Modules */}
                <div className="divide-y">
                  {categoryModules.map((module) => (
                    <div key={module.id} className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start sm:items-center gap-3 mb-2 flex-wrap">
                            <h4 className="text-base sm:text-lg font-medium text-gray-900 flex-1 min-w-0">
                              {module.title}
                            </h4>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{module.description}</p>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                            <span>{module.quiz_questions.length} questions</span>
                            <span>Créé le {new Date(module.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 lg:ml-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            module.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {module.is_active ? 'Actif' : 'Inactif'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(module.id, module.is_active)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                              module.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {module.is_active ? 'Désactiver' : 'Activer'}
                          </button>

                          <button
                            onClick={() => {
                              setEditingModule(module);
                              setCurrentView('form');
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}