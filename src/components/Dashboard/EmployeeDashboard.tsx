import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, Trophy, BookOpen, Target, Star, AlertCircle, MapPin, Settings, RotateCcw } from 'lucide-react';
import { supabase, Module, UserProgress, UserProfile } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { getTrainingPathForJobRole } from '../../config/trainingPaths';
import { ModuleCategoriesView } from '../Module/ModuleCategoriesView';
import { CategoryModulesView } from '../Module/CategoryModulesView';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface ModuleWithProgress extends Module {
  progress?: UserProgress;
  isRecommended?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface EmployeeDashboardProps {
  onSelectModule: (module: Module, currentView: 'categories' | 'category' | 'modules', categoryId: string) => void;
  initialView?: 'categories' | 'category' | 'modules';
  initialCategoryId?: string;
}

export function EmployeeDashboard({ onSelectModule, initialView = 'categories', initialCategoryId = '' }: EmployeeDashboardProps) {
  const { user, userProfile } = useAuth();
  const { t, language } = useLanguage();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [recommendedModules, setRecommendedModules] = useState<ModuleWithProgress[]>([]);
  const [trainingPath, setTrainingPath] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'category' | 'modules'>(initialView);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Synchronize with initial props when they change (e.g., returning from module)
  useEffect(() => {
    if (initialView !== currentView) {
      setCurrentView(initialView);
    }
    if (initialCategoryId !== selectedCategory) {
      setSelectedCategory(initialCategoryId);
    }
  }, [initialView, initialCategoryId]);

  useEffect(() => {
    if (user && userProfile) {
      fetchModulesAndProgress();
      // Load training path for user's job role
      const jobRole = userProfile.job_role || localStorage.getItem('pending_job_role');
      if (jobRole) {
        const path = getTrainingPathForJobRole(jobRole);
        setTrainingPath(path);
      }
    }
  }, [user, userProfile, refreshKey]);

  // Subscribe to user_progress changes for real-time updates
  useEffect(() => {
    if (!user) return;

    const channelName = `user-progress-${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Debounce refresh to avoid multiple rapid updates
          setTimeout(() => {
            setRefreshKey(prev => prev + 1);
          }, 300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchModulesAndProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Filter and categorize modules based on user profile
      const filteredModules = filterModulesForUser(modulesData, userProfile);
      
      // Combine data with progress
      const modulesWithProgress = filteredModules.map(module => ({
        ...module,
        progress: progressData.find(p => p.module_id === module.id)
      }));

      setModules(modulesWithProgress);
      
      // Set recommended modules (mandatory + job-specific incomplete modules)
      const recommended = modulesWithProgress
        .filter(module => 
          (module.is_mandatory || module.category === 'job_specific') && 
          (!module.progress || module.progress.status !== 'completed')
        )
        .slice(0, 3);
      
      setRecommendedModules(recommended);

      // Calculate stats
      const completed = progressData.filter(p => p.status === 'completed').length;
      const inProgress = progressData.filter(p => p.status === 'in_progress').length;
      const scores = progressData.filter(p => p.score !== null).map(p => p.score!);
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      setStats({
        total: filteredModules.length,
        completed,
        inProgress,
        averageScore: Math.round(averageScore)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterModulesForUser = (modules: Module[], profile: UserProfile | null) => {
    if (!profile) return modules;

    return modules.filter(module => {
      // Always show welcome and general modules
      if (module.category === 'welcome' || module.category === 'general') {
        return true;
      }

      // Show mandatory modules
      if (module.is_mandatory) {
        return true;
      }

      // Show job-specific modules that match user's job role
      if (module.category === 'job_specific') {
        return module.target_job_roles?.includes(profile.job_role || '') ||
               module.target_departments?.includes(profile.department || '');
      }

      // Show compliance modules
      if (module.category === 'compliance') {
        return true;
      }

      return false;
    });
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

  const getStatusText = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return t('start');
    } else if (progress.status === 'completed') {
      return t('completed');
    } else {
      return t('continue');
    }
  };

  const getButtonText = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return t('start');
    } else if (progress?.status === 'completed') {
      return t('restart');
    } else {
      return t('continue');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('category');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory('');
    // Refresh data when returning to categories
    setRefreshKey(prev => prev + 1);
  };

  const handleModuleSelect = (module: Module) => {
    // Passer le module avec l'état actuel du dashboard
    onSelectModule(module, currentView, selectedCategory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render categories view
  if (currentView === 'categories') {
    return (
      <div>
        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('total')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('completed')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('in_progress')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('average_score')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              {t('your_progress')}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.completed} {t('modules_completed_out_of')} {stats.total} {t('modules_completed_label')} ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
            </p>
          </div>
        </div>

        {/* Module Categories */}
        <ModuleCategoriesView
          modules={modules}
          onCategorySelect={handleCategorySelect}
          onModuleSelect={handleModuleSelect}
        />
      </div>
    );
  }

  // Render category modules view
  if (currentView === 'category') {
    return (
      <CategoryModulesView
        categoryId={selectedCategory}
        modules={modules}
        onBack={handleBackToCategories}
        onModuleSelect={handleModuleSelect}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('total')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('completed')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('in_progress')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{t('average_score')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          {t('your_progress')}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.completed} {t('modules_completed_out_of')} {stats.total} {t('modules_completed_label')} ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
        </p>
      </div>


      {/* Modules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('training_modules')}</h2>
        </div>
        <div className="divide-y">
          {modules.map((module) => (
            <div key={module.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start sm:items-center gap-3 mb-2 flex-wrap">
                    {getStatusIcon(module.progress)}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 min-w-0">
                      {getTranslatedField(module, 'title', language)}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{getTranslatedField(module, 'description', language)}</p>
                  {module.progress && module.progress.score != null && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                      <Trophy className="h-4 w-4" />
                      <span>{t('score')}: {module.progress.score}%</span>
                      {module.progress.attempts > 1 && (
                        <span>• {module.progress.attempts} {t('attempts')}</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleModuleSelect(module)}
                  className={`px-4 sm:px-6 py-2 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-[160px] ${
                    module.progress?.status === 'completed'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  title={module.progress?.status ? `Statut: ${module.progress.status}` : 'Non commencé'}
                >
                  {module.progress?.status === 'completed' ? (
                    // Pas d'icône pour "Recommencer"
                    null
                  ) : module.progress?.status === 'in_progress' ? (
                    <Clock className="h-4 w-4" />
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
    </div>
  );
}