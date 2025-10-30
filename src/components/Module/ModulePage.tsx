import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText, Award, CheckCircle } from 'lucide-react';
import { Module, UserProgress, supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Quiz } from './Quiz';
import { VideoEmbed } from './VideoEmbed';
import { PresentationViewer } from './PresentationViewer';
import { azureStorage } from '../../lib/azureStorage';
import { MultiPageModule } from './MultiPageModule';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';
import { useTranslation } from '../../hooks/useTranslation';
import 'react-quill/dist/quill.snow.css';

interface ModulePageProps {
  module: Module;
  onBack: () => void;
}

export function ModulePage({ module, onBack }: ModulePageProps) {
  // Si le module a des pages multiples, utiliser le nouveau composant
  if (module.has_multiple_pages && module.pages && module.pages.length > 0) {
    return <MultiPageModule module={module} onBack={onBack} />;
  }

  // Sinon, utiliser l'ancien système (module simple avec quiz global)
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'content' | 'quiz'>('content');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainingPathName, setTrainingPathName] = useState<string>('');

  // Déterminer quelle vidéo/présentation afficher selon la langue avec fallback
  const videoUrl = language === 'ar' && module.video_url_ar
    ? module.video_url_ar
    : module.video_url;

  const presentationUrl = language === 'ar' && module.presentation_url_ar
    ? module.presentation_url_ar
    : module.presentation_url;

  const presentationType = language === 'ar' && module.presentation_type_ar
    ? module.presentation_type_ar
    : module.presentation_type;

  useEffect(() => {
    if (user) {
      fetchProgress();
      markAsInProgress();
    }
    if (module.training_path_id) {
      fetchTrainingPathName();
    }
  }, [user, module.id, module.training_path_id]);

  const fetchTrainingPathName = async () => {
    if (!module.training_path_id) return;

    try {
      const { data, error } = await supabase
        .from('training_paths')
        .select('name')
        .eq('id', module.training_path_id)
        .single();

      if (!error && data) {
        setTrainingPathName(data.name);
      }
    } catch (error) {
      console.error('Error fetching training path name:', error);
    }
  };

  const fetchProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', module.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsInProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: module.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        })
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!user) return;

    try {
      const newAttempts = (progress?.attempts || 0) + 1;
      const status = score >= 80 ? 'completed' : 'in_progress';

      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: module.id,
          status,
          score,
          attempts: newAttempts,
          completed_at: score >= 80 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        })
        .select()
        .single();

      if (error) throw error;
      setProgress(data);

      // Si le quiz est réussi, rediriger vers le parcours de formation
      if (score >= 80) {
        // Petit délai pour que l'utilisateur puisse voir le résultat
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        // Si le quiz n'est pas réussi, revenir à la vue du contenu pour permettre de réessayer
        setCurrentView('content');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };


  const renderContent = (content: string) => {
    // Log content pour debugging
    if (content.includes('<img')) {
      console.log('Contenu avec images:', content);
    }
    
    // Traiter le contenu pour s'assurer que les URLs Azure ont les bons tokens SAS
    let processedContent = content;
    
    if (azureStorage.isConfigured() && content.includes('blob.core.windows.net')) {
      // Regex pour trouver les URLs d'images Azure
      const azureImageRegex = /<img[^>]+src="([^"]*blob\.core\.windows\.net[^"]*)"[^>]*>/g;
      processedContent = content.replace(azureImageRegex, (match, url) => {
        try {
          // S'assurer que l'URL a un token SAS
          const urlWithSas = azureStorage.ensureSasToken(url);
          console.log('URL originale:', url);
          console.log('URL avec SAS:', urlWithSas);
          return match.replace(url, urlWithSas);
        } catch (error) {
          console.error('Erreur lors du traitement de l\'URL:', error);
          return match;
        }
      });
    }
    
    // Render HTML content directly (from WYSIWYG editor)
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'quiz') {
    // Vérifier que les questions existent et ne sont pas vides
    if (!module.quiz_questions || module.quiz_questions.length === 0) {
      return (
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{t('no_quiz_available')}</p>
            <button
              onClick={() => setCurrentView('content')}
              className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t('back_to_module')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <Quiz
        questions={module.quiz_questions}
        onComplete={handleQuizComplete}
        onBack={() => setCurrentView('content')}
        previousScore={progress?.score}
        attempts={progress?.attempts || 0}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-4 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          {trainingPathName ? (
            <>
              <span className="hidden sm:inline">{t('back_to_path')} : {trainingPathName}</span>
              <span className="sm:hidden">{t('back_to_path')}</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">{t('back_to_path')}</span>
              <span className="sm:hidden">{t('back_to_dashboard')}</span>
            </>
          )}
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">{getTranslatedField(module, 'title', language)}</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4 line-clamp-3">{getTranslatedField(module, 'description', language)}</p>
            
            {progress && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  progress.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : progress.status === 'in_progress'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {progress.status === 'completed' ? t('completed') :
                   progress.status === 'in_progress' ? t('in_progress') : t('available')}
                </span>
                
                {progress.score !== null && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs sm:text-sm font-medium">{t('score')}: {progress.score}%</span>
                  </div>
                )}

                {progress.attempts > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {progress.attempts} {t('attempts')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
        <div className="prose prose-lg max-w-none">
          {videoUrl && (
            <div className="mb-6 sm:mb-8">
              <VideoEmbed url={videoUrl} />
            </div>
          )}

          {presentationUrl && presentationType && (
            <PresentationViewer
              url={presentationUrl}
              type={presentationType}
              title={module.title}
            />
          )}

          <div className="text-gray-700 text-sm sm:text-base ql-editor">
            <style>{`
              /* Quill Editor Styles - Match backoffice exactly */
              .ql-editor {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #374151;
                padding: 0 !important;
              }

              .ql-editor h1 {
                color: #1f2937 !important;
                font-size: 2rem !important;
                font-weight: bold !important;
                margin: 1.5rem 0 1rem 0 !important;
              }

              .ql-editor h2 {
                color: #374151 !important;
                font-size: 1.5rem !important;
                font-weight: 600 !important;
                margin: 1.25rem 0 0.75rem 0 !important;
              }

              .ql-editor h3 {
                color: #4b5563 !important;
                font-size: 1.25rem !important;
                font-weight: 600 !important;
                margin: 1rem 0 0.5rem 0 !important;
              }

              .ql-editor p {
                margin-bottom: 1rem !important;
              }

              .ql-editor ul, .ql-editor ol {
                margin-bottom: 1rem !important;
                padding-left: 2rem !important;
              }

              .ql-editor li {
                margin-bottom: 0.5rem !important;
              }

              .ql-editor img {
                max-width: 100% !important;
                height: auto !important;
                margin: 1rem 0 !important;
                border-radius: 8px !important;
              }

              .ql-editor strong {
                font-weight: 600 !important;
              }

              .ql-editor em {
                font-style: italic !important;
              }

              .ql-editor u {
                text-decoration: underline !important;
              }

              .ql-editor s {
                text-decoration: line-through !important;
              }

              .ql-editor a {
                color: #ea580c !important;
                text-decoration: underline !important;
              }

              .ql-editor blockquote {
                border-left: 4px solid #d1d5db !important;
                padding-left: 1rem !important;
                margin: 1rem 0 !important;
                color: #6b7280 !important;
              }

              /* Quill alignment classes */
              .ql-align-center {
                text-align: center !important;
              }

              .ql-align-right {
                text-align: right !important;
              }

              .ql-align-justify {
                text-align: justify !important;
              }
            `}</style>
            {renderContent(getTranslatedField(module, 'content', language))}
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      {module.quiz_questions && module.quiz_questions.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-orange-50 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">{t('quiz_validation')}</h3>
              <p className="text-orange-800 mb-3 text-sm">
                {t('pass_score')}
              </p>
              <button
                onClick={() => setCurrentView('quiz')}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm w-full sm:w-auto"
              >
                {progress?.status === 'completed' ? t('retake_quiz') : t('start_quiz')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}