import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Trophy, Clock, CheckCircle, Users, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProgressData {
  user_id: string;
  user_name: string;
  user_email: string;
  total_modules: number;
  completed_modules: number;
  in_progress_modules: number;
  average_score: number;
  completion_percentage: number;
  last_activity: string;
}

interface ProgressTrackingProps {
  onBack: () => void;
}

export function ProgressTracking({ onBack }: ProgressTrackingProps) {
  const [progressData, setProgressData] = useState<UserProgressData[]>([]);
  const [filteredData, setFilteredData] = useState<UserProgressData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    averageCompletion: 0,
    topPerformer: ''
  });

  useEffect(() => {
    fetchProgressData();
  }, []);

  useEffect(() => {
    // Filter data based on search term
    const filtered = progressData.filter(user => 
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, progressData]);

  const fetchProgressData = async () => {
    try {
      // Fetch all users with their progress
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .eq('role', 'employee');

      if (usersError) throw usersError;

      // Fetch all modules count
      const { count: totalModulesCount } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch all progress data
      const { data: allProgress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          user_id,
          module_id,
          status,
          score,
          updated_at,
          modules (
            title,
            is_active
          )
        `)
        .not('modules.is_active', 'is', false);

      if (progressError) throw progressError;

      // Process data for each user
      const userData: UserProgressData[] = users.map(user => {
        const userProgress = allProgress.filter(p => p.user_id === user.id);
        const completed = userProgress.filter(p => p.status === 'completed');
        const inProgress = userProgress.filter(p => p.status === 'in_progress');
        const scores = completed.filter(p => p.score !== null).map(p => p.score!);
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const completionPercentage = totalModulesCount > 0 ? (completed.length / totalModulesCount) * 100 : 0;
        
        // Find last activity
        const lastActivity = userProgress.length > 0 
          ? userProgress.reduce((latest, current) => 
              new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
            ).updated_at
          : user.id; // Fallback to user creation if no progress

        return {
          user_id: user.id,
          user_name: user.full_name,
          user_email: user.email,
          total_modules: totalModulesCount || 0,
          completed_modules: completed.length,
          in_progress_modules: inProgress.length,
          average_score: Math.round(averageScore),
          completion_percentage: Math.round(completionPercentage),
          last_activity: lastActivity
        };
      });

      setProgressData(userData);

      // Calculate global stats
      const activeUsers = userData.filter(u => u.completed_modules > 0 || u.in_progress_modules > 0).length;
      const averageCompletion = userData.length > 0 
        ? userData.reduce((sum, user) => sum + user.completion_percentage, 0) / userData.length
        : 0;
      const topPerformer = userData.reduce((top, user) => 
        user.completion_percentage > (top?.completion_percentage || 0) ? user : top, userData[0]
      );

      setStats({
        totalUsers: userData.length,
        activeUsers,
        averageCompletion: Math.round(averageCompletion),
        topPerformer: topPerformer?.user_name || 'Aucun'
      });

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Nom',
      'Email',
      'Modules Terminés',
      'Modules En Cours',
      'Taux de Completion (%)',
      'Score Moyen (%)',
      'Dernière Activité'
    ];

    const csvData = filteredData.map(user => [
      user.user_name,
      user.user_email,
      user.completed_modules,
      user.in_progress_modules,
      user.completion_percentage,
      user.average_score,
      new Date(user.last_activity).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bodega-academy-progress-${new Date().toISOString().split('T')[0]}.csv`;
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
            <h1 className="text-3xl font-bold text-gray-900">Suivi des Progressions</h1>
            <p className="text-gray-600">Analyse des performances et progression des employés</p>
          </div>
          
          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-black" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Employés Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taux Moyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageCompletion}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Performer</p>
              <p className="text-lg font-bold text-gray-900 truncate">{stats.topPerformer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredData.length} employé{filteredData.length > 1 ? 's' : ''} affiché{filteredData.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Détail des Progressions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modules Terminés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score Moyen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Activité
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                      <div className="text-sm text-gray-500">{user.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{user.completion_percentage}%</span>
                          <span>{user.completed_modules}/{user.total_modules}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${user.completion_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{user.completed_modules}</span>
                      {user.in_progress_modules > 0 && (
                        <>
                          <Clock className="h-4 w-4 text-black ml-2" />
                          <span className="text-sm text-gray-900">{user.in_progress_modules}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.average_score > 0 ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className={`text-sm font-medium ${
                          user.average_score >= 80 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {user.average_score}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.last_activity).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun employé trouvé pour cette recherche' : 'Aucun employé inscrit'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}