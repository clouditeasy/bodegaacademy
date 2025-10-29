import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit2, Plus, Trash2, Save, X, AlertCircle, ArrowUpDown } from 'lucide-react';
import { ModuleCategory } from '../../lib/supabase';
import { CategoryService } from '../../services/categoryService';
import { ModuleOrderManager } from './ModuleOrderManager';
import { RichTextEditor } from './RichTextEditor';
import { ImageUpload } from './ImageUpload';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslatedField } from '../../utils/translation';

interface CategoryManagementProps {
  onBack: () => void;
}

interface EditableCategory extends ModuleCategory {
  isEditing?: boolean;
  originalData?: ModuleCategory;
}

export function CategoryManagement({ onBack }: CategoryManagementProps) {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<EditableCategory[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<ModuleCategory>>({
    name: '',
    description: '',
    icon: '',
    color: 'bg-gray-500',
    image_url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [orderManagerPathId, setOrderManagerPathId] = useState<string | null>(null);
  const [languageTab, setLanguageTab] = useState<'fr' | 'ar'>('fr');
  const [editLanguageTab, setEditLanguageTab] = useState<{ [key: string]: 'fr' | 'ar' }>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getAllCategories();
      setCategories(data.map(cat => ({ ...cat })));
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    setCategories(cats => 
      cats.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isEditing: true, originalData: { ...cat } }
          : { ...cat, isEditing: false }
      )
    );
  };

  const handleSaveCategory = async (categoryId: string) => {
    try {
      setSaving(categoryId);
      const categoryToSave = categories.find(c => c.id === categoryId);
      if (!categoryToSave) return;

      const { isEditing, originalData, ...categoryData } = categoryToSave;
      await CategoryService.updateCategory(categoryId, categoryData);
      
      setCategories(cats => 
        cats.map(cat => 
          cat.id === categoryId 
            ? { ...cat, isEditing: false, originalData: undefined }
            : cat
        )
      );
      
      setError(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Erreur lors de la sauvegarde de la catégorie');
    } finally {
      setSaving(null);
    }
  };

  const handleCancelEdit = (categoryId: string) => {
    setCategories(cats => 
      cats.map(cat => {
        if (cat.id === categoryId && cat.originalData) {
          // Restore original data
          return { ...cat.originalData, isEditing: false, originalData: undefined };
        }
        return cat.id === categoryId 
          ? { ...cat, isEditing: false, originalData: undefined }
          : cat;
      })
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        setSaving(categoryId);
        await CategoryService.deleteCategory(categoryId);
        setCategories(cats => cats.filter(cat => cat.id !== categoryId));
        setError(null);
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Erreur lors de la suppression de la catégorie');
      } finally {
        setSaving(null);
      }
    }
  };

  const handleUpdateCategory = (categoryId: string, field: keyof ModuleCategory, value: string) => {
    setCategories(cats =>
      cats.map(cat =>
        cat.id === categoryId
          ? { ...cat, [field]: value }
          : cat
      )
    );
  };

  // Handlers for new category image upload
  const handleNewCategoryImageUploaded = useCallback((url: string) => {
    setNewCategory(prev => ({ ...prev, image_url: url }));
  }, []);

  const handleNewCategoryImageRemove = useCallback(() => {
    setNewCategory(prev => ({ ...prev, image_url: '' }));
  }, []);

  // Handlers for editing category image upload
  const handleEditCategoryImageUploaded = useCallback((categoryId: string, url: string) => {
    handleUpdateCategory(categoryId, 'image_url', url);
  }, []);

  const handleEditCategoryImageRemove = useCallback((categoryId: string) => {
    handleUpdateCategory(categoryId, 'image_url', '');
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.description || !newCategory.icon) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving('new');
      const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      const newCat: Omit<ModuleCategory, 'created_at' | 'updated_at'> = {
        id: categoryId,
        name: newCategory.name!,
        description: newCategory.description!,
        icon: newCategory.icon!,
        color: newCategory.color || 'bg-gray-500',
        order_index: categories.length + 1,
        is_active: true
      };

      const savedCategory = await CategoryService.createCategory(newCat);
      setCategories([...categories, savedCategory]);
      setNewCategory({
        name: '',
        description: '',
        icon: '',
        color: 'bg-gray-500'
      });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Erreur lors de la création de la catégorie');
    } finally {
      setSaving(null);
    }
  };

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Bleu' },
    { value: 'bg-green-500', label: 'Vert' },
    { value: 'bg-red-500', label: 'Rouge' },
    { value: 'bg-yellow-500', label: 'Jaune' },
    { value: 'bg-purple-500', label: 'Violet' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-pink-500', label: 'Rose' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-teal-500', label: 'Sarcelle' },
    { value: 'bg-gray-500', label: 'Gris' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Erreur</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 mb-3 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au dashboard
        </button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Parcours de Formation
          </h1>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau parcours
          </button>
        </div>
        
        <p className="text-gray-600 mt-2">
          Gérez les parcours de formation pour organiser votre contenu par rôles et postes
        </p>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Parcours de Formation</h3>

          {/* Language Tabs */}
          <div className="flex gap-2 border-b mb-4">
            <button
              type="button"
              onClick={() => setLanguageTab('fr')}
              className={`px-4 py-2 font-medium transition-colors ${
                languageTab === 'fr'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🇫🇷 Français
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
              🇲🇦 العربية
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languageTab === 'fr' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du parcours * (Français)
                  </label>
                  <input
                    type="text"
                    value={newCategory.name || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: Parcours Employé Salle / Comptoir"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône (emoji) *
                  </label>
                  <input
                    type="text"
                    value={newCategory.icon || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="🧽"
                    maxLength={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description * (Français)
                  </label>
                  <RichTextEditor
                    value={newCategory.description || ''}
                    onChange={(description) => setNewCategory(prev => ({ ...prev, description }))}
                    placeholder="Description de la catégorie..."
                    height={200}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم (عربية)
                  </label>
                  <input
                    type="text"
                    value={(newCategory as any).name_ar || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name_ar: e.target.value } as any))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    dir="rtl"
                    placeholder="الترجمة العربية للاسم"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف (عربية)
                  </label>
                  <RichTextEditor
                    value={(newCategory as any).description_ar || ''}
                    onChange={(description_ar) => setNewCategory(prev => ({ ...prev, description_ar } as any))}
                    placeholder="الترجمة العربية للوصف..."
                    height={200}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <select
                value={newCategory.color || 'bg-gray-500'}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {colorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Image du parcours (optionnel)
            </label>
            <ImageUpload
              onImageUploaded={handleNewCategoryImageUploaded}
              currentImageUrl={newCategory.image_url || ''}
              onRemoveImage={handleNewCategoryImageRemove}
            />
            <p className="text-xs text-gray-500 mt-2">
              Cette image sera affichée sur la carte du parcours de formation
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAddCategory}
              disabled={saving === 'new'}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving === 'new' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving === 'new' ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Parcours de Formation ({categories.length})
          </h2>
        </div>
        
        <div className="divide-y">
          {categories.map((category) => (
            <div key={category.id} className="p-6">
              {category.isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  {/* Language Tabs */}
                  <div className="flex gap-2 border-b mb-4">
                    <button
                      onClick={() => setEditLanguageTab(prev => ({ ...prev, [category.id]: 'fr' }))}
                      className={`px-4 py-2 font-medium transition-colors ${
                        (editLanguageTab[category.id] || 'fr') === 'fr'
                          ? 'border-b-2 border-orange-500 text-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🇫🇷 Français
                    </button>
                    <button
                      onClick={() => setEditLanguageTab(prev => ({ ...prev, [category.id]: 'ar' }))}
                      className={`px-4 py-2 font-medium transition-colors ${
                        editLanguageTab[category.id] === 'ar'
                          ? 'border-b-2 border-orange-500 text-orange-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🇲🇦 العربية
                    </button>
                  </div>

                  {(editLanguageTab[category.id] || 'fr') === 'fr' ? (
                    /* French Fields */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => handleUpdateCategory(category.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icône
                        </label>
                        <input
                          type="text"
                          value={category.icon}
                          onChange={(e) => handleUpdateCategory(category.id, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          maxLength={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <RichTextEditor
                          value={category.description}
                          onChange={(description) => handleUpdateCategory(category.id, 'description', description)}
                          height={200}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Arabic Fields */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم (Nom en arabe)
                        </label>
                        <input
                          type="text"
                          value={category.name_ar || ''}
                          onChange={(e) => handleUpdateCategory(category.id, 'name_ar', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          dir="rtl"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الوصف (Description en arabe)
                        </label>
                        <RichTextEditor
                          value={category.description_ar || ''}
                          onChange={(description) => handleUpdateCategory(category.id, 'description_ar', description)}
                          height={200}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur
                      </label>
                      <select
                        value={category.color}
                        onChange={(e) => handleUpdateCategory(category.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {colorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Image Upload Section for Edit Mode */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Image du parcours (optionnel)
                    </label>
                    <ImageUpload
                      onImageUploaded={(url) => handleEditCategoryImageUploaded(category.id, url)}
                      currentImageUrl={category.image_url || ''}
                      onRemoveImage={() => handleEditCategoryImageRemove(category.id)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Cette image sera affichée sur la carte du parcours de formation
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleCancelEdit(category.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </button>
                    <button
                      onClick={() => handleSaveCategory(category.id)}
                      disabled={saving === category.id}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {saving === category.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving === category.id ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getTranslatedField(category, 'name', language)}
                      </h3>
                      <div
                        className="text-gray-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: getTranslatedField(category, 'description', language) }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-4 h-4 rounded ${category.color}`}></div>
                        <span className="text-sm text-gray-500">ID: {category.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOrderManagerPathId(category.id)}
                      className="p-2 text-gray-500 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
                      title="Gérer l'ordre des modules"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className="p-2 text-gray-500 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={saving === category.id}
                      className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-red-50"
                      title="Supprimer"
                    >
                      {saving === category.id ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun parcours de formation
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier parcours de formation
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Créer un parcours
            </button>
          </div>
        )}
      </div>

      {/* Module Order Manager Modal */}
      {orderManagerPathId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ModuleOrderManager
              trainingPathId={orderManagerPathId}
              onClose={() => {
                setOrderManagerPathId(null);
                loadCategories(); // Refresh to show updated data
              }}
            />
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Gestion des parcours de formation :</p>
            <p>
              Les modifications sont automatiquement sauvegardées dans la base de données.
              Chaque parcours peut contenir plusieurs modules et se terminer par un quiz final.
              Utilisez l'icône <ArrowUpDown className="h-3 w-3 inline" /> pour gérer l'ordre séquentiel des modules dans chaque parcours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}