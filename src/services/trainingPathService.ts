import { supabase, TrainingPath, TrainingPathQuiz, TrainingPathProgress, Module } from '../lib/supabase';

export class TrainingPathService {
  // Fetch all training paths
  static async getAllTrainingPaths(): Promise<TrainingPath[]> {
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

  // Get training path by ID
  static async getTrainingPathById(pathId: string): Promise<TrainingPath | null> {
    const { data, error } = await supabase
      .from('training_paths')
      .select('*')
      .eq('id', pathId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching training path:', error);
      throw error;
    }

    return data;
  }

  // Get modules for a training path
  static async getModulesForPath(pathId: string): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('training_path_id', pathId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching modules for path:', error);
      throw error;
    }

    return data || [];
  }

  // Get training paths for a user based on their role
  static async getTrainingPathsForUser(userId: string): Promise<TrainingPath[]> {
    // First get the user's profile to know their role
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('job_role')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      throw userError;
    }

    // Get all training paths
    const { data: paths, error: pathsError } = await supabase
      .from('training_paths')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (pathsError) {
      console.error('Error fetching training paths:', pathsError);
      throw pathsError;
    }

    // Filter paths based on user role
    const userRole = userProfile.job_role;
    return paths.filter(path => 
      !path.target_roles || 
      path.target_roles.includes('all') || 
      (userRole && path.target_roles.includes(userRole))
    );
  }

  // Get user progress for a training path
  static async getUserTrainingPathProgress(userId: string, pathId: string): Promise<TrainingPathProgress | null> {
    const { data, error } = await supabase
      .from('training_path_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('training_path_id', pathId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching training path progress:', error);
      throw error;
    }

    return data;
  }

  // Update user training path progress
  static async updateUserTrainingPathProgress(
    userId: string, 
    pathId: string, 
    updates: Partial<TrainingPathProgress>
  ): Promise<TrainingPathProgress> {
    // First try to update existing record
    const { data: existingProgress } = await supabase
      .from('training_path_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('training_path_id', pathId)
      .single();

    if (existingProgress) {
      // Update existing record
      const { data, error } = await supabase
        .from('training_path_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('training_path_id', pathId)
        .select()
        .single();

      if (error) {
        console.error('Error updating training path progress:', error);
        throw error;
      }

      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('training_path_progress')
        .insert([{
          user_id: userId,
          training_path_id: pathId,
          modules_completed: 0,
          total_modules: 0,
          quiz_attempts: 0,
          status: 'not_started',
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating training path progress:', error);
        throw error;
      }

      return data;
    }
  }

  // Check if user has completed all modules in a training path
  static async hasUserCompletedAllModules(userId: string, pathId: string): Promise<boolean> {
    // Get all modules for this path
    const modules = await this.getModulesForPath(pathId);
    
    if (modules.length === 0) {
      return false;
    }

    // Check if user has completed all modules
    const { data: completedModules, error } = await supabase
      .from('user_progress')
      .select('module_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('module_id', modules.map(m => m.id));

    if (error) {
      console.error('Error checking completed modules:', error);
      throw error;
    }

    return (completedModules?.length || 0) === modules.length;
  }

  // Get quiz for training path
  static async getTrainingPathQuiz(pathId: string): Promise<TrainingPathQuiz | null> {
    const { data, error } = await supabase
      .from('training_path_quizzes')
      .select('*')
      .eq('training_path_id', pathId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching training path quiz:', error);
      throw error;
    }

    return data;
  }

  // Submit quiz attempt for training path
  static async submitTrainingPathQuiz(
    userId: string, 
    pathId: string, 
    answers: number[], 
    score: number
  ): Promise<void> {
    // Get current progress
    let progress = await this.getUserTrainingPathProgress(userId, pathId);
    
    if (!progress) {
      // Create initial progress if it doesn't exist
      progress = await this.updateUserTrainingPathProgress(userId, pathId, {
        modules_completed: 0,
        total_modules: 0,
        quiz_attempts: 0,
        status: 'in_progress'
      });
    }

    // Get quiz to check passing score
    const quiz = await this.getTrainingPathQuiz(pathId);
    const passed = quiz ? score >= quiz.passing_score : false;

    // Update progress with quiz results
    await this.updateUserTrainingPathProgress(userId, pathId, {
      quiz_score: score,
      quiz_attempts: progress.quiz_attempts + 1,
      status: passed ? 'completed' : 'in_progress',
      completed_at: passed ? new Date().toISOString() : undefined
    });
  }

  // Save or update a training path quiz
  static async saveTrainingPathQuiz(
    quizData: Omit<TrainingPathQuiz, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TrainingPathQuiz> {
    // Check if quiz already exists
    const { data: existingQuiz } = await supabase
      .from('training_path_quizzes')
      .select('id')
      .eq('training_path_id', quizData.training_path_id)
      .single();

    if (existingQuiz) {
      // Update existing quiz
      const { data, error } = await supabase
        .from('training_path_quizzes')
        .update({
          ...quizData,
          updated_at: new Date().toISOString()
        })
        .eq('training_path_id', quizData.training_path_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating training path quiz:', error);
        throw error;
      }

      return data;
    } else {
      // Create new quiz
      const { data, error } = await supabase
        .from('training_path_quizzes')
        .insert([{
          ...quizData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating training path quiz:', error);
        throw error;
      }

      return data;
    }
  }

  // Delete a training path quiz
  static async deleteTrainingPathQuiz(pathId: string): Promise<void> {
    const { error } = await supabase
      .from('training_path_quizzes')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('training_path_id', pathId);

    if (error) {
      console.error('Error deleting training path quiz:', error);
      throw error;
    }
  }
}