-- Migration: Align training paths with Bodega Academy structure
-- Date: 2025-01-26
-- Description: Create training paths aligned with retail/warehouse operations

BEGIN;

-- 1. Create training_paths table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_paths (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(50),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target_roles TEXT[],
    has_end_quiz BOOLEAN DEFAULT true,
    estimated_duration INTEGER DEFAULT 0, -- in hours
    priority VARCHAR(10) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create training_path_quizzes table if it doesn't exist
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

-- 3. Create training_path_progress table if it doesn't exist
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

-- 4. Update modules table to include training_path_id if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='training_path_id') THEN
        ALTER TABLE modules ADD COLUMN training_path_id VARCHAR(255);
    END IF;
END $$;

-- 5. Clear existing training paths and insert Bodega Academy aligned ones
DELETE FROM training_path_quizzes;
DELETE FROM training_path_progress;
DELETE FROM training_paths;

-- 6. Insert Bodega Academy training paths
INSERT INTO training_paths (id, name, description, icon, color, order_index, is_active, target_roles, has_end_quiz, estimated_duration, priority, created_at, updated_at) VALUES
('tronc-commun', 'Tronc Commun', 'Formations obligatoires pour tous les employés de Bodega Academy', '🌟', 'bg-blue-500', 1, true, ARRAY['all'], true, 8, 'high', NOW(), NOW()),
('operations-magasin', 'Opérations Magasin', 'Formation pour les employés du magasin et service client', '🛒', 'bg-green-500', 2, true, ARRAY['Store Manager', 'Supervisor', 'Cashier', 'Sales Associate', 'Customer Service'], true, 12, 'high', NOW(), NOW()),
('operations-entrepot', 'Opérations Entrepôt', 'Formation pour les employés de l''entrepôt et logistique', '📦', 'bg-orange-500', 3, true, ARRAY['Warehouse Manager', 'Inventory Specialist', 'Picker/Packer', 'Receiving Clerk', 'Shipping Clerk'], true, 14, 'high', NOW(), NOW()),
('management', 'Management et Leadership', 'Formation avancée pour les managers et superviseurs', '👑', 'bg-purple-500', 4, true, ARRAY['Store Manager', 'Warehouse Manager', 'Supervisor'], true, 16, 'high', NOW(), NOW()),
('fonctions-support', 'Fonctions Support', 'Formation pour les équipes administratives et support', '💼', 'bg-indigo-500', 5, true, ARRAY['HR', 'Administration', 'Finance', 'Marketing', 'IT Support'], true, 10, 'medium', NOW(), NOW()),
('securite-qualite', 'Sécurité et Qualité', 'Formation transversale sur la sécurité et la qualité', '🛡️', 'bg-red-500', 6, true, ARRAY['all'], true, 6, 'high', NOW(), NOW());

-- 7. Insert training path quizzes
INSERT INTO training_path_quizzes (training_path_id, title, description, questions, passing_score, max_attempts, is_active, created_at, updated_at) VALUES
('tronc-commun', 'Quiz Final - Tronc Commun', 'Évaluation des connaissances fondamentales de Bodega Academy',
'[
  {"question":"Quelles sont les valeurs principales de Bodega Academy?","options":["Qualité, Service, Innovation","Prix, Rapidité, Quantité","Profit, Croissance, Expansion","Tradition, Routine, Conformité"],"correct":0},
  {"question":"Que faire en cas d''accident au travail?","options":["Continuer à travailler","Prévenir immédiatement le responsable","Attendre la fin du service","Rentrer chez soi"],"correct":1},
  {"question":"Comment accueillir un client chez Bodega Academy?","options":["Avec professionnalisme et courtoisie","Rapidement sans sourire","En ignorant sa présence","Seulement s''il achète beaucoup"],"correct":0}
]', 80, 3, true, NOW(), NOW()),

('operations-magasin', 'Quiz Final - Opérations Magasin', 'Évaluation des compétences en opérations magasin',
'[
  {"question":"Quelle est la priorité lors de l''ouverture du magasin?","options":["Vérifier la caisse","Contrôler la propreté et la présentation","Compter les stocks","Prendre un café"],"correct":1},
  {"question":"Comment traiter une réclamation client?","options":["L''ignorer","Écouter et proposer une solution","Dire que ce n''est pas notre faute","Renvoyer vers un collègue"],"correct":1},
  {"question":"Quelle est la procédure pour un retour de marchandise?","options":["Refuser systématiquement","Vérifier les conditions et suivre la procédure","Accepter tout sans vérification","Demander un justificatif médical"],"correct":1}
]', 80, 3, true, NOW(), NOW()),

('operations-entrepot', 'Quiz Final - Opérations Entrepôt', 'Évaluation des compétences en logistique et entreposage',
'[
  {"question":"Quelle est la règle FIFO?","options":["First In, First Out","Fast In, Fast Out","Full In, Full Out","Final In, Final Out"],"correct":0},
  {"question":"Comment porter une charge lourde?","options":["Dos courbé, bras tendus","Dos droit, jambes fléchies","Dos courbé, jambes tendues","N''importe comment"],"correct":1},
  {"question":"Que vérifier à la réception des marchandises?","options":["Seulement la quantité","Quantité, qualité et conformité","Rien, faire confiance","Seulement l''emballage"],"correct":1}
]', 80, 3, true, NOW(), NOW()),

