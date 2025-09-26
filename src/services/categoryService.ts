import { supabase, TrainingPath } from '../lib/supabase';

// Alias pour compatibilité - utilise désormais les parcours de formation
export type ModuleCategory = TrainingPath;

export class CategoryService {
  // Fetch all categories (maintenant training paths)
  static async getAllCategories(): Promise<TrainingPath[]> {
    const { data, error } = await supabase
      .from('training_paths')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching training paths:', error);
      throw error;
    }

    return data || [];
  }

  // Create a new training path
  static async createCategory(categoryData: Omit<TrainingPath, 'created_at' | 'updated_at'>): Promise<TrainingPath> {
    const { data, error } = await supabase
      .from('training_paths')
      .insert([{
        ...categoryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating training path:', error);
      throw error;
    }

    return data;
  }

  // Update an existing training path
  static async updateCategory(categoryId: string, updates: Partial<TrainingPath>): Promise<TrainingPath> {
    const { data, error } = await supabase
      .from('training_paths')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating training path:', error);
      throw error;
    }

    return data;
  }

  // Delete a training path (soft delete by setting is_active to false)
  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('training_paths')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting training path:', error);
      throw error;
    }
  }

  // Hard delete a training path (permanent deletion)
  static async permanentDeleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('training_paths')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error permanently deleting training path:', error);
      throw error;
    }
  }

  // Get training path by ID
  static async getCategoryById(categoryId: string): Promise<TrainingPath | null> {
    const { data, error } = await supabase
      .from('training_paths')
      .select('*')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching training path:', error);
      throw error;
    }

    return data;
  }

  // Update training path order
  static async updateCategoryOrder(categories: { id: string; order_index: number }[]): Promise<void> {
    const updates = categories.map(({ id, order_index }) => 
      supabase
        .from('training_paths')
        .update({ 
          order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    );

    const results = await Promise.allSettled(updates);
    
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some training path order updates failed:', failures);
      throw new Error(`Failed to update ${failures.length} training path orders`);
    }
  }
}