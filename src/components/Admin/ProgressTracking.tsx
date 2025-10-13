import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Trophy, Clock, CheckCircle, Users, Search, Award, TrendingUp, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import type { UserProfile, OnboardingResponse } from '../../lib/supabase';

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

interface OnboardingScoreData {
  profile: UserProfile;
  response?: OnboardingResponse;
}

interface ProgressTrackingProps {
  onBack: () => void;
}

export function ProgressTracking({ onBack }: ProgressTrackingProps) {
  const { t } = useLanguage();
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

  // Onboarding scores states
  const [onboardingData, setOnboardingData] = useState<OnboardingScoreData[]>([]);
  const [filteredOnboardingData, setFilteredOnboardingData] = useState<OnboardingScoreData[]>([]);
  const [onboardingSearchTerm, setOnboardingSearchTerm] = useState('');
  const [onboardingFilterRole, setOnboardingFilterRole] = useState<string>('all');
  const [onboardingSortBy, setOnboardingSortBy] = useState<'name' | 'score' | 'date'>('date');
  const [onboardingSortOrder, setOnboardingSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showOnboardingSection, setShowOnboardingSection] = useState(true);

  useEffect(() => {
    fetchProgressData();
    fetchOnboardingScores();
  }, []);

  useEffect(() => {
    // Filter data based on search term
    const filtered = progressData.filter(user =>
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, progressData]);

  // Filter and sort onboarding data
  useEffect(() => {
    let filtered = onboardingData.filter(data => {
      const matchesSearch =
        data.profile.full_name.toLowerCase().includes(onboardingSearchTerm.toLowerCase()) ||
        data.profile.email.toLowerCase().includes(onboardingSearchTerm.toLowerCase());

      const matchesRole = onboardingFilterRole === 'all' || data.profile.job_role === onboardingFilterRole;

      return matchesSearch && matchesRole;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (onboardingSortBy === 'name') {
        comparison = a.profile.full_name.localeCompare(b.profile.full_name);
      } else if (onboardingSortBy === 'score') {
        const scoreA = a.response?.score ?? -1;
        const scoreB = b.response?.score ?? -1;
        comparison = scoreA - scoreB;
      } else if (onboardingSortBy === 'date') {
        const dateA = new Date(a.response?.completed_at ?? a.profile.created_at).getTime();
        const dateB = new Date(b.response?.completed_at ?? b.profile.created_at).getTime();
        comparison = dateA - dateB;
      }

      return onboardingSortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOnboardingData(filtered);
  }, [onboardingSearchTerm, onboardingFilterRole, onboardingSortBy, onboardingSortOrder, onboardingData]);

  const fetchOnboardingScores = async () => {
    try {
      // Fetch all users who were onboarded via QR
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('onboarded_via_qr', true)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setOnboardingData([]);
        return;
      }

      // Fetch onboarding responses for these users
      const userIds = profiles.map(p => p.id);
      const { data: responses, error: responsesError } = await supabase
        .from('onboarding_responses')
        .select('*')
        .in('user_id', userIds);

      if (responsesError) throw responsesError;

      // Combine profiles with their responses
      const combined: OnboardingScoreData[] = profiles.map(profile => {
        const response = responses?.find(r => r.user_id === profile.id);
        return { profile, response };
      });

      setOnboardingData(combined);
    } catch (err) {
      console.error('Error loading onboarding scores:', err);
    }
  };

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
    link.download = `moojood-academy-progress-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Onboarding helper functions
  const onboardingStats = React.useMemo(() => {
    const totalUsers = onboardingData.length;
    const usersWithScores = onboardingData.filter(d => d.response).length;
    const scores = onboardingData
      .filter(d => d.response)
      .map(d => d.response!.score);

    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const passedUsers = onboardingData.filter(d => d.response?.passed).length;
    const passRate = usersWithScores > 0
      ? Math.round((passedUsers / usersWithScores) * 100)
      : 0;

    return {
      totalUsers,
      usersWithScores,
      averageScore,
      passRate
    };
  }, [onboardingData]);

  const jobRoles = React.useMemo(() => {
    const roles = new Set(onboardingData.map(d => d.profile.job_role).filter(Boolean));
    return Array.from(roles);
  }, [onboardingData]);

  const toggleOnboardingSort = (field: 'name' | 'score' | 'date') => {
    if (onboardingSortBy === field) {
      setOnboardingSortOrder(onboardingSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setOnboardingSortBy(field);
      setOnboardingSortOrder('desc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-4 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('back_to_admin')}
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.progress_title')}</h1>
            <p className="text-gray-600">{t('admin.progress_subtitle')}</p>
          </div>

          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('admin.export_csv')}
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('admin.total_employees')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('admin.active_employees')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('admin.completion_rate')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageCompletion}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('admin.top_performer')}</p>
              <p className="text-lg font-bold text-gray-900 truncate">{stats.topPerformer || t('admin.none')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Scores Section */}
      {onboardingData.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Scores d'Onboarding</h2>
                  <p className="text-cyan-100">Évaluations initiales des employés (QR)</p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardingSection(!showOnboardingSection)}
                className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {showOnboardingSection ? 'Masquer' : 'Afficher'}
                {showOnboardingSection ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {showOnboardingSection && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-100">Employés</p>
                      <p className="text-2xl font-bold text-white">{onboardingStats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-100">Score moyen</p>
                      <p className="text-2xl font-bold text-white">{onboardingStats.averageScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-100">Taux de réussite</p>
                      <p className="text-2xl font-bold text-white">{onboardingStats.passRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-100">Évalués</p>
                      <p className="text-2xl font-bold text-white">{onboardingStats.usersWithScores}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showOnboardingSection && (
            <>
              {/* Onboarding Filters */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={onboardingSearchTerm}
                      onChange={(e) => setOnboardingSearchTerm(e.target.value)}
                      placeholder="Rechercher par nom ou email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={onboardingFilterRole}
                      onChange={(e) => setOnboardingFilterRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">Tous les postes</option>
                      {jobRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end text-sm text-gray-600">
                    {filteredOnboardingData.length} résultat(s)
                  </div>
                </div>
              </div>

              {/* Onboarding Scores Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleOnboardingSort('name')}
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                            Employé
                            {onboardingSortBy === 'name' && (
                              onboardingSortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Poste
                        </th>
                        <th
                          className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleOnboardingSort('score')}
                        >
                          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                            Score
                            {onboardingSortBy === 'score' && (
                              onboardingSortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                          Statut
                        </th>
                        <th
                          className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleOnboardingSort('date')}
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                            Date
                            {onboardingSortBy === 'date' && (
                              onboardingSortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOnboardingData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            Aucun résultat
                          </td>
                        </tr>
                      ) : (
                        filteredOnboardingData.map((data) => (
                          <tr key={data.profile.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {data.profile.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {data.profile.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700">
                                {data.profile.job_role || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {data.response ? (
                                <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getScoreColor(data.response.score)}`}>
                                  {data.response.score}
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {data.response ? (
                                data.response.passed ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                                    <Award className="h-4 w-4" />
                                    Réussi
                                  </span>
                                ) : (
                                  <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700">
                                    Non réussi
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {data.response?.completed_at ? (
                                <div>
                                  <div>{new Date(data.response.completed_at).toLocaleDateString('fr-FR')}</div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(data.response.completed_at).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Non évalué</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.search_employee')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredData.length} {t('admin.employees_displayed')}
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t('admin.progress_details')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.employee')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.progression')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.modules_completed')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.average_score')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.last_activity')}
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
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
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
                          <Clock className="h-4 w-4 text-orange-500 ml-2" />
                          <span className="text-sm text-orange-600">{user.in_progress_modules}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.average_score > 0 ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className={`text-sm font-medium ${
                          user.average_score >= 80 ? 'text-green-600' : 'text-orange-600'
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
              {searchTerm ? t('admin.no_employee_found_search') : t('admin.no_employee_registered')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}