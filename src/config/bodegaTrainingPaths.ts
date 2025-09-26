// Configuration des parcours de formation Bodega Academy (Retail/Warehouse)

export interface TrainingPath {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  targetRoles: string[];
  hasEndQuiz: boolean;
  estimatedDuration: number; // en heures
  priority: 'high' | 'medium' | 'low';
}

export const trainingPaths: TrainingPath[] = [
  {
    id: 'tronc-commun',
    name: 'Tronc Commun',
    description: 'Formations obligatoires pour tous les employés de Bodega Academy',
    color: 'bg-blue-500',
    icon: '🌟',
    order: 1,
    targetRoles: ['all'],
    hasEndQuiz: true,
    estimatedDuration: 8,
    priority: 'high'
  },
  {
    id: 'operations-magasin',
    name: 'Opérations Magasin',
    description: 'Formation pour les employés du magasin et service client',
    color: 'bg-green-500',
    icon: '🛒',
    order: 2,
    targetRoles: ['Store Manager', 'Supervisor', 'Cashier', 'Sales Associate', 'Customer Service'],
    hasEndQuiz: true,
    estimatedDuration: 12,
    priority: 'high'
  },
  {
    id: 'operations-entrepot',
    name: 'Opérations Entrepôt',
    description: 'Formation pour les employés de l\'entrepôt et logistique',
    color: 'bg-orange-500',
    icon: '📦',
    order: 3,
    targetRoles: ['Warehouse Manager', 'Inventory Specialist', 'Picker/Packer', 'Receiving Clerk', 'Shipping Clerk'],
    hasEndQuiz: true,
    estimatedDuration: 14,
    priority: 'high'
  },
  {
    id: 'management',
    name: 'Management et Leadership',
    description: 'Formation avancée pour les managers et superviseurs',
    color: 'bg-purple-500',
    icon: '👑',
    order: 4,
    targetRoles: ['Store Manager', 'Warehouse Manager', 'Supervisor'],
    hasEndQuiz: true,
    estimatedDuration: 16,
    priority: 'high'
  },
  {
    id: 'fonctions-support',
    name: 'Fonctions Support',
    description: 'Formation pour les équipes administratives et support',
    color: 'bg-indigo-500',
    icon: '💼',
    order: 5,
    targetRoles: ['HR', 'Administration', 'Finance', 'Marketing', 'IT Support'],
    hasEndQuiz: true,
    estimatedDuration: 10,
    priority: 'medium'
  },
  {
    id: 'securite-qualite',
    name: 'Sécurité et Qualité',
    description: 'Formation transversale sur la sécurité et la qualité',
    color: 'bg-red-500',
    icon: '🛡️',
    order: 6,
    targetRoles: ['all'],
    hasEndQuiz: true,
    estimatedDuration: 6,
    priority: 'high'
  }
];

// Modules détaillés par parcours pour Bodega Academy
export const trainingPathModules = {
  'tronc-commun': [
    'module-bienvenue-bodega',
    'culture-entreprise-bodega',
    'valeurs-et-mission',
    'procedures-securite-base',
    'communication-interne'
  ],
  'operations-magasin': [
    'service-client-excellence',
    'techniques-vente-retail',
    'gestion-caisse-paiements',
    'merchandising-presentation',
    'gestion-reclamations',
    'hygiene-proprete-magasin'
  ],
  'operations-entrepot': [
    'reception-marchandises',
    'stockage-organisation',
    'preparation-commandes',
    'expedition-livraisons',
    'inventaire-comptage',
    'securite-entrepot',
    'manipulation-manutention'
  ],
  'management': [
    'leadership-equipes',
    'gestion-performance',
    'planification-organisation',
    'resolution-conflits',
    'coaching-developpement',
    'communication-manageriale'
  ],
  'fonctions-support': [
    'outils-bureautiques',
    'gestion-documentaire',
    'procedures-administratives',
    'collaboration-inter-services',
    'outils-digitaux'
  ],
  'securite-qualite': [
    'securite-au-travail',
    'premiers-secours',
    'normes-qualite',
    'gestion-incidents',
    'protection-environnement'
  ]
};

// Fonction utilitaire pour obtenir un parcours par ID
export const getTrainingPathById = (pathId: string): TrainingPath | undefined => {
  return trainingPaths.find(path => path.id === pathId);
};

// Fonction pour obtenir tous les parcours triés par ordre
export const getSortedTrainingPaths = (): TrainingPath[] => {
  return [...trainingPaths].sort((a, b) => a.order - b.order);
};

// Fonction pour obtenir les parcours adaptés à un rôle
export const getTrainingPathsForRole = (role: string): TrainingPath[] => {
  return trainingPaths.filter(path =>
    path.targetRoles.includes('all') ||
    path.targetRoles.includes(role)
  ).sort((a, b) => a.order - b.order);
};

// Fonction pour obtenir les modules d'un parcours
export const getModulesForPath = (pathId: string): string[] => {
  return trainingPathModules[pathId as keyof typeof trainingPathModules] || [];
};

// Fonction pour obtenir tous les modules requis pour un rôle
export const getAllRequiredModules = (jobRole: string): string[] => {
  const userPaths = getTrainingPathsForRole(jobRole);
  const allModules: string[] = [];

  userPaths.forEach(path => {
    const modules = getModulesForPath(path.id);
    allModules.push(...modules);
  });

  return [...new Set(allModules)]; // Remove duplicates
};

// Types et constantes pour la compatibilité
export type ModuleCategory = TrainingPath;
export const moduleCategories = trainingPaths;
export const getCategoryById = getTrainingPathById;
export const getSortedCategories = getSortedTrainingPaths;