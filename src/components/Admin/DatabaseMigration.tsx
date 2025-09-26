import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Play } from 'lucide-react';
import { checkMigrationsStatus } from '../../utils/migrations';

export function DatabaseMigration() {
  const [status, setStatus] = useState<'checking' | 'needed' | 'applied'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatus('checking');
    const result = await checkMigrationsStatus();
    
    if (result.migrationsNeeded) {
      setStatus('needed');
      setError(result.error?.message || null);
    } else {
      setStatus('applied');
      setError(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">État de la Base de Données</h2>
      </div>

      <div className="space-y-4">
        {status === 'checking' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h3 className="font-medium text-blue-900">Vérification en cours...</h3>
              <p className="text-sm text-blue-700">Vérification du statut des migrations</p>
            </div>
          </div>
        )}

        {status === 'needed' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Migrations requises</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Les nouvelles colonnes pour l'onboarding ne sont pas encore créées dans la base de données.
                </p>
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                    Erreur détectée: {error}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Instructions pour appliquer les migrations :</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Option 1 - Via Supabase Dashboard :</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Connectez-vous à votre dashboard Supabase</li>
                  <li>Allez dans l'onglet "SQL Editor"</li>
                  <li>Copiez et exécutez le script dans <code>migrations/add_onboarding_columns.sql</code></li>
                </ol>
                
                <p className="pt-2"><strong>Option 2 - Via CLI :</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Utilisez la commande : <code className="bg-gray-100 px-1 rounded">supabase db reset</code></li>
                  <li>Ou appliquez le script manuellement via psql</li>
                </ol>
              </div>
            </div>

            <button
              onClick={checkStatus}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play className="h-4 w-4" />
              Revérifier
            </button>
          </div>
        )}

        {status === 'applied' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium text-green-900">Base de données à jour</h3>
              <p className="text-sm text-green-700">
                Toutes les migrations nécessaires ont été appliquées. Le système d'onboarding est prêt !
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Nouvelles fonctionnalités disponibles :</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Onboarding personnalisé par métier</li>
          <li>✓ Module de bienvenue obligatoire</li>
          <li>✓ Recommandations de modules par profil</li>
          <li>✓ Catégorisation des formations</li>
        </ul>
      </div>
    </div>
  );
}