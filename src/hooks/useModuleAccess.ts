import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface ModuleAccessStatus {
  moduleId: string;
  moduleTitle: string;
  orderIndex: number;
  isLocked: boolean;
  reason?: string;
  previousModuleTitle?: string;
}

/**
 * Hook pour gérer l'accès aux modules d'un parcours de formation
 * Utilise la logique de verrouillage SQL (fonction is_module_locked)
 *
 * @param userId - ID de l'utilisateur
 * @param trainingPathId - ID du parcours de formation
 * @returns État de l'accès aux modules et méthodes utilitaires
 */
export function useModuleAccess(userId: string, trainingPathId: string) {
  const [moduleAccess, setModuleAccess] = useState<ModuleAccessStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchModuleAccess = useCallback(async () => {
    if (fetchingRef.current || !userId || !trainingPathId) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      console.log(`🔍 Fetching module access for user ${userId} and path ${trainingPathId}`);

      // Appeler la fonction RPC get_module_access_status
      const { data, error: rpcError } = await supabase
        .rpc('get_module_access_status', {
          p_user_id: userId,
          p_training_path_id: trainingPathId
        });

      if (rpcError) {
        console.error('❌ Error calling get_module_access_status:', rpcError);
        setError(rpcError.message);
        return;
      }

      console.log(`✅ Received ${data?.length || 0} modules:`, data);

      // Mapper les données reçues
      const accessData: ModuleAccessStatus[] = (data || []).map((row: any) => ({
        moduleId: row.module_id,
        moduleTitle: row.module_title,
        orderIndex: row.order_index,
        isLocked: row.is_locked,
        reason: row.reason,
        previousModuleTitle: row.previous_module_title
      }));

      // Log pour debug
      accessData.forEach(module => {
        console.log(
          `  ${module.isLocked ? '🔒' : '🔓'} ${module.moduleTitle} (order: ${module.orderIndex})`
        );
      });

      setModuleAccess(accessData);
    } catch (err) {
      console.error('❌ Error fetching module access:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [userId, trainingPathId]);

  // Initial fetch
  useEffect(() => {
    fetchModuleAccess();
  }, [fetchModuleAccess]);

  // Subscribe to progress changes - rafraîchir quand la progression change
  useEffect(() => {
    if (!userId) return;

    const channelName = `module-access-${userId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 Progress changed, refreshing module access...', payload);
          // Debounce pour éviter trop de rafraîchissements
          setTimeout(() => {
            fetchModuleAccess();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchModuleAccess]);

  /**
   * Vérifie si un module est verrouillé
   * @param moduleId - ID du module à vérifier
   * @returns true si le module est verrouillé, false sinon
   */
  const isModuleLocked = useCallback((moduleId: string): boolean => {
    const module = moduleAccess.find(m => m.moduleId === moduleId);
    // Par défaut verrouillé si module non trouvé (sécurité)
    return module?.isLocked ?? true;
  }, [moduleAccess]);

  /**
   * Récupère le statut complet d'un module
   * @param moduleId - ID du module
   * @returns Statut du module ou null si non trouvé
   */
  const getModuleStatus = useCallback((moduleId: string): ModuleAccessStatus | null => {
    return moduleAccess.find(m => m.moduleId === moduleId) || null;
  }, [moduleAccess]);

  return {
    moduleAccess,
    loading,
    error,
    isModuleLocked,
    getModuleStatus,
    refresh: fetchModuleAccess
  };
}
