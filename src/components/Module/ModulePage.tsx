import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText, Award, CheckCircle } from 'lucide-react';
import { Module, UserProgress, supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Quiz } from './Quiz';

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
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{line.slice(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-700 mb-3 mt-4">{line.slice(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-2">{line.slice(2)}</li>;
        } else if (line.match(/^\d+\. /)) {
          return <li key={index} className="ml-6 mb-2 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        } else if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-bold mb-3">{line.slice(2, -2)}</p>;
        } else if (line.trim() === '') {
          return null; // Ne rien retourner pour les lignes vides au lieu de <br>
        } else {
          return <p key={index} className="mb-3 leading-relaxed">{line}</p>;
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
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
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
          
          <button
            onClick={() => setCurrentView('quiz')}
            className="bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm sm:text-base w-full lg:w-auto justify-center"
          >
            <Play className="h-4 w-4" />
            {progress?.status === 'completed' ? 'Refaire le quiz' : 'Commencer le quiz'}
          </button>
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
            <div className="mb-6 sm:mb-8">
              <a
                href={module.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-1">Document PDF</h3>
                    <p className="text-blue-700 text-xs sm:text-sm">Cliquer pour ouvrir le document</p>
                  </div>
                  <div className="text-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          )}

          {module.presentation_url && (
            <div className="mb-6 sm:mb-8">
              <a
                href={module.presentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-purple-900 text-sm sm:text-base mb-1">
                      Présentation {module.presentation_type === 'powerpoint' ? 'PowerPoint' : 'PDF'}
                    </h3>
                    <p className="text-purple-700 text-xs sm:text-sm">Cliquer pour ouvrir la présentation</p>
                  </div>
                  <div className="text-purple-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
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