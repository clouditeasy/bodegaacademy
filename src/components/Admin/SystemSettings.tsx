import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Save, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SystemSettingsProps {
  onBack: () => void;
}

interface SystemConfig {
  quiz_pass_score: number;
  max_quiz_attempts: number;
  module_auto_progress: boolean;
  email_notifications: boolean;
  system_maintenance: boolean;
  registration_enabled: boolean;
}

export function SystemSettings({ onBack }: SystemSettingsProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [config, setConfig] = useState<SystemConfig>({
    quiz_pass_score: 80,
    max_quiz_attempts: 3,
    module_auto_progress: true,
    email_notifications: true,
    system_maintenance: false,
    registration_enabled: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, these would be loaded from the database
      // For now, we'll use localStorage as a demo
      const savedConfig = localStorage.getItem('moojood_system_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setSaveStatus('saving');

    try {
      // In a real app, these would be saved to the database
      localStorage.setItem('moojood_system_config', JSON.stringify(config));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Paramètres Système</h1>
            <p className="text-gray-600">Configuration globale de la plateforme</p>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            saveStatus === 'success' ? 'bg-green-50 text-green-800' :
            saveStatus === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {saveStatus === 'success' && <CheckCircle className="h-4 w-4" />}
            {saveStatus === 'error' && <AlertTriangle className="h-4 w-4" />}
            {saveStatus === 'saving' && <Info className="h-4 w-4" />}
            {saveStatus === 'success' && 'Paramètres sauvegardés avec succès'}
            {saveStatus === 'error' && 'Erreur lors de la sauvegarde'}
            {saveStatus === 'saving' && 'Sauvegarde en cours...'}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Quiz Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Paramètres des Quiz</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="quiz_pass_score" className="block text-sm font-medium text-gray-700 mb-2">
                Score minimum de réussite (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="quiz_pass_score"
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={config.quiz_pass_score}
                  onChange={(e) => handleConfigChange('quiz_pass_score', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-16 text-center">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={config.quiz_pass_score}
                    onChange={(e) => handleConfigChange('quiz_pass_score', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Score minimum requis pour valider un module
              </p>
            </div>

            <div>
              <label htmlFor="max_quiz_attempts" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de tentatives
              </label>
              <select
                id="max_quiz_attempts"
                value={config.max_quiz_attempts}
                onChange={(e) => handleConfigChange('max_quiz_attempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={1}>1 tentative</option>
                <option value={2}>2 tentatives</option>
                <option value={3}>3 tentatives</option>
                <option value={5}>5 tentatives</option>
                <option value={-1}>Illimité</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Nombre de fois qu'un utilisateur peut refaire un quiz
              </p>
            </div>
          </div>
        </div>

        {/* Learning Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres d'Apprentissage</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Progression automatique</h3>
                <p className="text-xs text-gray-500">
                  Marquer automatiquement les modules comme "en cours" lors de l'ouverture
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.module_auto_progress}
                  onChange={(e) => handleConfigChange('module_auto_progress', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres Système</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Notifications par email</h3>
                <p className="text-xs text-gray-500">
                  Envoyer des notifications automatiques aux utilisateurs
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.email_notifications}
                  onChange={(e) => handleConfigChange('email_notifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Inscription ouverte</h3>
                <p className="text-xs text-gray-500">
                  Permettre aux nouveaux utilisateurs de s'inscrire
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.registration_enabled}
                  onChange={(e) => handleConfigChange('registration_enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Mode maintenance
                  </h3>
                  <p className="text-xs text-gray-500">
                    Désactiver temporairement l'accès à la plateforme pour maintenance
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config.system_maintenance}
                    onChange={(e) => handleConfigChange('system_maintenance', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              
              {config.system_maintenance && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Le mode maintenance est activé. Les utilisateurs ne pourront pas accéder à la plateforme.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Score minimum:</strong> {config.quiz_pass_score}%
            </div>
            <div>
              <strong>Tentatives max:</strong> {config.max_quiz_attempts === -1 ? 'Illimité' : config.max_quiz_attempts}
            </div>
            <div>
              <strong>Progression auto:</strong> {config.module_auto_progress ? 'Activée' : 'Désactivée'}
            </div>
            <div>
              <strong>Notifications:</strong> {config.email_notifications ? 'Activées' : 'Désactivées'}
            </div>
            <div>
              <strong>Inscriptions:</strong> {config.registration_enabled ? 'Ouvertes' : 'Fermées'}
            </div>
            <div>
              <strong>Maintenance:</strong> {config.system_maintenance ? 'Activée' : 'Désactivée'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}