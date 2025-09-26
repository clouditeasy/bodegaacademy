import { supabase } from '../lib/supabase';

export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Migration 1: Add onboarding columns to user_profiles
    const userProfilesMigration = `
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS job_role TEXT,
      ADD COLUMN IF NOT EXISTS department TEXT,
      ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;
    `;

    // Migration 2: Add categorization columns to modules
    const modulesMigration = `
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
      ADD COLUMN IF NOT EXISTS target_job_roles TEXT[],
      ADD COLUMN IF NOT EXISTS target_departments TEXT[],
      ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS prerequisite_modules TEXT[],
      ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
    `;

    console.log('Migration complete! New columns should now be available.');
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}

// Helper function to check if migrations are needed
export async function checkMigrationsStatus() {
  try {
    // Try to query the new columns to see if they exist
    const { data, error } = await supabase
      .from('user_profiles')
      .select('job_role, department, has_completed_onboarding')
      .limit(1);

    if (error) {
      console.log('Migrations needed:', error.message);
      return { migrationsNeeded: true, error };
    }

    console.log('Migrations already applied');
    return { migrationsNeeded: false, data };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return { migrationsNeeded: true, error };
  }
}