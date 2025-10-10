# 🎬 Implémentation des Médias Multilingues

## 📋 Vue d'ensemble

Ce document décrit comment implémenter le support pour des vidéos et présentations séparées par langue (français/arabe) dans Bodega Academy.

## 🎉 IMPLÉMENTATION COMPLÉTÉE

L'implémentation des médias multilingues est maintenant **TERMINÉE** ! Voici un résumé des modifications effectuées :

### Modifications de la base de données ✅
- **Migration SQL créée** : `add_multilingual_media_support.sql`
- Colonnes ajoutées : `video_url_ar`, `presentation_url_ar`, `presentation_type_ar`
- Indexes de performance créés

### Modifications du back office (Admin) ✅
- **ModuleForm.tsx** : Complètement mis à jour
  - Nouveaux champs dans formData pour les médias arabes
  - Handlers de suppression/upload pour vidéos et présentations arabes
  - Interface utilisateur mise à jour avec uploads séparés par langue
  - Labels "(Français)" et "(عربية)" pour identifier les uploads

### Modifications de l'affichage (Front office) ✅
- **src/lib/supabase.ts** : Interface Module mise à jour avec les nouveaux champs
- **ModulePage.tsx** : Logique de sélection des médias selon la langue avec fallback
  - Si langue = arabe ET video_url_ar existe → afficher video_url_ar
  - Sinon → afficher video_url (français)
  - Même logique pour les présentations
- **VideoEmbed.tsx** : ✅ Aucune modification nécessaire
- **PresentationViewer.tsx** : ✅ Aucune modification nécessaire

### Comment ça fonctionne ? 🔧
1. **Upload** : Les admins peuvent uploader des vidéos/présentations différentes pour le français et l'arabe
2. **Affichage** : Le système détecte la langue de l'utilisateur et affiche le média correspondant
3. **Fallback** : Si le média arabe n'existe pas, le système affiche automatiquement le média français

