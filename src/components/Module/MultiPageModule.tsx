import React, { useState, useEffect } from 'react';
import { Module, ModulePage as ModulePageType, UserProgress, supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ModulePageNavigation } from './ModulePageNavigation';
import { Quiz } from './Quiz';
import { VideoEmbed } from './VideoEmbed';
import { PresentationViewer } from './PresentationViewer';
import { azureStorage } from '../../lib/azureStorage';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface MultiPageModuleProps {
  module: Module;
  onBack: () => void;
}

export function MultiPageModule({ module, onBack }: MultiPageModuleProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useLanguage();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentView, setCurrentView] = useState<'content' | 'quiz'>('content');
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
  const [pageScores, setPageScores] = useState<Map<number, number>>(new Map());
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainingPathName, setTrainingPathName] = useState<string>('');
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [nextPageTitle, setNextPageTitle] = useState<string>('');

  const pages = module.pages || [];
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    if (user) {
      fetchProgress();
      markAsInProgress();
    }
    if (module.training_path_id) {
      fetchTrainingPathName();
    }
  }, [user, module.id]);

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

      // Charger les pages complétées depuis les métadonnées
      if (data?.metadata) {
        const metadata = data.metadata as any;
        if (metadata.completedPages) {
          setCompletedPages(new Set(metadata.completedPages));
        }
        if (metadata.pageScores) {
          setPageScores(new Map(Object.entries(metadata.pageScores).map(([k, v]) => [parseInt(k), v as number])));
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsInProgress = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: module.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const canAccessPage = (pageIndex: number): boolean => {
    if (pageIndex === 0) return true;

    // Pour accéder à une page, il faut avoir complété la page précédente
    const previousPage = pages[pageIndex - 1];
    if (!previousPage) return false;

    // Si la page précédente a un quiz, il faut l'avoir réussi
    if (previousPage.has_quiz) {
      return completedPages.has(pageIndex - 1);
    }

    // Sinon, juste avoir vu la page précédente
    return completedPages.has(pageIndex - 1);
  };

  const handlePageChange = (pageIndex: number) => {
    if (canAccessPage(pageIndex)) {
      setCurrentPageIndex(pageIndex);
      setCurrentView('content');
    }
  };

  const handlePageComplete = () => {
    const newCompleted = new Set(completedPages);
    newCompleted.add(currentPageIndex);
    setCompletedPages(newCompleted);

    // Sauvegarder dans la base de données
    saveProgress(newCompleted, pageScores);

    // Afficher notification si page suivante déverrouillée
    if (currentPageIndex < pages.length - 1) {
      setNextPageTitle(pages[currentPageIndex + 1].title);
      setShowUnlockNotification(true);
      setTimeout(() => setShowUnlockNotification(false), 3000);
    }
  };

  const handleQuizComplete = async (score: number) => {
    const newScores = new Map(pageScores);
    newScores.set(currentPageIndex, score);
    setPageScores(newScores);

    if (score >= 80) {
      const newCompleted = new Set(completedPages);
      newCompleted.add(currentPageIndex);
      setCompletedPages(newCompleted);

      await saveProgress(newCompleted, newScores);
      setCurrentView('content');

      // Vérifier si toutes les pages sont complétées
      if (newCompleted.size === pages.length) {
        await markModuleAsCompleted(newScores);
      }
    } else {
      alert(`${t('score')}: ${score}%. ${t('pass_score')}`);
    }
  };

  const saveProgress = async (completed: Set<number>, scores: Map<number, number>) => {
    if (!user) return;

    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: module.id,
          status: completed.size === pages.length ? 'completed' : 'in_progress',
          metadata: {
            completedPages: Array.from(completed),
            pageScores: Object.fromEntries(scores)
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const markModuleAsCompleted = async (scores: Map<number, number>) => {
    if (!user) return;

    // Calculer le score moyen
    const scoresArray = Array.from(scores.values());
    const averageScore = scoresArray.length > 0
      ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length)
      : 0;

    try {
      await supabase
        .from('user_progress')
        .update({
          status: 'completed',
          score: averageScore,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('module_id', module.id);

      setProgress(prev => prev ? { ...prev, status: 'completed', score: averageScore } : null);
    } catch (error) {
      console.error('Error marking module as completed:', error);
    }
  };

  const renderContent = (content: string) => {
    let processedContent = content;

    if (azureStorage.isConfigured() && content.includes('blob.core.windows.net')) {
      const azureImageRegex = /<img[^>]+src="([^"]*blob\.core\.windows\.net[^"]*)"[^>]*>/g;
      processedContent = content.replace(azureImageRegex, (match, url) => {
        try {
          const urlWithSas = azureStorage.ensureSasToken(url);
          return match.replace(url, urlWithSas);
        } catch (error) {
          console.error('Erreur lors du traitement de l\'URL:', error);
          return match;
        }
      });
    }

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

  if (!currentPage) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <p className="text-red-600">Erreur : aucune page trouvée pour ce module.</p>
      </div>
    );
  }

  if (currentView === 'quiz' && currentPage.has_quiz) {
    return (
      <Quiz
        questions={currentPage.quiz_questions}
        onComplete={handleQuizComplete}
        onBack={() => setCurrentView('content')}
        previousScore={pageScores.get(currentPageIndex)}
        attempts={0}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Unlock Notification */}
      {showUnlockNotification && nextPageTitle && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 bg-green-50 border-2 border-green-500 rounded-lg shadow-lg p-4 z-50 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-green-900 mb-1">
                🎉 {t('unlock_next_page')}
              </h3>
              <p className="text-sm text-green-800">
                <strong>{nextPageTitle}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowUnlockNotification(false)}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
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

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h1>
        <p className="text-gray-600">{module.description}</p>
      </div>

      {/* Current Page Content */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {getTranslatedField(currentPage, 'title', language)}
        </h2>

        {/* Video */}
        {currentPage.video_url && (
          <div className="mb-6">
            <VideoEmbed videoUrl={currentPage.video_url} />
          </div>
        )}

        {/* Presentation */}
        {currentPage.presentation_url && currentPage.presentation_type && (
          <div className="mb-6">
            <PresentationViewer
              url={currentPage.presentation_url}
              type={currentPage.presentation_type}
            />
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          {renderContent(getTranslatedField(currentPage, 'content', language))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {currentPage.has_quiz && (
            <button
              onClick={() => setCurrentView('quiz')}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {pageScores.has(currentPageIndex) ? t('retake_quiz') : t('start_quiz')}
            </button>
          )}

          {!currentPage.has_quiz && !completedPages.has(currentPageIndex) && (
            <button
              onClick={handlePageComplete}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              {t('mark_as_read')}
            </button>
          )}
        </div>
      </div>

      {/* Page Navigation - Bottom */}
      <div className="mt-6">
        <ModulePageNavigation
          pages={pages}
          currentPageIndex={currentPageIndex}
          completedPages={completedPages}
          onPageChange={handlePageChange}
          canAccessPage={canAccessPage}
        />
      </div>
    </div>
  );
}
