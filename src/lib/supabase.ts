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
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  pdf_url?: string;
  quiz_questions: QuizQuestion[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type QuizQuestion = {
  question: string;
  options: string[];
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