import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, ArrowRight, Play } from 'lucide-react';
import { supabase, UserProgress } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface WelcomeModuleProps {
  onComplete: () => void;
  userProfile: any;
}

export function WelcomeModule({ onComplete, userProfile }: WelcomeModuleProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  
  const totalSteps = 4;

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      // First, find the welcome module ID
      const { data: welcomeModule, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('category', 'welcome')
        .eq('is_mandatory', true)
        .single();

      if (moduleError || !welcomeModule) {
        console.log('Welcome module not found, will create progress when needed');
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', welcomeModule.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress(data);
        // Si le module est déjà en cours, reprendre à l'étape suivante
        if (data.status === 'in_progress') {
          setCurrentStep(2);
        }
      }
    } catch (error) {
      console.error('Error fetching welcome module progress:', error);
    }
  };

  const updateProgress = async (step: number, completed: boolean = false) => {
    if (!user) return;

    setLoading(true);
    try {
      // First, find the welcome module ID
      const { data: welcomeModule, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('category', 'welcome')
        .eq('is_mandatory', true)
        .single();

      if (moduleError || !welcomeModule) {
        console.error('Welcome module not found:', moduleError);
        onComplete(); // Continue anyway
        return;
      }

      const status = completed ? 'completed' : 'in_progress';
      const score = completed ? 100 : null;
      
      const progressData = {
        user_id: user.id,
        module_id: welcomeModule.id,
        status,
        score,
        attempts: 1,
        updated_at: new Date().toISOString(),
        ...(completed && { completed_at: new Date().toISOString() })
      };

      if (progress) {
        const { error } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', progress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            ...progressData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      if (completed) {
        // Mark welcome module as completed locally
        localStorage.setItem(`welcome_completed_${user.id}`, 'true');
        onComplete();
      } else {
        setCurrentStep(step + 1);
      }
    } catch (error) {
      console.error('Error updating welcome module progress:', error);
      // Mark as completed locally even if DB update failed
      if (completed) {
        localStorage.setItem(`welcome_completed_${user.id}`, 'true');
      }
      // Continue anyway to not block the user
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const getJobRoleDisplayName = (jobRole: string) => {
    const jobRoles: Record<string, string> = {
      // Kouzina
      'production': 'Production',
      'commercialisation': 'Commercialisation', 
      'qualite': 'Qualité',
      'conformite': 'Conformité',
      'emballage': 'Emballage',
      'rh': 'Ressources Humaines',
      'admin': 'Administration',
      'comptabilite': 'Comptabilité',
      // Points de Vente
      'manager': 'Manager',
      'serveur': 'Serveur',
      'barista': 'Barista',
      'commis_cuisine': 'Commis de Cuisine',
      'chef_cuisine': 'Chef de Cuisine',
      'livreur': 'Livreur'
    };
    return jobRoles[jobRole] || jobRole;
  };

  const getJobRoleWelcomeMessage = (jobRole: string) => {
    const messages: Record<string, string> = {
      // Kouzina (Cuisine Centrale)
      'production': 'En tant que membre de l\'équipe Production, vous êtes au cœur de la création culinaire Bodega. Découvrez nos modules sur les techniques de préparation, l\'hygiène alimentaire et l\'optimisation des processus de production.',

      'commercialisation': 'Votre rôle en Commercialisation est essentiel pour faire rayonner la marque Bodega. Accédez à nos formations en développement commercial, négociation avec les partenaires et stratégies de croissance.',

      'qualite': 'En tant que responsable Qualité, vous garantissez l\'excellence de nos produits. Explorez nos modules sur les standards qualité, les audits, les certifications et les bonnes pratiques alimentaires.',

      'conformite': 'Votre expertise en Conformité assure le respect des réglementations. Découvrez nos formations sur la réglementation alimentaire, la traçabilité et les normes d\'hygiène.',

      'emballage': 'L\'équipe Emballage donne la première impression de nos produits. Apprenez les techniques de conditionnement, les matériaux durables et la présentation optimale.',

      'rh': 'Vous façonnez la culture et l\'équipe Bodega. Explorez nos formations en gestion des talents, recrutement dans la restauration et développement des compétences.',

      'admin': 'Votre support administratif est vital pour nos opérations. Accédez aux modules sur la gestion administrative, les outils numériques et l\'organisation efficace.',

      'comptabilite': 'Votre expertise financière guide nos décisions stratégiques. Découvrez nos formations en comptabilité restaurant, analyse des coûts et contrôle budgétaire.',

      // Points de Vente
      'manager': 'En tant que Manager, vous dirigez l\'expérience client au quotidien. Explorez nos modules sur le leadership, la gestion d\'équipe restaurant et l\'optimisation des performances.',

      'serveur': 'Vous êtes l\'ambassadeur de l\'expérience Bodega auprès de nos clients. Découvrez nos formations en service excellence, techniques de vente et relation client.',

      'barista': 'Votre art du café fait la différence dans l\'expérience client. Accédez à nos modules sur les techniques barista, la culture du café et la création de boissons signature.',

      'commis_cuisine': 'Vous êtes la base solide de notre cuisine. Apprenez les fondamentaux culinaires, l\'hygiène en cuisine et les techniques de préparation Bodega.',

      'chef_cuisine': 'Votre créativité culinaire définit notre identité gustative. Explorez nos modules sur l\'innovation culinaire, la gestion de cuisine et les standards Bodega.',

      'livreur': 'Vous complétez l\'expérience Bodega jusqu\'à domicile. Découvrez nos formations sur la logistique de livraison, le service client mobile et la sécurité routière.'
    };
    return messages[jobRole] || 'Nous sommes ravis de vous accueillir dans la famille Bodega et de vous accompagner dans votre parcours de formation personnalisé.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo-bodega.jpg"
            alt="Bodega Academy Logo"
            className="w-20 h-20 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Module de Bienvenue
          </h1>
          <p className="text-gray-600">
            Votre première étape vers l'excellence
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
            <span className="text-sm text-gray-500">
              Étape {currentStep} sur {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenue {userProfile?.full_name} !
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Nous sommes ravis de vous accueillir dans la famille Bodega Academy.
                Ce module de bienvenue vous présentera notre approche de la formation
                et vous guidera vers les ressources les plus adaptées à votre rôle.
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Votre profil :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-gray-600">Métier :</span>
                    <p className="font-medium text-gray-900">
                      {getJobRoleDisplayName(userProfile?.job_role)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Département :</span>
                    <p className="font-medium text-gray-900">
                      {userProfile?.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Votre Parcours Personnalisé
              </h2>
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-3">
                    {getJobRoleDisplayName(userProfile?.job_role)}
                  </h3>
                  <p className="text-orange-100">
                    {getJobRoleWelcomeMessage(userProfile?.job_role)}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Modules Obligatoires</h4>
                    <p className="text-sm text-gray-600">Formations essentielles pour tous</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Modules Métier</h4>
                    <p className="text-sm text-gray-600">Spécialisés pour votre rôle</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Play className="h-6 w-6 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Modules Optionnels</h4>
                    <p className="text-sm text-gray-600">Pour approfondir vos compétences</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Comment ça marche ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Suivez vos modules recommandés</h3>
                    <p className="text-gray-600">
                      Votre dashboard vous présente les formations prioritaires selon votre profil.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Apprenez à votre rythme</h3>
                    <p className="text-gray-600">
                      Chaque module combine vidéos, documents et quiz interactifs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Validez vos acquis</h3>
                    <p className="text-gray-600">
                      Obtenez vos certificats et suivez votre progression en temps réel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Félicitations !
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Vous avez terminé votre module de bienvenue. 
                Vous êtes maintenant prêt(e) à commencer votre parcours de formation personnalisé.
              </p>
              <div className="bg-orange-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">Prochaines étapes :</h3>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Accédez à votre dashboard personnalisé</li>
                  <li>✓ Découvrez vos modules recommandés</li>
                  <li>✓ Commencez par les formations prioritaires</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center mt-8">
            {currentStep < totalSteps ? (
              <button
                onClick={() => updateProgress(currentStep)}
                disabled={loading}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => updateProgress(currentStep, true)}
                disabled={loading}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Terminer le module
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}