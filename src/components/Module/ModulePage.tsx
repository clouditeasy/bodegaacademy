import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText, Award, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Module, UserProgress, supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Quiz } from './Quiz';
import { PDFViewer } from './PDFViewer';

interface ModulePageProps {
  module: Module;
  onBack: () => void;
}

// Fonction pour valider si l'URL vidéo est valide (Azure Blob Storage seulement)
const isValidVideoUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;

  // Vérifier si c'est une URL Azure Blob Storage valide
  const azurePattern = /^https:\/\/[a-zA-Z0-9]+\.blob\.core\.windows\.net\//;

  // Ou URLs directes vers des fichiers vidéo
  const validPatterns = [
    azurePattern,
    /^https:\/\/.*\.(mp4|webm|avi|mov|mkv)(\?.*)?$/i,  // URLs directes vers vidéos
  ];

  return validPatterns.some(pattern => pattern.test(url));
};

export function ModulePage({ module, onBack }: ModulePageProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'content' | 'quiz'>('content');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenPdf, setFullscreenPdf] = useState(false);
  const [fullscreenPresentation, setFullscreenPresentation] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProgress();
      markAsInProgress();
    }
  }, [user, module.id]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
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
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user!.id,
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
    try {
      const newAttempts = (progress?.attempts || 0) + 1;
      const status = score >= 80 ? 'completed' : 'in_progress';

      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user!.id,
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
      setCurrentView('content');
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const renderContent = (content: string) => {
    if (!content || content.trim() === '') {
      return null;
    }

    // Nettoyer le contenu des balises HTML et des espaces
    const cleanContent = content
      .replace(/<p><br><\/p>/g, '') // Supprimer explicitement <p><br></p>
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '') // Supprimer avec variations d'espaces
      .replace(/<br\s*\/?>/g, '\n') // Convertir <br> en retours à la ligne
      .replace(/<p>/g, '') // Supprimer les balises <p> ouvrantes
      .replace(/<\/p>/g, '\n') // Convertir les balises </p> en retours à la ligne
      .trim();

    // Simple markdown-like rendering
    return cleanContent
      .split('\n')
      .filter(line => line.trim() !== '') // Filtrer les lignes vides dès le début
      .map((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
          return null; // Ignorer les lignes vides
        } else if (trimmedLine.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{trimmedLine.slice(2)}</h1>;
        } else if (trimmedLine.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">{trimmedLine.slice(3)}</h2>;
        } else if (trimmedLine.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-700 mb-3 mt-4">{trimmedLine.slice(4)}</h3>;
        } else if (trimmedLine.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-2">{trimmedLine.slice(2)}</li>;
        } else if (trimmedLine.match(/^\d+\. /)) {
          return <li key={index} className="ml-6 mb-2 list-decimal">{trimmedLine.replace(/^\d+\. /, '')}</li>;
        } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          return <p key={index} className="font-bold mb-3">{trimmedLine.slice(2, -2)}</p>;
        } else {
          return <p key={index} className="mb-3 leading-relaxed">{trimmedLine}</p>;
        }
      })
      .filter(Boolean); // Filtrer les éléments null/undefined
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'quiz') {
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
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour au dashboard</span>
          <span className="sm:hidden">Retour</span>
        </button>
        
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">{module.title}</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4 line-clamp-3">{module.description}</p>

            {progress && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  progress.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : progress.status === 'in_progress'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {progress.status === 'completed' ? 'Terminé' :
                   progress.status === 'in_progress' ? 'En cours' : 'Non commencé'}
                </span>

                {progress.score !== null && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs sm:text-sm font-medium">Score: {progress.score}%</span>
                  </div>
                )}

                {progress.attempts > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {progress.attempts} tentative{progress.attempts > 1 ? 's' : ''}
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
          {module.video_url && isValidVideoUrl(module.video_url) && (
            <div className="mb-6 sm:mb-8">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster=""
                >
                  <source src={module.video_url} type="video/mp4" />
                  <source src={module.video_url} type="video/webm" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            </div>
          )}

          {module.pdf_url && (
            <div className={`transition-all duration-300 ${
              fullscreenPdf
                ? 'fixed inset-0 z-50 bg-black bg-opacity-75 p-4'
                : 'mb-6 sm:mb-8'
            }`}>
              {!fullscreenPdf && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setFullscreenPdf(true)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    title="Plein écran"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="relative">
                {fullscreenPdf && (
                  <button
                    onClick={() => setFullscreenPdf(false)}
                    className="absolute top-2 right-2 z-10 p-2 bg-gray-900 bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-all"
                    title="Quitter le plein écran"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                )}

                <iframe
                  src={`${module.pdf_url}#toolbar=0&navpanes=0&scrollbar=1`}
                  className={`w-full border rounded-lg ${
                    fullscreenPdf ? 'h-[calc(100vh-2rem)]' : 'h-96 lg:h-[600px]'
                  }`}
                  title="Visionneuse PDF"
                  frameBorder="0"
                  loading="lazy"
                />
              </div>

              {fullscreenPdf && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 -z-10"
                  onClick={() => setFullscreenPdf(false)}
                />
              )}
            </div>
          )}

          {module.presentation_url && (
            <div className={`transition-all duration-300 ${
              fullscreenPresentation
                ? 'fixed inset-0 z-50 bg-black bg-opacity-75 p-4'
                : 'mb-6 sm:mb-8'
            }`}>
              {!fullscreenPresentation && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setFullscreenPresentation(true)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    title="Plein écran"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="relative">
                {fullscreenPresentation && (
                  <button
                    onClick={() => setFullscreenPresentation(false)}
                    className="absolute top-2 right-2 z-10 p-2 bg-gray-900 bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-all"
                    title="Quitter le plein écran"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                )}

                {module.presentation_type === 'powerpoint' ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(module.presentation_url)}`}
                    className={`w-full border rounded-lg ${
                      fullscreenPresentation ? 'h-[calc(100vh-2rem)]' : 'h-96 lg:h-[600px]'
                    }`}
                    title="Visionneuse PowerPoint"
                    frameBorder="0"
                    loading="lazy"
                  />
                ) : (
                  <iframe
                    src={`${module.presentation_url}#toolbar=0&navpanes=0&scrollbar=1`}
                    className={`w-full border rounded-lg ${
                      fullscreenPresentation ? 'h-[calc(100vh-2rem)]' : 'h-96 lg:h-[600px]'
                    }`}
                    title="Visionneuse de présentation"
                    frameBorder="0"
                    loading="lazy"
                  />
                )}
              </div>

              {fullscreenPresentation && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 -z-10"
                  onClick={() => setFullscreenPresentation(false)}
                />
              )}
            </div>
          )}

          <div className="text-gray-700 text-sm sm:text-base">
            {renderContent(module.content)}
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="mt-6 sm:mt-8 bg-gray-50 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-black mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Quiz de validation</h3>
            <p className="text-white mb-3 text-sm">
              Ce module comprend un quiz de 10 questions pour valider vos connaissances. 
              Un score minimum de 80% est requis pour terminer le module.
            </p>
            <button
              onClick={() => setCurrentView('quiz')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm w-full sm:w-auto"
            >
              {progress?.status === 'completed' ? 'Refaire le quiz' : 'Commencer le quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}