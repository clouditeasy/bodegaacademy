-- Categories Migration: Create module_categories table
-- Execute this in Supabase SQL Editor

-- Create module_categories table
CREATE TABLE IF NOT EXISTS module_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO module_categories (id, name, description, icon, color, order_index) VALUES
  ('marhaba', 'Module Marhaba', 'Module d''accueil et d''intégration pour nouveaux employés', '👋', 'bg-blue-500', 1),
  ('hygiene', 'Module Hygiène', 'Formation sur les bonnes pratiques d''hygiène alimentaire', '🧽', 'bg-green-500', 2),
  ('securite', 'Module Sécurité', 'Sécurité au travail et prévention des accidents', '🛡️', 'bg-red-500', 3),
  ('qualite', 'Module Qualité', 'Standards de qualité et contrôle qualité', '⭐', 'bg-yellow-500', 4),
  ('service', 'Module Service Client', 'Excellence du service et relation client', '🤝', 'bg-purple-500', 5),
  ('reglementaire', 'Module Réglementaire', 'Conformité réglementaire et légale', '📋', 'bg-indigo-500', 6),
  ('technique', 'Module Technique', 'Compétences techniques spécialisées', '🔧', 'bg-orange-500', 7),
  ('management', 'Module Management', 'Formation en gestion d''équipe et leadership', '👥', 'bg-teal-500', 8)
ON CONFLICT (id) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_module_categories_order ON module_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_module_categories_active ON module_categories(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE module_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read categories
CREATE POLICY "Allow authenticated users to read categories" ON module_categories
  FOR SELECT TO authenticated USING (true);

-- Only allow admins to modify categories (you can adjust this based on your user role system)
CREATE POLICY "Allow admins to manage categories" ON module_categories
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );