import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, Module } from '../lib/supabase';

interface ModuleAccessStatus {
  isLocked: boolean;
  reason?: string;
  previousModuleTitle?: string;
}

export function useModuleLocking(userId: string, modules: Module[]) {
  const [moduleAccessMap, setModuleAccessMap] = useState<Map<string, ModuleAccessStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const isCalculatingRef = useRef(false);
  const trainingPathIdRef = useRef<string>('');

  const calculateModuleAccess = useCallback(async () => {
    // Prevent concurrent calculations
    if (isCalculatingRef.current) {
      return;
    }

    if (!userId || modules.length === 0) {
      setLoading(false);
      return;
    }

    try {
      isCalculatingRef.current = true;
      setLoading(true);

      // Get the training path ID from the first module
      const trainingPathId = modules[0]?.training_path_id || modules[0]?.module_category;

      if (!trainingPathId) {
        console.warn('No training path ID found for modules');
        setLoading(false);
        return;
      }

      // Use the database function to get module access status
      console.log(`🔍 Calling get_module_access_status for user ${userId} and path ${trainingPathId}`);

      const { data, error } = await supabase
        .rpc('get_module_access_status', {
          p_user_id: userId,
          p_training_path_id: trainingPathId
        });

      if (error) {
        console.error('❌ Error calling get_module_access_status:', error);
        throw error;
      }

      console.log(`✅ Received ${data?.length || 0} module access records:`, data);

      // Build access map from database results
      const accessMap = new Map<string, ModuleAccessStatus>();

      data?.forEach((row: any) => {
        console.log(`📋 Module ${row.module_title} (order: ${row.order_index}): ${row.is_locked ? '🔒 Locked' : '🔓 Unlocked'}`);
        accessMap.set(row.module_id, {
          isLocked: row.is_locked,
          reason: row.reason,
          previousModuleTitle: row.previous_module_title
        });
      });

      setModuleAccessMap(accessMap);
    } catch (error) {
      console.error('Error calculating module access:', error);
    } finally {
      setLoading(false);
      isCalculatingRef.current = false;
    }
  }, [userId, modules]);

  // Only recalculate when training path actually changes
  useEffect(() => {
    if (modules.length === 0) return;

    const trainingPathId = modules[0]?.training_path_id || modules[0]?.module_category || '';
    const currentIds = modules.map(m => m.id).sort().join(',');
    const currentKey = `${trainingPathId}-${currentIds}`;

    if (currentKey !== trainingPathIdRef.current) {
      trainingPathIdRef.current = currentKey;
      calculateModuleAccess();
    }
  }, [calculateModuleAccess, modules]);

  // Subscribe to progress changes for real-time updates
  useEffect(() => {
    if (!userId || modules.length === 0) return;

    const moduleIds = modules.map(m => m.id);
    const channelName = `module-locking-${userId}-${Date.now()}`;

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
          // Only recalculate if the change affects our modules
          if ('new' in payload && moduleIds.includes((payload.new as any).module_id)) {
            setTimeout(() => {
              calculateModuleAccess();
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, modules.length, calculateModuleAccess]);

  const isModuleLocked = (moduleId: string): boolean => {
    const status = moduleAccessMap.get(moduleId);
    return status?.isLocked ?? true;
  };

  const getModuleAccessStatus = (moduleId: string): ModuleAccessStatus => {
    return moduleAccessMap.get(moduleId) ?? { isLocked: true };
  };

  const getNextUnlockedModule = (): Module | null => {
    // NO SORTING - modules array is already ordered from database query
    for (const module of modules) {
      const status = moduleAccessMap.get(module.id);
      if (status && !status.isLocked) {
        return module;
      }
    }

    return modules[0] || null;
  };

  return {
    moduleAccessMap,
    loading,
    isModuleLocked,
    getModuleAccessStatus,
    getNextUnlockedModule,
    refreshAccess: calculateModuleAccess
  };
}
