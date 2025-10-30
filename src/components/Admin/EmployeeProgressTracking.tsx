import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Download, Users, BookOpen, CheckCircle, Clock, XCircle, Award, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { supabase, UserProfile, Module, UserProgress } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface EmployeeProgressTrackingProps {
  onBack: () => void;
}

interface EmployeeWithProgress {
  profile: UserProfile;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  averageScore: number;
  moduleProgress: ModuleProgressDetail[];
}

interface ModuleProgressDetail {
  module: Module;
  progress?: UserProgress;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: string;
  attempts?: number;
}

export function EmployeeProgressTracking({ onBack }: EmployeeProgressTrackingProps) {
  const { language } = useLanguage();
  const [employees, setEmployees] = useState<EmployeeWithProgress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterJobRole, setFilterJobRole] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger tous les employés (non-admin)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('role', 'admin')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Charger tous les modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Charger toutes les progressions
      const { data: allProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*');

      if (progressError) throw progressError;

      // Construire les données pour chaque employé
      const employeesWithProgress: EmployeeWithProgress[] = (profiles || []).map(profile => {
        const userProgress = (allProgress || []).filter(p => p.user_id === profile.id);

        const moduleProgress: ModuleProgressDetail[] = (modulesData || []).map(module => {
          const progress = userProgress.find(p => p.module_id === module.id);

          return {
            module,
            progress,
            status: progress?.status || 'not_started',
            score: progress?.score,
            completedAt: progress?.completed_at,
            attempts: progress?.attempts || 0
          };
        });

        const completedModules = moduleProgress.filter(m => m.status === 'completed').length;
        const inProgressModules = moduleProgress.filter(m => m.status === 'in_progress').length;

        const scores = moduleProgress
          .filter(m => m.score !== undefined && m.score !== null)
          .map(m => m.score!);
        const averageScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        return {
          profile,
          totalModules: modulesData?.length || 0,
          completedModules,
          inProgressModules,
          averageScore,
          moduleProgress
        };
      });

      setEmployees(employeesWithProgress);
    } catch (error) {
      console.error('Error loading progress data:', error);
      alert('Erreur lors du chargement des données de progression');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueValues = (field: 'department' | 'job_role') => {
    const values = new Set<string>();
    employees.forEach(emp => {
      const value = emp.profile[field];
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  };

  const filteredEmployees = employees.filter(emp => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      emp.profile.full_name.toLowerCase().includes(searchLower) ||
      emp.profile.email.toLowerCase().includes(searchLower) ||
      emp.profile.department?.toLowerCase().includes(searchLower) ||
      emp.profile.job_role?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Department filter
    if (filterDepartment !== 'all' && emp.profile.department !== filterDepartment) {
      return false;
    }

    // Job role filter
    if (filterJobRole !== 'all' && emp.profile.job_role !== filterJobRole) {
      return false;
    }

    // Status filter
    if (filterStatus === 'completed' && emp.completedModules === 0) return false;
    if (filterStatus === 'in_progress' && emp.inProgressModules === 0) return false;
    if (filterStatus === 'not_started' && (emp.completedModules > 0 || emp.inProgressModules > 0)) return false;

    return true;
  });

  const exportToCSV = () => {
    const headers = [
      'Nom',
      'Email',
      'Département',
      'Poste',
      'Modules Totaux',
      'Modules Complétés',
      'Modules En Cours',
      'Score Moyen (%)',
      'Taux de Complétion (%)'
    ];

    const rows = filteredEmployees.map(emp => [
      emp.profile.full_name,
      emp.profile.email,
      emp.profile.department || '-',
      emp.profile.job_role || '-',
      emp.totalModules,
      emp.completedModules,
      emp.inProgressModules,
      emp.averageScore,
      emp.totalModules > 0 ? Math.round((emp.completedModules / emp.totalModules) * 100) : 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `progression_employes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Complété
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3" />
            En cours
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <XCircle className="h-3 w-3" />
            Non commencé
          </span>
        );
    }
  };

  const toggleEmployeeDetails = (employeeId: string) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-4 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au dashboard
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suivi de Progression</h1>
            <p className="text-gray-600 mt-2">
              Suivez la progression de tous les employés en temps réel
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Employés</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Modules Complétés</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.reduce((sum, emp) => sum + emp.completedModules, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.reduce((sum, emp) => sum + emp.inProgressModules, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Score Moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length > 0
                  ? Math.round(employees.reduce((sum, emp) => sum + emp.averageScore, 0) / employees.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtres</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="in_progress">En cours</option>
            <option value="not_started">Non commencés</option>
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les départements</option>
            {getUniqueValues('department').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Job Role Filter */}
          <select
            value={filterJobRole}
            onChange={(e) => setFilterJobRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les postes</option>
            {getUniqueValues('job_role').map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Employés ({filteredEmployees.length})
          </h2>
        </div>

        <div className="divide-y">
          {filteredEmployees.map((employee) => {
            const isExpanded = expandedEmployee === employee.profile.id;
            const completionRate = employee.totalModules > 0
              ? Math.round((employee.completedModules / employee.totalModules) * 100)
              : 0;

            return (
              <div key={employee.profile.id} className="p-6">
                {/* Employee Summary */}
                <div
                  className="cursor-pointer"
                  onClick={() => toggleEmployeeDetails(employee.profile.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-lg">
                          {employee.profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {employee.profile.full_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">{employee.profile.email}</span>
                          {employee.profile.department && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{employee.profile.department}</span>
                            </>
                          )}
                          {employee.profile.job_role && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{employee.profile.job_role}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{employee.completedModules}</p>
                          <p className="text-xs text-gray-600">Complétés</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{employee.inProgressModules}</p>
                          <p className="text-xs text-gray-600">En cours</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{employee.averageScore}%</p>
                          <p className="text-xs text-gray-600">Score moyen</p>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progression globale</span>
                      <span className="font-semibold">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Détails des modules</h4>
                    <div className="space-y-3">
                      {employee.moduleProgress.map((moduleProgress) => (
                        <div
                          key={moduleProgress.module.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {getTranslatedField(moduleProgress.module, 'title', language)}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {getTranslatedField(moduleProgress.module, 'description', language)}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 ml-4">
                            {moduleProgress.score !== undefined && moduleProgress.score !== null && (
                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{moduleProgress.score}%</p>
                                <p className="text-xs text-gray-600">Score</p>
                              </div>
                            )}
                            {moduleProgress.attempts > 0 && (
                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{moduleProgress.attempts}</p>
                                <p className="text-xs text-gray-600">Tentatives</p>
                              </div>
                            )}
                            {getStatusBadge(moduleProgress.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun employé trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">À propos du suivi de progression :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Les données sont mises à jour en temps réel</li>
              <li>Le score moyen est calculé uniquement sur les modules complétés avec quiz</li>
              <li>Cliquez sur un employé pour voir le détail de tous ses modules</li>
              <li>Utilisez les filtres pour affiner votre recherche</li>
              <li>Exportez les données en CSV pour une analyse plus approfondie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
