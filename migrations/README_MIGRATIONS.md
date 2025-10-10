# 🔧 Guide de Migration - Bodega Academy

## 🚨 Problèmes Actuels Détectés

Vous rencontrez actuellement **2 erreurs** :

1. ❌ **Colonnes manquantes** : `has_multiple_pages`, `name_ar`, `description_ar`, etc.
2. ❌ **Duplicate order_index** : Plusieurs modules ont le même numéro d'ordre dans un parcours

## 📋 Solution en 2 Étapes

### Étape 1️⃣ : Diagnostic (Optionnel mais recommandé)

Ce script vous montre l'état actuel de votre base de données :

```sql
-- Fichier: diagnose_issues.sql
-- Ouvrez Supabase Dashboard → SQL Editor
-- Copiez-collez le contenu de ce fichier
-- Cliquez sur "Run"
```

**Ce que vous verrez :**
- ✅ Quelles colonnes existent ou manquent
- ⚠️ Quels modules ont des numéros d'ordre en double
- 📊 L'ordre actuel de tous vos modules
- 📈 Combien de modules par parcours

### Étape 2️⃣ : Correction Complète ✨

Ce script **résout TOUS les problèmes automatiquement** :

```sql
-- Fichier: fix_duplicate_order_index.sql
-- Ouvrez Supabase Dashboard → SQL Editor
-- Copiez-collez le contenu de ce fichier
-- Cliquez sur "Run"
```

## 🎯 Ce que fait le script de correction

### ✅ Ajoute les colonnes manquantes

**Table `training_paths` :**
- `name_ar` - Nom en arabe
- `description_ar` - Description en arabe

**Table `modules` :**
- `title_ar` - Titre en arabe
- `description_ar` - Description en arabe
- `content_ar` - Contenu en arabe (HTML)
- `has_multiple_pages` - Support multi-pages
- `pages` - Pages multiples (JSONB)

### ✅ Corrige les numéros d'ordre en double

Le script va automatiquement :
1. 🔍 Trouver tous les modules avec des `order_index` en double
2. 📝 Les renuméroter séquentiellement (0, 1, 2, 3...)
3. ✨ Maintenir l'ordre chronologique (par date de création)

**Exemple de correction :**

**AVANT :**
```
Parcours "Tronc Commun"
- Module A → order_index: 0
- Module B → order_index: 1
- Module C → order_index: 1  ❌ DOUBLON!
```

**APRÈS :**
```
Parcours "Tronc Commun"
- Module A → order_index: 0
- Module B → order_index: 1
- Module C → order_index: 2  ✅ CORRIGÉ!
```

### ✅ Ajoute les traductions arabes

**Parcours de formation traduits :**
- 🌟 Tronc Commun → الجذع المشترك
- 🛒 Opérations Magasin → عمليات المتجر
- 📦 Opérations Entrepôt → عمليات المستودع
- 👑 Management → الإدارة والقيادة
- 💼 Fonctions Support → وظائف الدعم
- 🛡️ Sécurité et Qualité → السلامة والجودة

**Module de bienvenue traduit :**
- Titre : "مرحباً بك" (Bienvenue)
- Contenu complet en arabe avec les valeurs de l'entreprise

### ✅ Optimise les performances

Crée des index sur :
- `modules.has_multiple_pages`
- `training_paths.name_ar`
- `modules.title_ar`

## 📝 Instructions d'Exécution

### Option A : Correction Directe (Recommandé)

Si vous me faites confiance et voulez tout corriger d'un coup :

1. Ouvrez **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Ouvrez le fichier : `migrations/fix_duplicate_order_index.sql`
4. Copiez **tout le contenu**
5. Collez dans l'éditeur SQL
6. Cliquez sur **"Run"** ▶️
7. Attendez le message de succès ✅

### Option B : Diagnostic puis Correction

Si vous voulez d'abord voir les problèmes :

**1. Diagnostic :**
```bash
# Ouvrez: migrations/diagnose_issues.sql
# Exécutez dans Supabase SQL Editor
```

**2. Correction :**
```bash
# Ouvrez: migrations/fix_duplicate_order_index.sql
# Exécutez dans Supabase SQL Editor
```

## ✨ Résultat Final

Après avoir exécuté `fix_duplicate_order_index.sql`, vous aurez :

✅ **Plus d'erreurs !**
- ❌ `Could not find the 'has_multiple_pages' column` → ✅ RÉSOLU
- ❌ `duplicate key value violates unique constraint` → ✅ RÉSOLU
- ❌ `Could not find the 'name_ar' column` → ✅ RÉSOLU

✅ **Nouvelles fonctionnalités :**
- 🌐 Support complet de l'arabe (interface bilingue)
- 📄 Modules multi-pages avec navigation
- 🔒 Système de verrouillage séquentiel fonctionnel
- ⚡ Base de données optimisée

✅ **Vous pourrez :**
- Créer des modules sans erreur
- Modifier des modules existants
- Sauvegarder des parcours avec traductions arabes
- Utiliser le système multi-pages
- Gérer l'ordre des modules proprement

## 🔍 Vérification

Après l'exécution, vérifiez que tout fonctionne :

1. **Rechargez votre application** (F5 ou Ctrl+R)
2. **Testez la création d'un module**
3. **Testez la modification d'un parcours**
4. **Vérifiez les traductions arabes** (bouton de langue)

## 🆘 En cas de Problème

Si après avoir exécuté le script vous avez encore des erreurs :

1. **Vérifiez les logs dans l'éditeur SQL** de Supabase
2. **Copiez le message d'erreur complet**
3. **Rechargez le cache** de Supabase :
   - Settings → API → Reload schema cache
4. **Redémarrez votre application** (arrêtez et relancez `npm run dev`)

## 📚 Fichiers de Migration Disponibles

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| `diagnose_issues.sql` | 🔍 Diagnostic seulement | Pour voir les problèmes |
| `fix_duplicate_order_index.sql` | ✅ **TOUT-EN-UN** | **EXÉCUTER CELUI-CI** |
| `complete_schema_update.sql` | 📦 Alternative complète | Si le premier ne marche pas |
| `add_multipage_support_modules.sql` | 📄 Multi-pages seulement | Déjà inclus dans fix_ |
| `add_arabic_translations_complete.sql` | 🌐 Traductions seulement | Déjà inclus dans fix_ |

## ✅ Script Recommandé

**Exécutez simplement :** `fix_duplicate_order_index.sql`

Ce script fait TOUT :
- ✅ Ajoute les colonnes manquantes
- ✅ Corrige les doublons d'ordre
- ✅ Ajoute les traductions arabes
- ✅ Crée les index de performance
- ✅ Affiche un rapport détaillé

## 🎉 C'est Tout !

Une fois le script exécuté avec succès, votre plateforme Bodega Academy sera complètement fonctionnelle avec :
- 🌐 Support bilingue (FR/AR)
- 📄 Modules multi-pages
- 🔢 Ordre des modules cohérent
- ⚡ Performance optimisée

Bonne chance ! 🚀
