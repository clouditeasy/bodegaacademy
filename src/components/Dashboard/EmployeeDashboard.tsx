import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, Trophy, BookOpen, Target } from 'lucide-react';
import { supabase, Module, UserProgress } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ModuleWithProgress extends Module {
  progress?: UserProgress;
}

interface EmployeeDashboardProps {
  onSelectModule: (module: Module) => void;
}

export function EmployeeDashboard({ onSelectModule }: EmployeeDashboardProps) {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchModulesAndProgress();
    }
  }, [user]);

  const fetchModulesAndProgress = async () => {
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (progressError) throw progressError;

      // Combine data
      const modulesWithProgress = modulesData.map(module => ({
        ...module,
        progress: progressData.find(p => p.module_id === module.id)
      }));

      setModules(modulesWithProgress);

      // Calculate stats
      const completed = progressData.filter(p => p.status === 'completed').length;
      const inProgress = progressData.filter(p => p.status === 'in_progress').length;
      const scores = progressData.filter(p => p.score !== null).map(p => p.score!);
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      setStats({
        total: modulesData.length,
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

  const getStatusIcon = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return <Play className="h-5 w-5 text-gray-400" />;
    } else if (progress.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <Clock className="h-5 w-5 text-black" />;
    }
  };

  const getStatusText = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return 'Commencer';
    } else if (progress.status === 'completed') {
      return 'Terminé';
    } else {
      return 'Continuer';
    }
  };

  const getButtonText = (progress?: UserProgress) => {
    if (!progress || progress.status === 'not_started') {
      return 'Commencer';
    } else if (progress.status === 'completed') {
      return 'Revoir';
    } else {
      return 'Continuer';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
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
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Terminés</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-black flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">En cours</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Score moyen</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-black" />
          Votre progression
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-black to-gray-800 h-3 rounded-full transition-all duration-300"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.completed} sur {stats.total} modules terminés ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
        </p>
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Modules de formation</h2>
        </div>
        <div className="divide-y">
          {modules.map((module) => (
            <div key={module.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start sm:items-center gap-3 mb-2 flex-wrap">
                    {getStatusIcon(module.progress)}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 min-w-0">
                      {module.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      module.progress?.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : module.progress?.status === 'in_progress'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(module.progress)}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{module.description}</p>
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
                  onClick={() => onSelectModule(module)}
                  className="bg-black text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
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
    </div>
  );
}