('management', 'Quiz Final - Management', 'Évaluation des compétences en leadership et gestion d''équipe',
'[
  {"question":"Quelle est la qualité principale d''un bon manager?","options":["L''autorité","L''écoute et la communication","La sévérité","L''indifférence"],"correct":1},
  {"question":"Comment motiver une équipe?","options":["Par la peur","Par la reconnaissance et l''encouragement","Par les sanctions","Par l''isolement"],"correct":1},
  {"question":"Comment gérer un conflit dans l''équipe?","options":["L''ignorer","Écouter les parties et médier","Prendre parti","Sanctionner tout le monde"],"correct":1}
]', 80, 3, true, NOW(), NOW()),

('fonctions-support', 'Quiz Final - Fonctions Support', 'Évaluation des compétences en support administratif',
'[
  {"question":"Quelle est la priorité dans la gestion documentaire?","options":["Rapidité","Organisation et traçabilité","Quantité","Décoration"],"correct":1},
  {"question":"Comment collaborer efficacement avec d''autres services?","options":["En imposant ses idées","En communiquant clairement et régulièrement","En travaillant seul","En évitant les contacts"],"correct":1},
  {"question":"Que faire en cas de problème technique?","options":["Paniquer","Suivre la procédure d''escalade","Arrêter de travailler","Demander à un collègue au hasard"],"correct":1}
]', 80, 3, true, NOW(), NOW()),

('securite-qualite', 'Quiz Final - Sécurité et Qualité', 'Évaluation des connaissances en sécurité et qualité',
'[
  {"question":"Que faire si vous observez une situation dangereuse?","options":["La signaler immédiatement","L''ignorer si ce n''est pas votre secteur","Attendre qu''un accident arrive","En parler à la pause"],"correct":0},
  {"question":"Quelle est la température de stockage des produits frais?","options":["Entre 0 et 4°C","Entre 5 et 10°C","Température ambiante","Peu importe"],"correct":0},
  {"question":"Comment nettoyer une surface de travail?","options":["Avec n''importe quel produit","Selon la procédure établie","Juste avec de l''eau","Pas besoin de nettoyer"],"correct":1}
]', 80, 3, true, NOW(), NOW());

-- 8. Update existing modules to align with new training paths (example updates)
-- Note: This assumes you have existing modules that need to be categorized

-- Assign modules to tronc-commun (common training)
UPDATE modules SET training_path_id = 'tronc-commun' WHERE title ILIKE '%bienvenue%' OR title ILIKE '%culture%' OR title ILIKE '%valeurs%';

-- Assign modules to operations-magasin
UPDATE modules SET training_path_id = 'operations-magasin' WHERE title ILIKE '%service client%' OR title ILIKE '%vente%' OR title ILIKE '%caisse%';

-- Assign modules to operations-entrepot
UPDATE modules SET training_path_id = 'operations-entrepot' WHERE title ILIKE '%entrepôt%' OR title ILIKE '%stock%' OR title ILIKE '%logistique%';

-- Assign modules to management
UPDATE modules SET training_path_id = 'management' WHERE title ILIKE '%management%' OR title ILIKE '%leadership%' OR title ILIKE '%gestion équipe%';

-- Assign modules to functions-support
UPDATE modules SET training_path_id = 'fonctions-support' WHERE title ILIKE '%administratif%' OR title ILIKE '%bureautique%' OR title ILIKE '%support%';

-- Assign modules to security-quality
UPDATE modules SET training_path_id = 'securite-qualite' WHERE title ILIKE '%sécurité%' OR title ILIKE '%qualité%' OR title ILIKE '%hygiène%';

-- 9. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_training_paths_order ON training_paths(order_index);
CREATE INDEX IF NOT EXISTS idx_training_paths_active ON training_paths(is_active);
CREATE INDEX IF NOT EXISTS idx_training_path_progress_user ON training_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_path_progress_path ON training_path_progress(training_path_id);
CREATE INDEX IF NOT EXISTS idx_training_path_progress_status ON training_path_progress(status);
CREATE INDEX IF NOT EXISTS idx_training_path_quizzes_path ON training_path_quizzes(training_path_id);
CREATE INDEX IF NOT EXISTS idx_modules_training_path ON modules(training_path_id);

-- 10. Create or update triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_training_paths_updated_at ON training_paths;
CREATE TRIGGER update_training_paths_updated_at
    BEFORE UPDATE ON training_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_path_quizzes_updated_at ON training_path_quizzes;
CREATE TRIGGER update_training_path_quizzes_updated_at
    BEFORE UPDATE ON training_path_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_path_progress_updated_at ON training_path_progress;
CREATE TRIGGER update_training_path_progress_updated_at
    BEFORE UPDATE ON training_path_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;