// Configuration des parcours de formation par métier Bodega Academy (Retail/Warehouse)

export interface JobRoleTrainingPath {
  jobRole: string;
  mandatoryModules: string[];
  recommendedModules: string[];
  optionalModules: string[];
  estimatedDuration: number; // en heures
  priority: 'high' | 'medium' | 'low';
}

export const jobRoleTrainingPaths: JobRoleTrainingPath[] = [
  // STORE OPERATIONS
  {
    jobRole: 'Store Manager',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'leadership-equipes',
      'gestion-performance',
      'service-client-excellence',
      'procedures-securite-base'
    ],
    recommendedModules: [
      'planification-organisation',
      'coaching-developpement',
      'resolution-conflits',
      'merchandising-presentation'
    ],
    optionalModules: [
      'formation-formateur',
      'communication-avancee',
      'anglais-professionnel'
    ],
    estimatedDuration: 20,
    priority: 'high'
  },

  {
    jobRole: 'Supervisor',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'leadership-equipes',
      'gestion-performance',
      'service-client-excellence',
      'procedures-securite-base'
    ],
    recommendedModules: [
      'coaching-developpement',
      'resolution-conflits',
      'gestion-planning',
      'motivation-personnel'
    ],
    optionalModules: [
      'communication-efficace',
      'gestion-stress',
      'techniques-formation'
    ],
    estimatedDuration: 16,
    priority: 'high'
  },

  {
    jobRole: 'Cashier',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'gestion-caisse-paiements',
      'service-client-excellence',
      'procedures-securite-base',
      'hygiene-proprete-magasin'
    ],
    recommendedModules: [
      'techniques-vente-retail',
      'gestion-reclamations',
      'upselling-cross-selling',
      'connaissance-produits'
    ],
    optionalModules: [
      'langues-etrangeres',
      'service-personnalise',
      'digital-retail'
    ],
    estimatedDuration: 12,
    priority: 'high'
  },

  {
    jobRole: 'Sales Associate',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'service-client-excellence',
      'techniques-vente-retail',
      'merchandising-presentation',
      'procedures-securite-base'
    ],
    recommendedModules: [
      'connaissance-produits',
      'gestion-reclamations',
      'upselling-cross-selling',
      'hygiene-proprete-magasin'
    ],
    optionalModules: [
      'langues-etrangeres',
      'art-presentation',
      'service-personnalise'
    ],
    estimatedDuration: 14,
    priority: 'high'
  },

  {
    jobRole: 'Customer Service',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'service-client-excellence',
      'gestion-reclamations',
      'communication-interne',
      'procedures-securite-base'
    ],
    recommendedModules: [
      'resolution-conflits',
      'techniques-negociation',
      'connaissance-produits',
      'service-personnalise'
    ],
    optionalModules: [
      'psychologie-client',
      'langues-etrangeres',
      'mediation-commerciale'
    ],
    estimatedDuration: 12,
    priority: 'high'
  },

  // WAREHOUSE OPERATIONS
  {
    jobRole: 'Warehouse Manager',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'leadership-equipes',
      'gestion-performance',
      'reception-marchandises',
      'procedures-securite-base'
    ],
    recommendedModules: [
      'optimisation-processus',
      'gestion-planning',
      'securite-entrepot',
      'coaching-developpement'
    ],
    optionalModules: [
      'formation-formateur',
      'lean-management',
      'outils-digitaux'
    ],
    estimatedDuration: 18,
    priority: 'high'
  },

  {
    jobRole: 'Inventory Specialist',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'inventaire-comptage',
      'stockage-organisation',
      'procedures-securite-base',
      'outils-bureautiques'
    ],
    recommendedModules: [
      'optimisation-stockage',
      'gestion-pertes',
      'analyse-donnees',
      'procedures-qualite'
    ],
    optionalModules: [
      'outils-avances-inventaire',
      'amelioration-continue',
      'formation-utilisateurs'
    ],
    estimatedDuration: 14,
    priority: 'high'
  },

  {
    jobRole: 'Picker/Packer',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'preparation-commandes',
      'manipulation-manutention',
      'procedures-securite-base',
      'hygiene-entrepot'
    ],
    recommendedModules: [
      'optimisation-picking',
      'qualite-emballage',
      'organisation-poste',
      'travail-equipe'
    ],
    optionalModules: [
      'specialisation-secteurs',
      'techniques-emballage-avancees',
      'prevention-blessures'
    ],
    estimatedDuration: 10,
    priority: 'medium'
  },

  {
    jobRole: 'Receiving Clerk',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'reception-marchandises',
      'controle-qualite',
      'procedures-securite-base',
      'traçabilite-produits'
    ],
    recommendedModules: [
      'gestion-fournisseurs',
      'procedures-retour',
      'outils-bureautiques',
      'communication-interne'
    ],
    optionalModules: [
      'negociation-fournisseurs',
      'audit-reception',
      'gestion-litiges'
    ],
    estimatedDuration: 12,
    priority: 'medium'
  },

  {
    jobRole: 'Shipping Clerk',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'expedition-livraisons',
      'preparation-envois',
      'procedures-securite-base',
      'gestion-transporteurs'
    ],
    recommendedModules: [
      'optimisation-chargement',
      'gestion-urgences',
      'suivi-livraisons',
      'service-client-logistique'
    ],
    optionalModules: [
      'negociation-transporteurs',
      'logistique-internationale',
      'eco-logistique'
    ],
    estimatedDuration: 12,
    priority: 'medium'
  },

  // SUPPORT FUNCTIONS
  {
    jobRole: 'HR',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'droit-travail-maroc',
      'recrutement-retail',
      'gestion-personnel',
      'formation-continue'
    ],
    recommendedModules: [
      'evaluation-performance',
      'resolution-conflits',
      'motivation-equipes',
      'outils-rh-digitaux'
    ],
    optionalModules: [
      'coaching-professionnel',
      'psychologie-travail',
      'negociation-sociale',
      'wellbeing-au-travail'
    ],
    estimatedDuration: 18,
    priority: 'high'
  },

  {
    jobRole: 'Administration',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'procedures-administratives',
      'outils-bureautiques',
      'gestion-documentaire',
      'communication-interne'
    ],
    recommendedModules: [
      'optimisation-processus',
      'outils-collaboratifs',
      'gestion-projets',
      'relation-fournisseurs'
    ],
    optionalModules: [
      'automatisation-taches',
      'analyse-donnees',
      'formation-utilisateurs',
      'innovation-administrative'
    ],
    estimatedDuration: 12,
    priority: 'medium'
  },

  {
    jobRole: 'Finance',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'comptabilite-retail',
      'gestion-tresorerie',
      'controle-budgetaire',
      'fiscalite-entreprise'
    ],
    recommendedModules: [
      'analyse-financiere',
      'outils-comptables',
      'audit-interne',
      'reporting-financier'
    ],
    optionalModules: [
      'comptabilite-analytique',
      'consolidation-comptes',
      'normes-ifrs',
      'business-intelligence'
    ],
    estimatedDuration: 16,
    priority: 'high'
  },

  {
    jobRole: 'Marketing',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'marketing-retail',
      'communication-digitale',
      'analyse-marche',
      'gestion-marque'
    ],
    recommendedModules: [
      'marketing-digital-avance',
      'reseaux-sociaux',
      'analytics-web',
      'creation-contenu'
    ],
    optionalModules: [
      'design-graphique',
      'video-marketing',
      'marketing-influence',
      'e-commerce'
    ],
    estimatedDuration: 14,
    priority: 'medium'
  },

  {
    jobRole: 'IT Support',
    mandatoryModules: [
      'module-bienvenue-bodega',
      'support-technique',
      'securite-informatique',
      'maintenance-systemes',
      'formation-utilisateurs'
    ],
    recommendedModules: [
      'reseaux-informatiques',
      'gestion-incidents',
      'backup-restauration',
      'outils-monitoring'
    ],
    optionalModules: [
      'cybersecurite-avancee',
      'cloud-computing',
      'automatisation-it',
      'gestion-projets-it'
    ],
    estimatedDuration: 16,
    priority: 'medium'
  }
];

// Fonction utilitaire pour obtenir le parcours d'un métier
export const getTrainingPathForJobRole = (jobRole: string): JobRoleTrainingPath | undefined => {
  return jobRoleTrainingPaths.find(path => path.jobRole === jobRole);
};

// Fonction pour obtenir tous les modules requis pour un métier
export const getAllRequiredModules = (jobRole: string): string[] => {
  const path = getTrainingPathForJobRole(jobRole);
  if (!path) return [];

  return [...path.mandatoryModules, ...path.recommendedModules];
};

// Fonction pour obtenir seulement les modules obligatoires
export const getMandatoryModules = (jobRole: string): string[] => {
  const path = getTrainingPathForJobRole(jobRole);
  return path ? path.mandatoryModules : [];
};

// Fonction pour obtenir tous les rôles disponibles
export const getAllJobRoles = (): string[] => {
  return jobRoleTrainingPaths.map(path => path.jobRole);
};