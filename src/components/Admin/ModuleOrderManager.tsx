import React, { useState, useEffect } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Module, supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface ModuleOrderManagerProps {
  trainingPathId: string;
  onClose: () => void;
}

export function ModuleOrderManager({ trainingPathId, onClose }: ModuleOrderManagerProps) {
  const { language } = useLanguage();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [trainingPathId]);

  const fetchModules = async () => {
    try {
      setLoading(true);

      // Support both training_path_id and module_category
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .or(`training_path_id.eq.${trainingPathId},module_category.eq.${trainingPathId}`)
        .order('order_index', { ascending: true });

      if (error) throw error;

      console.log(`📦 Loaded ${data?.length || 0} modules for path ${trainingPathId}`);
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newModules.length) return;

    // Swap modules
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];

    // Update order_index for both modules
    newModules[index] = { ...newModules[index], order_index: index };
    newModules[targetIndex] = { ...newModules[targetIndex], order_index: targetIndex };

    setModules(newModules);
    setHasChanges(true);
  };

  const saveOrder = async () => {
    try {
      setSaving(true);

      console.log(`💾 Saving order for ${modules.length} modules...`);

      // Update each module individually to ensure it works
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];

        console.log(`  📝 Updating module "${module.title}" to order_index: ${i}`);

        const { error } = await supabase
          .from('modules')
          .update({
            order_index: i,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) {
          console.error(`  ❌ Error updating module ${module.id}:`, error);
          throw error;
        }
      }

      console.log('✅ All modules order updated successfully!');
      alert('✅ Ordre sauvegardé avec succès !');
      setHasChanges(false);

      // Refresh to show updated order
      await fetchModules();

      // Close after a short delay to show success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('❌ Error saving order:', error);
      alert('❌ Erreur lors de la sauvegarde de l\'ordre');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Réorganiser les modules
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Annuler
          </button>
          {hasChanges && (
            <button
              onClick={saveOrder}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {modules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun module dans ce parcours
          </p>
        ) : (
          modules.map((module, index) => (
            <div
              key={module.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {getTranslatedField(module, 'title', language)}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {getTranslatedField(module, 'description', language)}
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => moveModule(index, 'up')}
                  disabled={index === 0}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Déplacer vers le haut"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveModule(index, 'down')}
                  disabled={index === modules.length - 1}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Déplacer vers le bas"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modules.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Info :</strong> Les modules sont déverrouillés dans l'ordre. Les employés doivent terminer le module 1 avant d'accéder au module 2, etc.
          </p>
        </div>
      )}
    </div>
  );
}
