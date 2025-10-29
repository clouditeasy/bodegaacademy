import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { supabase, Module, QuizQuestion, ModuleCategory, ModulePage } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { RichTextEditor } from './RichTextEditor';
import { VideoUpload } from './VideoUpload';
import { PresentationUpload } from './PresentationUpload';
import { CategoryService } from '../../services/categoryService';
import { ModulePagesEditor } from './ModulePagesEditor';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';
import { useTranslation } from '../../hooks/useTranslation';

interface ModuleFormProps {
  module?: Module | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ModuleForm({ module, onSave, onCancel }: ModuleFormProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    title_ar: '',
    description_ar: '',
    content_ar: '',
    video_url: '',
    video_url_ar: '',
    pdf_url: '',
    presentation_url: '',
    presentation_url_ar: '',
    presentation_type: '' as 'pdf' | 'powerpoint' | '',
    presentation_type_ar: '' as 'pdf' | 'powerpoint' | '',
    is_active: true,
    training_path_id: '',
    order_index: 0
  });
  const [languageTab, setLanguageTab] = useState<'fr' | 'ar'>('fr');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [pages, setPages] = useState<ModulePage[]>([]);

  useEffect(() => {
    loadCategories();
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        content: module.content,
        title_ar: (module as any).title_ar || '',
        description_ar: (module as any).description_ar || '',
        content_ar: (module as any).content_ar || '',
        video_url: module.video_url || '',
        video_url_ar: (module as any).video_url_ar || '',
        pdf_url: module.pdf_url || '',
        presentation_url: module.presentation_url || '',
        presentation_url_ar: (module as any).presentation_url_ar || '',
        presentation_type: module.presentation_type || '',
        presentation_type_ar: (module as any).presentation_type_ar || '',
        is_active: module.is_active,
        training_path_id: module.training_path_id || '',
        order_index: module.order_index || 0
      });
      setQuestions(module.quiz_questions || []);
      setHasQuiz((module.quiz_questions || []).length > 0);
      setIsMultiPage(module.has_multiple_pages || false);
      setPages(module.pages || []);
    } else {
      // Reset form for new module
      setFormData({
        title: '',
        description: '',
        content: '',
        title_ar: '',
        description_ar: '',
        content_ar: '',
        video_url: '',
        video_url_ar: '',
        pdf_url: '',
        presentation_url: '',
        presentation_url_ar: '',
        presentation_type: '',
        presentation_type_ar: '',
        is_active: true,
        training_path_id: '',
        order_index: 0
      });
      setQuestions([]);
      setHasQuiz(false);
      setIsMultiPage(false);
      setPages([]);
    }
  }, [module]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert(t('module_form.must_be_logged'));
      return;
    }

    // Validation pour module à page unique
    if (!isMultiPage && hasQuiz && questions.length === 0) {
      alert(t('module_form.add_question_or_disable'));
      return;
    }

    // Validation pour module multi-pages
    if (isMultiPage && pages.length === 0) {
      alert(t('module_form.add_at_least_one_page'));
      return;
    }

    setLoading(true);

    try {
      const moduleData: any = {
        ...formData,
        // Ne pas envoyer presentation_type si c'est une chaîne vide
        presentation_type: formData.presentation_type || null,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      // Pour module à page unique
      if (!isMultiPage) {
        moduleData.quiz_questions = hasQuiz ? questions : [];
        moduleData.has_multiple_pages = false;
        moduleData.pages = null;
      }
      // Pour module multi-pages
      else {
        moduleData.has_multiple_pages = true;
        moduleData.pages = pages;
        moduleData.quiz_questions = []; // Clear single-page quiz
      }

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

      // Réinitialiser le flag de modifications non sauvegardées
      setHasUnsavedChanges(false);
      onSave();
    } catch (error) {
      console.error('Error saving module:', error);
      alert(t('module_form.error_saving'));
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire pour détecter les modifications
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        t('module_form.unsaved_changes_warning') ||
        'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter sans sauvegarder ?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    onCancel();
  };

  // Wrapper pour setFormData qui marque les modifications
  const updateFormData = (updates: Partial<typeof formData> | ((prev: typeof formData) => typeof formData)) => {
    if (typeof updates === 'function') {
      setFormData(updates);
    } else {
      setFormData(prev => ({ ...prev, ...updates }));
    }
    setHasUnsavedChanges(true);
  };

  // Wrapper pour setPages qui marque les modifications
  const updatePages = (newPages: ModulePage[]) => {
    setPages(newPages);
    setHasUnsavedChanges(true);
  };

  // Wrapper pour setIsMultiPage qui marque les modifications
  const updateIsMultiPage = (value: boolean) => {
    setIsMultiPage(value);
    setHasUnsavedChanges(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      question_ar: '',
      options: ['', '', '', ''],
      options_ar: ['', '', '', ''],
      correct: 0
    }]);
    setHasUnsavedChanges(true);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
    setHasUnsavedChanges(true);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
    setHasUnsavedChanges(true);
  };

  const updateOptionAr = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options_ar) {
      updatedQuestions[questionIndex].options_ar = ['', '', '', ''];
    }
    updatedQuestions[questionIndex].options_ar![optionIndex] = value;
    setQuestions(updatedQuestions);
    setHasUnsavedChanges(true);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleVideoUploaded = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, video_url: url }));
    setHasUnsavedChanges(true);
  }, []);

  const handleVideoUploadedAr = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, video_url_ar: url }));
    setHasUnsavedChanges(true);
  }, []);

  const handleRemoveVideo = useCallback(async () => {
    console.log('[handleRemoveVideo] Début de la suppression');

    // Mettre à jour le state local
    setFormData(prev => {
      console.log('[handleRemoveVideo] Mise à jour du state local, ancien video_url:', prev.video_url);
      return { ...prev, video_url: '' };
    });
    setHasUnsavedChanges(true);

    // Si on édite un module existant, sauvegarder immédiatement
    if (module && user) {
      try {
        console.log('[handleRemoveVideo] Mise à jour de la BDD pour module:', module.id);
        const { error } = await supabase
          .from('modules')
          .update({
            video_url: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        console.log('[handleRemoveVideo] Vidéo supprimée de la base de données avec succès');
      } catch (error) {
        console.error('[handleRemoveVideo] Erreur lors de la mise à jour du module:', error);
        alert('Erreur lors de la suppression de la vidéo');
      }
    } else {
      console.log('[handleRemoveVideo] Nouveau module (non sauvegardé), mise à jour state uniquement');
    }
  }, [module, user]);

  const handleRemoveVideoAr = useCallback(async () => {
    // Mettre à jour le state local
    setFormData(prev => ({ ...prev, video_url_ar: '' }));
    setHasUnsavedChanges(true);

    // Si on édite un module existant, sauvegarder immédiatement
    if (module && user) {
      try {
        const { error } = await supabase
          .from('modules')
          .update({
            video_url_ar: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        console.log('Vidéo arabe supprimée de la base de données');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du module:', error);
        alert('Erreur lors de la suppression de la vidéo arabe');
      }
    }
  }, [module, user]);

  const handlePresentationUploaded = useCallback((url: string, type: 'pdf' | 'powerpoint') => {
    setFormData(prev => ({
      ...prev,
      presentation_url: url,
      presentation_type: type
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handlePresentationUploadedAr = useCallback((url: string, type: 'pdf' | 'powerpoint') => {
    setFormData(prev => ({
      ...prev,
      presentation_url_ar: url,
      presentation_type_ar: type
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleRemovePresentation = useCallback(async () => {
    // Mettre à jour le state local
    setFormData(prev => ({
      ...prev,
      presentation_url: '',
      presentation_type: ''
    }));
    setHasUnsavedChanges(true);

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
      } catch (error) {
        console.error('Erreur lors de la mise à jour du module:', error);
        alert('Erreur lors de la suppression de la présentation');
      }
    }
  }, [module, user]);

  const handleRemovePresentationAr = useCallback(async () => {
    // Mettre à jour le state local
    setFormData(prev => ({
      ...prev,
      presentation_url_ar: '',
      presentation_type_ar: ''
    }));
    setHasUnsavedChanges(true);

    // Si on édite un module existant, sauvegarder immédiatement
    if (module && user) {
      try {
        const { error} = await supabase
          .from('modules')
          .update({
            presentation_url_ar: null,
            presentation_type_ar: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        console.log('Présentation arabe supprimée de la base de données');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du module:', error);
        alert('Erreur lors de la suppression de la présentation arabe');
      }
    }
  }, [module, user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-4 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('module_form.back_to_list')}
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {module ? t('module_form.edit_module') : t('module_form.new_module')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('module_form.general_information')}</h2>

          {/* Language Tabs */}
          <div className="flex gap-2 border-b mb-6">
            <button
              type="button"
              onClick={() => setLanguageTab('fr')}
              className={`px-4 py-2 font-medium transition-colors ${
                languageTab === 'fr'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('module_form.french_tab')}
            </button>
            <button
              type="button"
              onClick={() => setLanguageTab('ar')}
              className={`px-4 py-2 font-medium transition-colors ${
                languageTab === 'ar'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('module_form.arabic_tab')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {languageTab === 'fr' ? (
              <>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('module_form.module_title_required')} {t('module_form.module_title_fr')}
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('module_form.module_description')} {t('module_form.module_title_fr')}
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('module_form.video_optional')} (Français)
                  </label>
                  <VideoUpload
                    onVideoUploaded={handleVideoUploaded}
                    currentVideoUrl={formData.video_url}
                    onRemoveVideo={handleRemoveVideo}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('module_form.presentation_optional')} (Français)
                  </label>
                  <PresentationUpload
                    onPresentationUploaded={handlePresentationUploaded}
                    currentPresentationUrl={formData.presentation_url}
                    currentPresentationType={formData.presentation_type as 'pdf' | 'powerpoint' | undefined}
                    onRemovePresentation={handleRemovePresentation}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('module_form.module_title_required')} {t('module_form.module_title_ar')}
                  </label>
                  <input
                    id="title_ar"
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => updateFormData({ title_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    dir="rtl"
                    placeholder="الترجمة العربية للعنوان"
                  />
                </div>

                <div>
                  <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('module_form.module_description')} {t('module_form.module_title_ar')}
                  </label>
                  <textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => updateFormData({ description_ar: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    dir="rtl"
                    placeholder="الترجمة العربية للوصف"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('module_form.video_optional')} (عربية)
                  </label>
                  <VideoUpload
                    onVideoUploaded={handleVideoUploadedAr}
                    currentVideoUrl={formData.video_url_ar}
                    onRemoveVideo={handleRemoveVideoAr}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('module_form.presentation_optional')} (عربية)
                  </label>
                  <PresentationUpload
                    onPresentationUploaded={handlePresentationUploadedAr}
                    currentPresentationUrl={formData.presentation_url_ar}
                    currentPresentationType={formData.presentation_type_ar as 'pdf' | 'powerpoint' | undefined}
                    onRemovePresentation={handleRemovePresentationAr}
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="training_path_id" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('module_form.training_path_select')}
                </label>
                <select
                  id="training_path_id"
                  value={formData.training_path_id}
                  onChange={(e) => updateFormData({ training_path_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? t('module_form.loading_paths') : t('module_form.select_path')}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {getTranslatedField(category, 'name', language)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {t('module_form.path_help')}
                  {categoriesLoading && ` (${t('module_form.loading_paths')})`}
                </p>
                {!categoriesLoading && categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {t('module_form.no_paths')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('module_form.order_in_path')}
                </label>
                <input
                  id="order_index"
                  type="number"
                  min="0"
                  value={formData.order_index}
                  onChange={(e) => updateFormData({ order_index: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('module_form.order_help')}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => updateFormData({ is_active: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                {t('module_form.module_active')}
              </label>
            </div>
          </div>
        </div>

        {/* Module Type Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('module_form.module_type_section')}</h2>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <input
                id="single-page"
                type="radio"
                checked={!isMultiPage}
                onChange={() => updateIsMultiPage(false)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="single-page" className="ml-2 text-sm font-medium text-gray-700">
                {t('module_form.single_page_module')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="multi-page"
                type="radio"
                checked={isMultiPage}
                onChange={() => updateIsMultiPage(true)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="multi-page" className="ml-2 text-sm font-medium text-gray-700">
                {t('module_form.multi_page_module')}
              </label>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            {isMultiPage
              ? t('module_form.multi_page_help')
              : t('module_form.single_page_help')}</p>
        </div>

        {/* Multi-page Editor */}
        {isMultiPage && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('module_form.module_pages')}</h2>
            <ModulePagesEditor
              pages={pages}
              onChange={updatePages}
              moduleId={module?.id}
            />
          </div>
        )}

        {/* Content - Only show for single-page modules */}
        {!isMultiPage && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('module_form.module_content_section')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {languageTab === 'fr' ? t('module_form.content_fr') + ' ' + t('module_form.module_title_fr') : t('module_form.content_ar') + ' ' + t('module_form.module_title_ar')}
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor
                key={`editor-${languageTab}`}
                value={languageTab === 'fr' ? formData.content : formData.content_ar}
                onChange={(content) => updateFormData(languageTab === 'fr' ? { content } : { content_ar: content })}
                placeholder={languageTab === 'fr' ? t('module_form.content_placeholder_fr') : t('module_form.content_placeholder_ar')}
                height={500}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {languageTab === 'fr'
                ? t('module_form.editor_help_fr')
                : t('module_form.editor_help_ar')}
            </p>
          </div>
          </div>
        )}

        {/* Quiz Questions - Only show for single-page modules */}
        {!isMultiPage && (
          <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('module_form.quiz_section')} ({questions.length} {t('module_form.quiz_questions_count')})</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('module_form.add_question')}
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t('module_form.no_questions')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">{t('module_form.question_number')} {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                      title={t('module_form.delete_question')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Language Tabs for Questions */}
                  <div className="flex gap-2 border-b mb-4">
                    <button
                      type="button"
                      onClick={() => setLanguageTab('fr')}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        languageTab === 'fr'
                          ? 'border-b-2 border-orange-500 text-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Français
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguageTab('ar')}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        languageTab === 'ar'
                          ? 'border-b-2 border-orange-500 text-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      عربية
                    </button>
                  </div>

                  <div className="space-y-4">
                    {languageTab === 'fr' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('module_form.question_text')} (Français)
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder={t('module_form.question_placeholder')}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('module_form.answer_options')} (Français)
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
                                  placeholder={`${t('module_form.option_placeholder')} ${oIndex + 1}`}
                                  required
                                />
                                <span className="text-xs text-gray-500 w-20">
                                  {question.correct === oIndex ? t('module_form.correct_option') : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {t('module_form.select_correct_help')}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('module_form.question_text')} (عربية)
                          </label>
                          <input
                            type="text"
                            value={question.question_ar || ''}
                            onChange={(e) => updateQuestion(qIndex, 'question_ar', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="السؤال بالعربية"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('module_form.answer_options')} (عربية)
                          </label>
                          <div className="space-y-2">
                            {(question.options_ar || ['', '', '', '']).map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`correct-ar-${qIndex}`}
                                  checked={question.correct === oIndex}
                                  onChange={() => updateQuestion(qIndex, 'correct', oIndex)}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOptionAr(qIndex, oIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  placeholder={`الخيار ${oIndex + 1}`}
                                  dir="rtl"
                                />
                                <span className="text-xs text-gray-500 w-20">
                                  {question.correct === oIndex ? '✓' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2" dir="rtl">
                            اختر الإجابة الصحيحة
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('module_form.cancel')}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? t('module_form.saving') : t('module_form.save')}
          </button>
        </div>
      </form>
    </div>
  );
}