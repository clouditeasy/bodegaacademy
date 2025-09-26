-- Migration : Transformation des catégories en parcours de formation
-- Date : 2025-09-12
-- Description : Renomme les catégories en parcours de formation et ajoute les nouvelles fonctionnalités

BEGIN;

-- 1. Renommer la table module_categories en training_paths
ALTER TABLE module_categories RENAME TO training_paths;

-- 2. Ajouter les nouvelles colonnes pour les parcours
ALTER TABLE training_paths 
ADD COLUMN target_roles TEXT[],
ADD COLUMN has_end_quiz BOOLEAN DEFAULT true;

-- 3. Créer la table pour les quiz de fin de parcours
CREATE TABLE IF NOT EXISTS training_path_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_path_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]',
    passing_score INTEGER NOT NULL DEFAULT 80,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (training_path_id) REFERENCES training_paths(id) ON DELETE CASCADE
);

-- 4. Créer la table pour suivre les progrès des parcours
CREATE TABLE IF NOT EXISTS training_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    training_path_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    modules_completed INTEGER NOT NULL DEFAULT 0,
    total_modules INTEGER NOT NULL DEFAULT 0,
    quiz_score INTEGER,
    quiz_attempts INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (training_path_id) REFERENCES training_paths(id) ON DELETE CASCADE,
    UNIQUE(user_id, training_path_id)
);

-- 5. Mettre à jour la table modules pour utiliser training_path_id au lieu de module_category
ALTER TABLE modules 
ADD COLUMN training_path_id VARCHAR(255);

-- Copier les données existantes de module_category vers training_path_id
UPDATE modules 
SET training_path_id = module_category 
WHERE module_category IS NOT NULL;

-- 6. Supprimer les anciennes données et insérer les nouveaux parcours
DELETE FROM training_paths;

-- Insérer les nouveaux parcours de formation
INSERT INTO training_paths (id, name, description, icon, color, order_index, is_active, target_roles, has_end_quiz, created_at, updated_at) VALUES
('tronc-commun', 'Tronc Commun', 'Formations obligatoires pour tous les postes', '🌟', 'bg-blue-500', 1, true, ARRAY['all'], true, NOW(), NOW()),
('employe-salle-comptoir', 'Parcours Employé Salle / Comptoir', 'Formation spécialisée pour les employés de salle et comptoir', '🤝', 'bg-purple-500', 2, true, ARRAY['employe_salle', 'employe_comptoir'], true, NOW(), NOW()),
('commis-cuisine', 'Parcours Commis de Cuisine', 'Formation pour les commis de cuisine', '👨‍🍳', 'bg-orange-500', 3, true, ARRAY['commis_cuisine'], true, NOW(), NOW()),
('chef-cuisine', 'Parcours Chef de Cuisine', 'Formation avancée pour les chefs de cuisine', '👨‍🍳', 'bg-red-500', 4, true, ARRAY['chef_cuisine'], true, NOW(), NOW()),
('assistant-manager', 'Parcours Assistant Manager', 'Formation en management pour assistants managers', '👔', 'bg-yellow-500', 5, true, ARRAY['assistant_manager'], true, NOW(), NOW()),
('manager', 'Parcours Manager', 'Formation complète en leadership et gestion d''équipe', '👑', 'bg-green-500', 6, true, ARRAY['manager'], true, NOW(), NOW());

-- 7. Créer les quiz par défaut pour chaque parcours
INSERT INTO training_path_quizzes (training_path_id, title, description, questions, passing_score, max_attempts, is_active, created_at, updated_at) VALUES
('tronc-commun', 'Quiz Final - Tronc Commun', 'Évaluation finale des connaissances du tronc commun', '[{"question":"Quelle est la température de conservation des aliments frais?","options":["0-4°C","5-10°C","10-15°C","15-20°C"],"correct":0}]', 80, 3, true, NOW(), NOW()),
('employe-salle-comptoir', 'Quiz Final - Employé Salle/Comptoir', 'Évaluation finale des compétences de service', '[{"question":"Comment accueillir un client?","options":["Avec un sourire","En silence","Rapidement","Sans regarder"],"correct":0}]', 80, 3, true, NOW(), NOW()),
('commis-cuisine', 'Quiz Final - Commis de Cuisine', 'Évaluation finale des techniques culinaires de base', '[{"question":"Quelle est la température de cuisson de la viande rouge?","options":["50-55°C","60-65°C","70-75°C","80-85°C"],"correct":1}]', 80, 3, true, NOW(), NOW()),
('chef-cuisine', 'Quiz Final - Chef de Cuisine', 'Évaluation finale des techniques culinaires avancées', '[{"question":"Comment gérer une équipe de cuisine?","options":["Par la peur","Par l''exemple","Par l''autorité","Par la distance"],"correct":1}]', 80, 3, true, NOW(), NOW()),
('assistant-manager', 'Quiz Final - Assistant Manager', 'Évaluation finale des compétences de management', '[{"question":"Quelle est la première qualité d''un manager?","options":["L''autorité","L''écoute","La rapidité","La sévérité"],"correct":1}]', 80, 3, true, NOW(), NOW()),
('manager', 'Quiz Final - Manager', 'Évaluation finale du leadership et de la gestion d''équipe', '[{"question":"Comment motiver une équipe?","options":["Par les sanctions","Par la reconnaissance","Par la pression","Par l''isolement"],"correct":1}]', 80, 3, true, NOW(), NOW());

-- 8. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_training_path_progress_user_id ON training_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_path_progress_training_path_id ON training_path_progress(training_path_id);
CREATE INDEX IF NOT EXISTS idx_training_path_progress_status ON training_path_progress(status);
CREATE INDEX IF NOT EXISTS idx_training_path_quizzes_training_path_id ON training_path_quizzes(training_path_id);
CREATE INDEX IF NOT EXISTS idx_modules_training_path_id ON modules(training_path_id);

-- 9. Créer les triggers pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_training_paths_updated_at 
    BEFORE UPDATE ON training_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_path_quizzes_updated_at 
    BEFORE UPDATE ON training_path_quizzes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_path_progress_updated_at 
    BEFORE UPDATE ON training_path_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;