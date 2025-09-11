import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { supabase, Module, QuizQuestion } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ModuleFormProps {
  module?: Module | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ModuleForm({ module, onSave, onCancel }: ModuleFormProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    pdf_url: '',
    is_active: true
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        content: module.content,
        video_url: module.video_url || '',
        pdf_url: module.pdf_url || '',
        is_active: module.is_active
      });
      setQuestions(module.quiz_questions || []);
    } else {
      // Reset form for new module
      setFormData({
        title: '',
        description: '',
        content: '',
        video_url: '',
        pdf_url: '',
        is_active: true
      });
      setQuestions([]);
    }
  }, [module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is admin
    if (!profile || profile.role !== 'admin') {
      alert('Seuls les administrateurs peuvent créer/modifier des modules');
      return;
    }
    
    if (questions.length === 0) {
      alert('Veuillez ajouter au moins une question au quiz');
      return;
    }

    setLoading(true);

    try {
      const moduleData = {
        ...formData,
        quiz_questions: questions,
        created_by: user!.id,
        updated_at: new Date().toISOString()
      };

      console.log('User profile:', profile);
      console.log('Module data:', moduleData);

      if (module) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', module.id);

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }
      } else {
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert([moduleData]);

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving module:', error);
      let errorMessage = 'Erreur lors de la sauvegarde du module';
      
      if (error.code === '42501') {
        errorMessage = 'Permissions insuffisantes pour créer/modifier des modules';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la vidéo (optionnel)
                </label>
                <input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="pdf_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL du PDF (optionnel)
                </label>
                <input
                  id="pdf_url"
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Contenu (supporte le Markdown) *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm"
              placeholder="# Titre du module&#10;&#10;## Introduction&#10;&#10;Votre contenu ici..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilisez # pour les titres, ## pour les sous-titres, - pour les listes, **texte** pour le gras
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
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune question ajoutée pour le moment</p>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Ajouter la première question
              </button>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                              className="h-4 w-4 text-gray-900 focus:ring-gray-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}