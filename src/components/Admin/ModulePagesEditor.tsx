import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Edit2, Save, X } from 'lucide-react';
import { ModulePage, QuizQuestion } from '../../lib/supabase';
import { RichTextEditor } from './RichTextEditor';
import { VideoUpload } from './VideoUpload';
import { PresentationUpload } from './PresentationUpload';
import { useTranslation } from '../../hooks/useTranslation';

interface ModulePagesEditorProps {
  pages: ModulePage[];
  onChange: (pages: ModulePage[]) => void;
}

export function ModulePagesEditor({ pages, onChange }: ModulePagesEditorProps) {
  const { t } = useTranslation();
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [expandedPageIndex, setExpandedPageIndex] = useState<number | null>(null);
  const [pageLanguageTab, setPageLanguageTab] = useState<{ [key: number]: 'fr' | 'ar' }>({});

  const addPage = () => {
    const newPage: ModulePage = {
      id: `temp-${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      content: '',
      quiz_questions: [],
      order_index: pages.length,
      has_quiz: false
    };
    onChange([...pages, newPage]);
    setExpandedPageIndex(pages.length);
  };

  const removePage = (index: number) => {
    if (confirm(t('module_pages_editor.confirm_delete'))) {
      const newPages = pages.filter((_, i) => i !== index);
      // Réajuster les order_index
      newPages.forEach((page, i) => page.order_index = i);
      onChange(newPages);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newPages.length) return;

    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
    newPages[index].order_index = index;
    newPages[targetIndex].order_index = targetIndex;

    onChange(newPages);
  };

  const updatePage = (index: number, updates: Partial<ModulePage>) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], ...updates };
    onChange(newPages);
  };

  const addQuestionToPage = (pageIndex: number) => {
    const newQuestion: QuizQuestion = {
      question: '',
      options: ['', '', '', ''],
      correct: 0
    };
    const newPages = [...pages];
    newPages[pageIndex].quiz_questions = [...newPages[pageIndex].quiz_questions, newQuestion];
    newPages[pageIndex].has_quiz = true;
    onChange(newPages);
  };

  const updateQuestion = (pageIndex: number, questionIndex: number, updates: Partial<QuizQuestion>) => {
    const newPages = [...pages];
    newPages[pageIndex].quiz_questions[questionIndex] = {
      ...newPages[pageIndex].quiz_questions[questionIndex],
      ...updates
    };
    onChange(newPages);
  };

  const updateOption = (pageIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const newPages = [...pages];
    newPages[pageIndex].quiz_questions[questionIndex].options[optionIndex] = value;
    onChange(newPages);
  };

  const removeQuestion = (pageIndex: number, questionIndex: number) => {
    const newPages = [...pages];
    newPages[pageIndex].quiz_questions = newPages[pageIndex].quiz_questions.filter((_, i) => i !== questionIndex);
    if (newPages[pageIndex].quiz_questions.length === 0) {
      newPages[pageIndex].has_quiz = false;
    }
    onChange(newPages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('module_pages_editor.pages_title')}</h3>
        <button
          type="button"
          onClick={addPage}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('module_pages_editor.add_page')}
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">{t('module_pages_editor.no_pages')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page, pageIndex) => (
            <div key={page.id} className="bg-gray-50 rounded-lg border border-gray-200">
              {/* Page Header */}
              <div className="flex items-center gap-3 p-4">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                  {pageIndex + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{page.title}</h4>
                  <p className="text-sm text-gray-500">
                    {page.has_quiz ? `${page.quiz_questions.length} ${t('module_pages_editor.has_quiz')}` : t('module_pages_editor.no_quiz')}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePage(pageIndex, 'up')}
                    disabled={pageIndex === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    title={t('module_pages_editor.move_up')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(pageIndex, 'down')}
                    disabled={pageIndex === pages.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    title={t('module_pages_editor.move_down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedPageIndex(expandedPageIndex === pageIndex ? null : pageIndex)}
                    className="p-2 text-gray-500 hover:text-indigo-600"
                    title={t('module_pages_editor.edit')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePage(pageIndex)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title={t('module_pages_editor.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Page Content (when expanded) */}
              {expandedPageIndex === pageIndex && (
                <div className="p-4 pt-0 space-y-4 border-t border-gray-200">
                  {/* Language Tabs */}
                  <div className="flex gap-2 border-b mb-4">
                    <button
                      type="button"
                      onClick={() => setPageLanguageTab(prev => ({ ...prev, [pageIndex]: 'fr' }))}
                      className={`px-4 py-2 font-medium transition-colors ${
                        (pageLanguageTab[pageIndex] || 'fr') === 'fr'
                          ? 'border-b-2 border-orange-500 text-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t('module_form.french_tab')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageLanguageTab(prev => ({ ...prev, [pageIndex]: 'ar' }))}
                      className={`px-4 py-2 font-medium transition-colors ${
                        pageLanguageTab[pageIndex] === 'ar'
                          ? 'border-b-2 border-orange-500 text-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t('module_form.arabic_tab')}
                    </button>
                  </div>

                  {(pageLanguageTab[pageIndex] || 'fr') === 'fr' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('module_pages_editor.page_title_fr')} {t('module_form.module_title_fr')}
                        </label>
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => updatePage(pageIndex, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder={t('module_pages_editor.page_title_placeholder_fr')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('module_pages_editor.page_content_fr')} {t('module_form.module_title_fr')}
                        </label>
                        <RichTextEditor
                          value={page.content}
                          onChange={(content) => updatePage(pageIndex, { content })}
                        />
                      </div>

                      {/* Video Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('module_pages_editor.video_optional')}
                        </label>
                        <VideoUpload
                          onVideoUploaded={(url) => updatePage(pageIndex, { video_url: url })}
                          currentVideoUrl={page.video_url}
                          onRemoveVideo={() => updatePage(pageIndex, { video_url: undefined })}
                        />
                      </div>

                      {/* Presentation Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('module_pages_editor.presentation_optional')}
                        </label>
                        <PresentationUpload
                          onPresentationUploaded={(url, type) => updatePage(pageIndex, {
                            presentation_url: url,
                            presentation_type: type
                          })}
                          currentPresentationUrl={page.presentation_url}
                          currentPresentationType={page.presentation_type}
                          onRemovePresentation={() => updatePage(pageIndex, {
                            presentation_url: undefined,
                            presentation_type: undefined
                          })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('module_pages_editor.page_title_ar')} {t('module_form.module_title_ar')}
                        </label>
                        <input
                          type="text"
                          value={page.title_ar || ''}
                          onChange={(e) => updatePage(pageIndex, { title_ar: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          dir="rtl"
                          placeholder={t('module_pages_editor.page_title_placeholder_ar')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('module_pages_editor.page_content_ar')} {t('module_form.module_title_ar')}
                        </label>
                        <RichTextEditor
                          value={page.content_ar || ''}
                          onChange={(content) => updatePage(pageIndex, { content_ar: content })}
                        />
                      </div>

                      {/* Video Upload - Same as French */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('module_pages_editor.video_optional')}
                        </label>
                        <VideoUpload
                          onVideoUploaded={(url) => updatePage(pageIndex, { video_url: url })}
                          currentVideoUrl={page.video_url}
                          onRemoveVideo={() => updatePage(pageIndex, { video_url: undefined })}
                        />
                        <p className="text-xs text-gray-500 mt-2" dir="rtl">
                          {t('module_pages_editor.same_video')}
                        </p>
                      </div>

                      {/* Presentation Upload - Same as French */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('module_pages_editor.presentation_optional')}
                        </label>
                        <PresentationUpload
                          onPresentationUploaded={(url, type) => updatePage(pageIndex, {
                            presentation_url: url,
                            presentation_type: type
                          })}
                          currentPresentationUrl={page.presentation_url}
                          currentPresentationType={page.presentation_type}
                          onRemovePresentation={() => updatePage(pageIndex, {
                            presentation_url: undefined,
                            presentation_type: undefined
                          })}
                        />
                        <p className="text-xs text-gray-500 mt-2" dir="rtl">
                          {t('module_pages_editor.same_presentation')}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Quiz Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">{t('module_pages_editor.page_quiz')}</h4>
                      <button
                        type="button"
                        onClick={() => addQuestionToPage(pageIndex)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4" />
                        {t('module_pages_editor.add_question')}
                      </button>
                    </div>

                    {page.quiz_questions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">{t('module_pages_editor.no_questions')}</p>
                    ) : (
                      <div className="space-y-4">
                        {page.quiz_questions.map((question, qIndex) => (
                          <div key={qIndex} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <label className="text-sm font-medium text-gray-700">
                                {t('module_pages_editor.question_number')} {qIndex + 1}
                              </label>
                              <button
                                type="button"
                                onClick={() => removeQuestion(pageIndex, qIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuestion(pageIndex, qIndex, { question: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                              placeholder={t('module_pages_editor.enter_question')}
                            />

                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`page-${pageIndex}-question-${qIndex}`}
                                    checked={question.correct === optIndex}
                                    onChange={() => updateQuestion(pageIndex, qIndex, { correct: optIndex })}
                                    className="text-green-600"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(pageIndex, qIndex, optIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder={`${t('module_pages_editor.option_placeholder')} ${optIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800">
          <strong>{t('module_pages_editor.info_title')}</strong> {t('module_pages_editor.sequential_unlock')}
        </p>
      </div>
    </div>
  );
}
