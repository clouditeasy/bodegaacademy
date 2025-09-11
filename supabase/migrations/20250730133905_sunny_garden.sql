/*
  # Création du schéma LMS Moojood Academy

  1. Nouvelles Tables
    - `user_profiles` - Profils utilisateurs avec rôles
    - `modules` - Modules de formation avec contenu et quiz
    - `user_progress` - Progression des utilisateurs par module

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques pour gérer l'accès selon les rôles
*/

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'hr')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Table des modules de formation
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  video_url text,
  pdf_url text,
  quiz_questions jsonb NOT NULL DEFAULT '[]',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Table de progression des utilisateurs
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score integer,
  completed_at timestamptz,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- Politiques RLS pour modules
CREATE POLICY "Everyone can read active modules"
  ON modules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage modules"
  ON modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- Politiques RLS pour user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Données de test
INSERT INTO modules (title, description, content, quiz_questions) VALUES
(
  'Introduction à la Sécurité Alimentaire',
  'Module de base sur les principes de la sécurité alimentaire',
  '# Introduction à la Sécurité Alimentaire

La sécurité alimentaire est un enjeu majeur dans l''industrie agroalimentaire. Ce module vous permettra de comprendre les bases essentielles.

## Objectifs du module
- Comprendre les risques alimentaires
- Connaître les bonnes pratiques d''hygiène
- Maîtriser les procédures de contrôle qualité

## Les différents types de risques
1. **Risques biologiques** : bactéries, virus, parasites
2. **Risques chimiques** : pesticides, additifs, contaminants
3. **Risques physiques** : corps étrangers, débris

La formation continue est essentielle pour maintenir les standards de qualité les plus élevés.',
  '[
    {
      "question": "Quels sont les trois types de risques alimentaires principaux ?",
      "options": ["Biologiques, chimiques, physiques", "Naturels, artificiels, industriels", "Internes, externes, mixtes", "Aigus, chroniques, temporaires"],
      "correct": 0
    },
    {
      "question": "Quelle est la température de conservation recommandée pour les produits frais ?",
      "options": ["Entre 0°C et 4°C", "Entre 5°C et 10°C", "Entre -5°C et 0°C", "Entre 10°C et 15°C"],
      "correct": 0
    },
    {
      "question": "Combien de temps peut-on conserver un plat préparé au réfrigérateur ?",
      "options": ["1-2 jours", "3-4 jours", "5-6 jours", "1 semaine"],
      "correct": 1
    },
    {
      "question": "Quelle est la première règle d''hygiène en cuisine ?",
      "options": ["Porter un tablier", "Se laver les mains", "Nettoyer les surfaces", "Vérifier les dates"],
      "correct": 1
    },
    {
      "question": "À quelle fréquence faut-il nettoyer les équipements de cuisine ?",
      "options": ["Une fois par semaine", "Une fois par jour", "Après chaque utilisation", "Une fois par mois"],
      "correct": 2
    },
    {
      "question": "Que signifie HACCP ?",
      "options": ["Hazard Analysis Critical Control Points", "Health And Culinary Control Program", "Hygiene And Cleaning Control Plan", "Health Analysis Culinary Control Points"],
      "correct": 0
    },
    {
      "question": "Quelle est la zone de température dangereuse pour les aliments ?",
      "options": ["0°C à 20°C", "5°C à 65°C", "10°C à 50°C", "-5°C à 10°C"],
      "correct": 1
    },
    {
      "question": "Combien de temps maximum peut durer la décongélation à température ambiante ?",
      "options": ["Il ne faut jamais décongeler à température ambiante", "2 heures maximum", "4 heures maximum", "Toute la nuit"],
      "correct": 0
    },
    {
      "question": "Quelle est la méthode recommandée pour refroidir rapidement un plat chaud ?",
      "options": ["Le laisser à température ambiante", "Le mettre directement au frigo", "Utiliser un bain-marie froid", "Le congeler immédiatement"],
      "correct": 2
    },
    {
      "question": "À quelle température doit-on cuire la volaille pour éliminer les bactéries ?",
      "options": ["65°C", "70°C", "75°C", "80°C"],
      "correct": 2
    }
  ]'
),
(
  'Gestion des Stocks et Approvisionnement',
  'Optimisation de la chaîne d''approvisionnement et gestion des inventaires',
  '# Gestion des Stocks et Approvisionnement

Une gestion efficace des stocks est cruciale pour maintenir la qualité, réduire les coûts et assurer la continuité des opérations.

## Principes de base
- Rotation des stocks (FIFO - First In, First Out)
- Classification ABC des produits
- Calcul des stocks de sécurité
- Optimisation des commandes

## Méthodes de gestion
### FIFO (Premier Entré, Premier Sorti)
Cette méthode garantit l''utilisation des produits les plus anciens en premier, minimisant ainsi les pertes.

### Classification ABC
- **Classe A** : 20% des produits, 80% de la valeur
- **Classe B** : 30% des produits, 15% de la valeur  
- **Classe C** : 50% des produits, 5% de la valeur

La technologie moderne permet un suivi en temps réel des stocks et une optimisation continue des processus.',
  '[
    {
      "question": "Que signifie FIFO ?",
      "options": ["First In, First Out", "Fast In, Fast Out", "Final In, Final Out", "Fresh In, Fresh Out"],
      "correct": 0
    },
    {
      "question": "Dans la classification ABC, quelle classe représente 80% de la valeur ?",
      "options": ["Classe A", "Classe B", "Classe C", "Toutes les classes également"],
      "correct": 0
    },
    {
      "question": "Quel est l''objectif principal du stock de sécurité ?",
      "options": ["Réduire les coûts", "Éviter les ruptures", "Augmenter les ventes", "Simplifier la gestion"],
      "correct": 1
    },
    {
      "question": "Quelle méthode permet de calculer la quantité économique de commande ?",
      "options": ["Méthode ABC", "Formule de Wilson", "Méthode FIFO", "Analyse de Pareto"],
      "correct": 1
    },
    {
      "question": "À quelle fréquence faut-il faire l''inventaire des produits frais ?",
      "options": ["Quotidiennement", "Hebdomadairement", "Mensuellement", "Trimestriellement"],
      "correct": 0
    },
    {
      "question": "Quel indicateur mesure l''efficacité de la rotation des stocks ?",
      "options": ["Taux de marge", "Taux de rotation", "Taux de croissance", "Taux de satisfaction"],
      "correct": 1
    },
    {
      "question": "Comment optimiser l''espace de stockage ?",
      "options": ["Empiler au maximum", "Organiser par fréquence d''utilisation", "Stocker aléatoirement", "Minimiser les allées"],
      "correct": 1
    },
    {
      "question": "Quel est le coût caché le plus important des stocks ?",
      "options": ["Le coût d''achat", "Le coût de stockage", "Le coût d''obsolescence", "Le coût de transport"],
      "correct": 2
    },
    {
      "question": "Quelle technologie aide le plus dans la gestion moderne des stocks ?",
      "options": ["Codes-barres/RFID", "Tableurs Excel", "Cahiers papier", "Mémoire humaine"],
      "correct": 0
    },
    {
      "question": "Quel est le niveau de stock optimal ?",
      "options": ["Le plus bas possible", "Le plus haut possible", "Entre stock de sécurité et stock maximum", "50% de la capacité"],
      "correct": 2
    }
  ]'
);