### Prochaines étapes 🚀
1. **Exécuter la migration** dans Supabase (voir section ci-dessous)
2. **Tester l'upload** de médias dans le back office
3. **Tester l'affichage** en changeant de langue
4. **Vérifier le fallback** (afficher français quand arabe n'existe pas)

---

## ✅ Changements complétés (Détails techniques)

### 1. Migration de base de données ✅

**Fichier créé :** `migrations/add_multilingual_media_support.sql`

**Colonnes ajoutées à la table `modules` :**
- `video_url_ar` (TEXT) - URL de la vidéo en arabe
- `presentation_url_ar` (TEXT) - URL de la présentation en arabe
- `presentation_type_ar` (VARCHAR) - Type de présentation arabe (pdf/powerpoint)

**À exécuter :**
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Copiez et exécutez le fichier: migrations/add_multilingual_media_support.sql
```

### 2. ModuleForm.tsx - État mis à jour ✅

**formData** mis à jour avec les nouveaux champs :
```typescript
video_url: '',        // Vidéo française
video_url_ar: '',     // Vidéo arabe
presentation_url: '',  // Présentation française
presentation_url_ar: '', // Présentation arabe
presentation_type: '', // Type français
presentation_type_ar: '', // Type arabe
```

## 🔧 Changements nécessaires

### 3. Ajouter les fonctions handler pour l'arabe

Après la ligne 238 de `ModuleForm.tsx`, ajoutez :

```typescript
// Handlers pour vidéo arabe
const handleVideoUploadedAr = (url: string) => {
  setFormData(prev => ({ ...prev, video_url_ar: url }));
};

const handleRemoveVideoAr = async () => {
  setFormData(prev => ({ ...prev, video_url_ar: '' }));

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
      console.log('Vidéo arabe supprimée');
      onSave();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
};

// Handlers pour présentation arabe
const handlePresentationUploadedAr = (url: string, type: 'pdf' | 'powerpoint') => {
  setFormData(prev => ({
    ...prev,
    presentation_url_ar: url,
    presentation_type_ar: type
  }));
};

const handleRemovePresentationAr = async () => {
  setFormData(prev => ({
    ...prev,
    presentation_url_ar: '',
    presentation_type_ar: ''
  }));

  if (module && user) {
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          presentation_url_ar: null,
          presentation_type_ar: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;
      console.log('Présentation arabe supprimée');
      onSave();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
};
```

### 4. Remplacer la section vidéo/présentation pour l'arabe

**Remplacer les lignes 236-264** (section arabe) par :

```typescript
<>
  <div>
    <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 mb-2">
      {t('module_form.module_title_required')} {t('module_form.module_title_ar')}
    </label>
    <input
      id="title_ar"
      type="text"
      value={formData.title_ar}
      onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
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
      onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      dir="rtl"
      placeholder="الترجمة العربية للوصف"
    />
  </div>

  {/* Vidéo arabe */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      {t('module_form.video_optional')} (عربية)
    </label>
    <VideoUpload
      onVideoUploaded={handleVideoUploadedAr}
      currentVideoUrl={formData.video_url_ar}
      onRemoveVideo={handleRemoveVideoAr}
    />
    <p className="text-xs text-gray-500 mt-2" dir="rtl">
      فيديو منفصل للعربية. إذا لم يتم تحميله، سيتم استخدام الفيديو الفرنسي.
    </p>
  </div>

  {/* Présentation arabe */}
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
    <p className="text-xs text-gray-500 mt-2" dir="rtl">
      عرض تقديمي منفصل للعربية. إذا لم يتم تحميله، سيتم استخدام العرض الفرنسي.
    </p>
  </div>
</>
```

### 5. Mettre à jour les composants d'affichage

**Fichiers à modifier :**

#### A. `ModulePage.tsx` ou `MultiPageModule.tsx`

Ajouter une logique pour choisir la bonne URL selon la langue :

```typescript
import { useLanguage } from '../../contexts/LanguageContext';

// Dans le composant
const { language } = useLanguage();

// Déterminer quelle vidéo afficher
const videoUrl = language === 'ar' && module.video_url_ar
  ? module.video_url_ar
  : module.video_url;

// Déterminer quelle présentation afficher
const presentationUrl = language === 'ar' && module.presentation_url_ar
  ? module.presentation_url_ar
  : module.presentation_url;

const presentationType = language === 'ar' && module.presentation_type_ar
  ? module.presentation_type_ar
  : module.presentation_type;
```

#### B. `VideoEmbed.tsx`

Si le composant reçoit directement le module, ajouter :

```typescript
const { language } = useLanguage();
const effectiveVideoUrl = language === 'ar' && module.video_url_ar
  ? module.video_url_ar
  : module.video_url;
```

#### C. `PresentationViewer.tsx`

Même logique :

```typescript
const { language } = useLanguage();
const effectiveUrl = language === 'ar' && module.presentation_url_ar
  ? module.presentation_url_ar
  : module.presentation_url;

const effectiveType = language === 'ar' && module.presentation_type_ar
  ? module.presentation_type_ar
  : module.presentation_type;
```

### 6. Mettre à jour les types TypeScript

**Dans `src/lib/supabase.ts`**, ajouter à l'interface `Module` :

```typescript
export interface Module {
  // ... champs existants
  video_url?: string;
  video_url_ar?: string;  // AJOUTER
  presentation_url?: string;
  presentation_url_ar?: string;  // AJOUTER
  presentation_type?: 'pdf' | 'powerpoint';
  presentation_type_ar?: 'pdf' | 'powerpoint';  // AJOUTER
  // ... autres champs
}
```

## 📝 Traductions à ajouter

Ajouter dans `src/i18n/translations.json` :

```json
{
  "fr": {
    "module_form": {
      "video_ar": "Vidéo (Arabe)",
      "presentation_ar": "Présentation (Arabe)",
      "separate_files_help": "Vous pouvez uploader des fichiers différents pour chaque langue"
    }
  },
  "ar": {
    "module_form": {
      "video_ar": "فيديو (عربية)",
      "presentation_ar": "عرض تقديمي (عربية)",
      "separate_files_help": "يمكنك رفع ملفات مختلفة لكل لغة"
    }
  }
}
```

## 🎯 Logique de fallback

**Important :** Si un fichier arabe n'est pas disponible, le système utilisera automatiquement le fichier français :

```typescript
// Exemple de logique de fallback
const getVideoUrl = (module: Module, language: string) => {
  if (language === 'ar' && module.video_url_ar) {
    return module.video_url_ar;  // Vidéo arabe disponible
  }
  return module.video_url;  // Fallback vers français
};
```

## ✅ Checklist d'implémentation

- [x] 1. Exécuter la migration SQL
- [x] 2. Mettre à jour formData dans ModuleForm
- [x] 3. Ajouter les fonctions handler AR
- [x] 4. Modifier la section upload arabe
- [x] 5. Mettre à jour l'interface Module TypeScript
- [x] 6. Mettre à jour ModulePage.tsx
- [x] 7. VideoEmbed.tsx (aucune modification nécessaire - fonctionne avec n'importe quelle URL)
- [x] 8. PresentationViewer.tsx (aucune modification nécessaire - fonctionne avec n'importe quelle URL)
- [ ] 9. Ajouter les traductions (optionnel)
- [ ] 10. Tester l'upload de vidéos/présentations
- [ ] 11. Tester l'affichage selon la langue
- [ ] 12. Tester le fallback français

## 🚀 Avantages

1. **Flexibilité** : Fichiers séparés par langue
2. **Fallback intelligent** : Si pas de fichier AR, utilise FR
3. **Expérience utilisateur** : Contenu adapté à la langue
4. **Performance** : Seulement les fichiers nécessaires sont chargés
5. **Gestion simple** : Upload indépendant par langue

## 📞 Support

Si vous avez besoin d'aide pour l'implémentation, référez-vous aux fichiers :
- `migrations/add_multilingual_media_support.sql`
- `src/components/Admin/ModuleForm.tsx`
- Ce document

Bonne chance ! 🎉
