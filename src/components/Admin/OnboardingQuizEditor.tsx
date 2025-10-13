import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface OnboardingAssessment {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  target_roles: string[] | null;
  is_active: boolean;
  passing_score: number;
}

interface OnboardingQuizEditorProps {
  onBack: () => void;
}

export function OnboardingQuizEditor({ onBack }: OnboardingQuizEditorProps) {
  const [assessment, setAssessment] = useState<OnboardingAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      // Load the first active assessment (there should be only one for onboarding)
      const { data, error } = await supabase
        .from('onboarding_assessments')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No assessment found, create a default one
          await createDefaultAssessment();
          return;
        }
        throw error;
      }

      setAssessment(data);
    } catch (err) {
      console.error('Error loading assessment:', err);
      showMessage('error', 'Erreur lors du chargement du quiz');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAssessment = async () => {
    try {
      const defaultAssessment = {
        title: 'Évaluation d\'Onboarding',
        description: 'Évaluation initiale des connaissances de base',
        questions: [
          {
            question: 'Quelle est la mission principale de Bodega Academy?',
            options: [
              'Former les employés',
              'Vendre des produits',
              'Gérer les stocks',
              'Recruter du personnel'
            ],
            correct: 0
          }
        ],
        target_roles: null,
        is_active: true,
        passing_score: 70
      };

      const { data, error } = await supabase
        .from('onboarding_assessments')
        .insert([defaultAssessment])
        .select()
        .single();

      if (error) throw error;

      setAssessment(data);
      showMessage('success', 'Quiz par défaut créé avec succès');
    } catch (err) {
      console.error('Error creating default assessment:', err);
      showMessage('error', 'Erreur lors de la création du quiz par défaut');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    if (!assessment) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('onboarding_assessments')
        .update({
          title: assessment.title,
          description: assessment.description,
          questions: assessment.questions,
          passing_score: assessment.passing_score,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (error) throw error;

      showMessage('success', 'Quiz sauvegardé avec succès!');
    } catch (err) {
      console.error('Error saving assessment:', err);
      showMessage('error', 'Erreur lors de la sauvegarde du quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!assessment) return;

    const newQuestion: QuizQuestion = {
      question: 'Nouvelle question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0
    };

    setAssessment({
      ...assessment,
      questions: [...assessment.questions, newQuestion]
    });
    setEditingQuestionIndex(assessment.questions.length);
  };

  const handleDeleteQuestion = (index: number) => {
    if (!assessment || assessment.questions.length <= 1) {
      showMessage('error', 'Le quiz doit contenir au moins une question');
      return;
    }

    const updatedQuestions = assessment.questions.filter((_, i) => i !== index);
    setAssessment({
      ...assessment,
      questions: updatedQuestions
    });

    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    if (!assessment) return;

    const updatedQuestions = [...assessment.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };

    setAssessment({
      ...assessment,
      questions: updatedQuestions
    });
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!assessment) return;

    const updatedQuestions = [...assessment.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };

    setAssessment({
      ...assessment,
      questions: updatedQuestions
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Impossible de charger le quiz</p>
          <button
            onClick={onBack}
            className="mt-4 flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-md hover:shadow-lg mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-3 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour au dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz d'Onboarding
              </h1>
              <p className="text-gray-600">
                Gérez les questions de l'évaluation initiale des nouveaux employés
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Assessment Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres du Quiz</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score de passage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={assessment.passing_score}
                onChange={(e) => setAssessment({ ...assessment, passing_score: parseInt(e.target.value) || 70 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={assessment.description}
                onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({assessment.questions.length})
            </h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Ajouter une question
            </button>
          </div>

          {assessment.questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold">
                    {qIndex + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingQuestionIndex(editingQuestionIndex === qIndex ? null : qIndex)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(qIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {editingQuestionIndex === qIndex ? (
                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte de la question
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Options */}
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
                            onChange={() => handleUpdateQuestion(qIndex, 'correct', oIndex)}
                            className="w-5 h-5 text-gray-900 focus:ring-gray-900"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          />
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            question.correct === oIndex
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {question.correct === oIndex ? 'Correcte' : `Option ${String.fromCharCode(65 + oIndex)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Cochez la radio button pour sélectionner la bonne réponse
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-900 mb-4 font-medium">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`px-4 py-2 rounded-lg flex items-center gap-3 ${
                          question.correct === oIndex
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          question.correct === oIndex
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className={question.correct === oIndex ? 'text-green-900 font-medium' : 'text-gray-700'}>
                          {option}
                        </span>
                        {question.correct === oIndex && (
                          <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
