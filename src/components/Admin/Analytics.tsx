import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, BookOpen, Trophy, Calendar, Download, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsProps {
  onBack: () => void;
}

interface ModuleStats {
  module_id: string;
  module_title: string;
  total_users: number;
  completed_users: number;
  in_progress_users: number;
  average_score: number;
  completion_rate: number;
  average_attempts: number;
}

interface TimeSeriesData {
  date: string;
  completions: number;
  new_users: number;
}

export function Analytics({ onBack }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalModules: 0,
    totalCompletions: 0,
    averageCompletionRate: 0,
    averageScore: 0,
    activeUsersLastWeek: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      await Promise.all([
        fetchModuleStats(),
        fetchGlobalStats(),
        fetchTimeSeriesData()
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleStats = async () => {
    try {
      // Fetch all modules
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, title, is_active')
        .eq('is_active', true);

      if (modulesError) throw modulesError;

      // Fetch all progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('module_id, status, score, attempts');

      if (progressError) throw progressError;

      // Calculate stats for each module
      const stats: ModuleStats[] = modules.map(module => {
        const moduleProgress = progressData.filter(p => p.module_id === module.id);
        const completed = moduleProgress.filter(p => p.status === 'completed');
        const inProgress = moduleProgress.filter(p => p.status === 'in_progress');
        const totalUsers = moduleProgress.length;
        
        const scores = completed.filter(p => p.score !== null).map(p => p.score!);
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        const attempts = moduleProgress.filter(p => p.attempts > 0).map(p => p.attempts);
        const averageAttempts = attempts.length > 0 ? attempts.reduce((a, b) => a + b, 0) / attempts.length : 0;
        
        const completionRate = totalUsers > 0 ? (completed.length / totalUsers) * 100 : 0;

        return {
          module_id: module.id,
          module_title: module.title,
          total_users: totalUsers,
          completed_users: completed.length,
          in_progress_users: inProgress.length,
          average_score: Math.round(averageScore),
          completion_rate: Math.round(completionRate),
          average_attempts: Math.round(averageAttempts * 10) / 10
        };
      });

      setModuleStats(stats);
    } catch (error) {
      console.error('Error fetching module stats:', error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      // Count total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Count total modules
      const { count: totalModules } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get all progress data
      const { data: allProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('status, score, updated_at');

      if (progressError) throw progressError;

      const completions = allProgress.filter(p => p.status === 'completed').length;
      const scores = allProgress.filter(p => p.score !== null).map(p => p.score!);
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      // Calculate average completion rate
      const averageCompletionRate = totalUsers && totalModules 
        ? (completions / (totalUsers * totalModules)) * 100 
        : 0;

      // Count active users in the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const activeUsersLastWeek = allProgress.filter(p => 
        new Date(p.updated_at) > oneWeekAgo
      ).length;

      setGlobalStats({
        totalUsers: totalUsers || 0,
        totalModules: totalModules || 0,
        totalCompletions: completions,
        averageCompletionRate: Math.round(averageCompletionRate),
        averageScore: Math.round(averageScore),
        activeUsersLastWeek
      });
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };

  const fetchTimeSeriesData = async () => {
    try {
      // Get completions and new users for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('completed_at, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (progressError || usersError) throw progressError || usersError;

      // Group by date
      const timeData: { [key: string]: { completions: number; new_users: number } } = {};
      
      // Initialize last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        timeData[dateStr] = { completions: 0, new_users: 0 };
      }

      // Count completions
      progressData.forEach(p => {
        if (p.completed_at) {
          const date = p.completed_at.split('T')[0];
          if (timeData[date]) {
            timeData[date].completions++;
          }
        }
      });

      // Count new users
      usersData.forEach(u => {
        const date = u.created_at.split('T')[0];
        if (timeData[date]) {
          timeData[date].new_users++;
        }
      });

      const seriesData = Object.entries(timeData).map(([date, data]) => ({
        date,
        completions: data.completions,
        new_users: data.new_users
      }));

      setTimeSeriesData(seriesData);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const exportAnalytics = () => {
    const headers = [
      'Module',
      'Utilisateurs Total',
      'Terminé',
      'En Cours',
      'Taux de Réussite (%)',
      'Score Moyen (%)',
      'Tentatives Moyennes'
    ];

    const csvData = moduleStats.map(stat => [
      stat.module_title,
      stat.total_users,
      stat.completed_users,
      stat.in_progress_users,
      stat.completion_rate,
      stat.average_score,
      stat.average_attempts
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bodega-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'administration
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Statistiques</h1>
            <p className="text-gray-600">Analyse détaillée des performances et de l'engagement</p>
          </div>
          
          <button
            onClick={exportAnalytics}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Utilisateurs</p>
              <p className="text-lg font-bold text-gray-900">{globalStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-green-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Modules</p>
              <p className="text-lg font-bold text-gray-900">{globalStats.totalModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Completions</p>
              <p className="text-lg font-bold text-gray-900">{globalStats.totalCompletions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-black" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Taux Moyen</p>
              <p className="text-lg font-bold text-gray-900">{globalStats.averageCompletionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Score Moyen</p>
              <p className="text-lg font-bold text-gray-900">{globalStats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-red-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Actifs (7j)</p>
              <p className="text-lg font-bold text-gray-900">{globalStats.activeUsersLastWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité des 30 derniers jours</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {timeSeriesData.map((day, index) => {
            const maxValue = Math.max(...timeSeriesData.map(d => Math.max(d.completions, d.new_users)));
            const completionHeight = maxValue > 0 ? (day.completions / maxValue) * 200 : 0;
            const usersHeight = maxValue > 0 ? (day.new_users / maxValue) * 200 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full max-w-4 flex flex-col gap-1">
                  <div 
                    className="bg-gray-500 rounded-t"
                    style={{ height: `${completionHeight}px` }}
                    title={`${day.completions} completions`}
                  />
                  <div 
                    className="bg-blue-500 rounded-b"
                    style={{ height: `${usersHeight}px` }}
                    title={`${day.new_users} nouveaux utilisateurs`}
                  />
                </div>
                {index % 5 === 0 && (
                  <span className="text-xs text-gray-500 transform rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-600">Completions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Nouveaux utilisateurs</span>
          </div>
        </div>
      </div>

      {/* Module Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Performance des Modules</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de Réussite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score Moyen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tentatives Moy.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {moduleStats.map((stat) => (
                <tr key={stat.module_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{stat.module_title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{stat.total_users}</span>
                      <div className="flex gap-1">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {stat.completed_users} ✓
                        </span>
                        {stat.in_progress_users > 0 && (
                          <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded">
                            {stat.in_progress_users} ⏳
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 mr-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stat.completion_rate >= 80 ? 'bg-green-500' :
                              stat.completion_rate >= 60 ? 'bg-gray-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stat.completion_rate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stat.completion_rate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className={`text-sm font-medium ${
                        stat.average_score >= 80 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {stat.average_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{stat.average_attempts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {moduleStats.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée analytique disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}