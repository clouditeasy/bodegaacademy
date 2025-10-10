import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Veuillez configurer les variables d\'environnement Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'employee' | 'admin' | 'hr';
  job_role?: string;
  department?: string;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
};

export type TrainingPath = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order_index: number;
  is_active: boolean;
  target_roles?: string[];
  has_end_quiz: boolean;
  created_at: string;
  updated_at: string;
};

export type ModuleCategory = TrainingPath;

export type Module = {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  video_url_ar?: string;  // Vidéo arabe
  pdf_url?: string;
  presentation_url?: string;
  presentation_url_ar?: string;  // Présentation arabe
  presentation_type?: 'pdf' | 'powerpoint';
  presentation_type_ar?: 'pdf' | 'powerpoint';  // Type présentation arabe
  quiz_questions: QuizQuestion[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  training_path_id?: string; // ID du parcours de formation
  target_job_roles?: string[];
  target_departments?: string[];
  is_mandatory: boolean;
  prerequisite_modules?: string[];
  order_index: number;
};

export type QuizQuestion = {
  question: string;
  question_ar?: string;  // Question en arabe
  options: string[];
  options_ar?: string[];  // Options en arabe
  correct: number;
};

export type UserProgress = {
  id: string;
  user_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completed_at?: string;
  attempts: number;
  created_at: string;
  updated_at: string;
};

export type TrainingPathQuiz = {
  id: string;
  training_path_id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passing_score: number;
  max_attempts: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TrainingPathProgress = {
  id: string;
  user_id: string;
  training_path_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  modules_completed: number;
  total_modules: number;
  quiz_score?: number;
  quiz_attempts: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
};