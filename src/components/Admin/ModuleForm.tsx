import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { supabase, Module, QuizQuestion, ModuleCategory } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { RichTextEditor } from './RichTextEditor';
import { VideoUpload } from './VideoUpload';
import { PresentationUpload } from './PresentationUpload';
// import { CategoryService } from '../../services/categoryService'; // No longer needed

interface ModuleFormProps {
  module?: Module | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ModuleForm({ module, onSave, onCancel }: ModuleFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trainingPathsLoading, setTrainingPathsLoading] = useState(true);
  const [trainingPaths, setTrainingPaths] = useState<ModuleCategory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    pdf_url: '',
    presentation_url: '',
    presentation_type: '' as 'pdf' | 'powerpoint' | '',
    is_active: true,
    training_path_id: '',
    order_index: 0,
    target_job_roles: [] as string[],
    target_departments: [] as string[],
    is_mandatory: false,
    prerequisite_modules: [] as string[]
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    loadTrainingPaths();
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        content: module.content,
        video_url: module.video_url || '',
        pdf_url: module.pdf_url || '',
        presentation_url: module.presentation_url || '',
        presentation_type: module.presentation_type || '',
        is_active: module.is_active,
        training_path_id: module.training_path_id || '',
        order_index: module.order_index || 0,
        target_job_roles: module.target_job_roles || [],
        target_departments: module.target_departments || [],
        is_mandatory: module.is_mandatory || false,
        prerequisite_modules: module.prerequisite_modules || []
      });
      setQuestions(module.quiz_questions || []);
      setHasQuiz((module.quiz_questions || []).length > 0);
    } else {
      // Reset form for new module
      setFormData({
        title: '',
        description: '',
        content: '',
        video_url: '',
        pdf_url: '',
        presentation_url: '',
        presentation_type: '',
        is_active: true,
        training_path_id: '',
        order_index: 0,
        target_job_roles: [],
        target_departments: [],
        is_mandatory: false,
        prerequisite_modules: []
      });
      setQuestions([]);
      setHasQuiz(false);
    }
  }, [module]);

  const loadTrainingPaths = async () => {
    try {
      setTrainingPathsLoading(true);
      // Charger directement depuis la table training_paths
      const { data, error } = await supabase
        .from('training_paths')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTrainingPaths(data || []);
    } catch (error) {
      console.error('Error loading training paths:', error);
      setTrainingPaths([]);
    } finally {
      setTrainingPathsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vous devez être connecté pour créer un module');
      return;
    }
    
    if (hasQuiz && questions.length === 0) {
      alert('Veuillez ajouter au moins une question au quiz ou désactivez le quiz');
      return;
    }

    setLoading(true);

    try {
      // Now include all fields since the database has been updated
      const moduleData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        video_url: formData.video_url || null,
        pdf_url: formData.pdf_url || null,
        presentation_url: formData.presentation_url || null,
        presentation_type: formData.presentation_type || null,
        is_active: formData.is_active,
        training_path_id: formData.training_path_id || null,
        order_index: formData.order_index,
        target_job_roles: formData.target_job_roles.length > 0 ? formData.target_job_roles : null,
        target_departments: formData.target_departments.length > 0 ? formData.target_departments : null,
        is_mandatory: formData.is_mandatory,
        prerequisite_modules: formData.prerequisite_modules.length > 0 ? formData.prerequisite_modules : null,
        quiz_questions: hasQuiz ? questions : [],
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      if (module) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', module.id);

        if (error) throw error;
      } else {
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert([moduleData]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving module:', error);
      // console.error('Module data that failed:', moduleData); // moduleData not accessible in catch

      // Try to get more specific error info
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Erreur lors de la sauvegarde du module: ${error.message}`);
      } else {
        alert('Erreur lors de la sauvegarde du module');
      }
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correct: 0
    }]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleVideoUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, video_url: url }));
  };

  const handleRemoveVideo = async () => {
    // Mettre à jour le state local
    setFormData(prev => ({ ...prev, video_url: '' }));

    // Si on édite un module existant, sauvegarder immédiatement
    if (module && user) {
      try {
        const { error } = await supabase
          .from('modules')
          .update({
            video_url: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        console.log('Vidéo supprimée de la base de données');

        // Notifier le parent que le module a été mis à jour
        onSave();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du module:', error);
      }
    }
  };

  const handlePresentationUploaded = (url: string, type: 'pdf' | 'powerpoint') => {
    setFormData(prev => ({
      ...prev,
      presentation_url: url,
      presentation_type: type
    }));
  };

  const handleRemovePresentation = async () => {
    // Mettre à jour le state local
    setFormData(prev => ({
      ...prev,
      presentation_url: '',
      presentation_type: ''
    }));

    // Si on édite un module existant, sauvegarder immédiatement
    if (module && user) {
      try {
        const { error } = await supabase
          .from('modules')
          .update({
            presentation_url: null,
            presentation_type: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        console.log('Présentation supprimée de la base de données');

        // Notifier le parent que le module a été mis à jour
        onSave();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du module:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {module ? 'Modifier le module' : 'Nouveau module'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations générales</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du module *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="training_path_id" className="block text-sm font-medium text-gray-700 mb-2">
                Parcours de formation *
              </label>
              <select
                id="training_path_id"
                value={formData.training_path_id}
                onChange={(e) => setFormData(prev => ({ ...prev, training_path_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={trainingPathsLoading}
                required
              >
                <option value="">
                  {trainingPathsLoading ? 'Chargement des parcours...' : 'Sélectionner un parcours de formation'}
                </option>
                {trainingPaths.map((trainingPath) => (
                  <option key={trainingPath.id} value={trainingPath.id}>
                    {trainingPath.icon} {trainingPath.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choisissez le parcours de formation auquel appartient ce module
                {trainingPathsLoading && ' (Chargement en cours...)'}
              </p>
              {!trainingPathsLoading && trainingPaths.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Aucun parcours de formation disponible. Créez d'abord des parcours depuis la gestion des parcours.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                Ordre d'affichage dans le parcours
              </label>
              <input
                id="order_index"
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Position du module dans le parcours (0 = premier, 1 = deuxième, etc.)
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="is_mandatory"
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) => setFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_mandatory" className="ml-2 block text-sm text-gray-700">
                Module obligatoire pour terminer le parcours
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vidéo (optionnel)
              </label>
              <VideoUpload
                onVideoUploaded={handleVideoUploaded}
                currentVideoUrl={formData.video_url}
                onRemoveVideo={handleRemoveVideo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Présentation (optionnel)
              </label>
              <PresentationUpload
                onPresentationUploaded={handlePresentationUploaded}
                currentPresentationUrl={formData.presentation_url}
                currentPresentationType={formData.presentation_type as 'pdf' | 'powerpoint' | undefined}
                onRemovePresentation={handleRemovePresentation}
              />
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Module actif (visible par les utilisateurs)
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contenu du module</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Tapez le contenu de votre module ici..."
                height={500}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Utilisez la barre d'outils pour formater votre texte comme dans Word. Vous pouvez ajouter des titres, listes, liens, images, etc.
            </p>
          </div>
        </div>

        {/* Quiz Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quiz ({questions.length} questions)</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune question ajoutée pour le moment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Supprimer la question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Posez votre question..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options de réponse
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correct === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correct', oIndex)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                            <span className="text-xs text-gray-500 w-20">
                              {question.correct === oIndex ? 'Correcte' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Sélectionnez la bonne réponse en cochant le bouton radio correspondant
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}