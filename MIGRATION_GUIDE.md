# 🗄️ Guide de Migration SQL - Système QR Onboarding

## ⚠️ IMPORTANT - À faire MAINTENANT

Vous voyez cette erreur :
```
Could not find the 'has_completed_onboarding' column of 'user_profiles' in the schema cache
```

Cela signifie que vous devez **exécuter les migrations SQL dans Supabase** avant de pouvoir utiliser le système.

## 📋 Ordre d'exécution des migrations

Exécutez les migrations **dans cet ordre précis** :

### 1️⃣ Migration 1 - Colonnes user_profiles (REQUIS)
**Fichier** : `migrations/00_check_user_profiles_columns.sql`
**Durée** : ~5 secondes
**Description** : Ajoute les colonnes manquantes à la table user_profiles

### 2️⃣ Migration 2 - Système QR Onboarding (REQUIS)
**Fichier** : `migrations/add_qr_onboarding_system_v2.sql`
**Durée** : ~10 secondes
**Description** : Crée toutes les tables pour le système QR

## 🚀 Instructions pas à pas

### Étape 1 : Accéder à Supabase

1. Ouvrez un navigateur
2. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
3. Connectez-vous avec votre compte
4. Sélectionnez votre projet **Bodega Academy**

### Étape 2 : Ouvrir l'éditeur SQL

1. Dans le menu de gauche, cliquez sur **"SQL Editor"** (icône ⚡)
2. Cliquez sur **"New query"** (en haut à droite)

### Étape 3 : Exécuter la migration 1

1. Ouvrez le fichier `migrations/00_check_user_profiles_columns.sql`
2. **Copiez tout le contenu** (Ctrl+A, Ctrl+C)
3. **Collez** dans l'éditeur SQL de Supabase
4. Cliquez sur **"Run"** (ou Ctrl+Enter)

**✅ Résultat attendu :**
```
Added column: has_completed_onboarding
Added column: initial_assessment_score
Added column: initial_assessment_completed_at
Added column: onboarded_via_qr
Added column: birth_date
✓ user_profiles table structure verified and updated!
```

**Note** : Si certaines colonnes existent déjà, vous verrez "already exists", c'est normal.

### Étape 4 : Exécuter la migration 2

1. Cliquez sur **"New query"** à nouveau
2. Ouvrez le fichier `migrations/add_qr_onboarding_system_v2.sql`
3. **Copiez tout le contenu**
4. **Collez** dans l'éditeur SQL de Supabase
5. Cliquez sur **"Run"**

**✅ Résultat attendu :**
```
QR Onboarding System V2 migration completed successfully!
Tables created: onboarding_qr_codes, onboarding_assessments, onboarding_responses
Default assessment added with 5 questions
RLS policies configured for public and authenticated access
```

### Étape 5 : Vérifier que tout est OK

Dans l'éditeur SQL, exécutez cette requête :

```sql
-- Vérifier les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%onboarding%'
ORDER BY table_name;
```

**✅ Vous devriez voir :**
- `onboarding_assessments`
- `onboarding_qr_codes`
- `onboarding_responses`

### Étape 6 : Vérifier l'évaluation par défaut

```sql
-- Vérifier qu'il y a bien une évaluation
SELECT id, title, is_active, passing_score
FROM onboarding_assessments;
```

**✅ Vous devriez voir :**
- Une ligne avec "Évaluation initiale générale"
- `is_active = true`
- `passing_score = 70`

### Étape 7 : Rafraîchir le cache Supabase

1. Dans le menu de gauche, allez dans **"Settings"**
2. Cliquez sur **"API"**
3. Tout en bas, cliquez sur **"Reload schema cache"** ou **"Refresh"**

Cela force Supabase à recharger la structure des tables.

### Étape 8 : Tester l'application

1. Retournez sur votre application : `http://localhost:5173`
2. **Rafraîchissez la page** (F5 ou Ctrl+R)
3. Testez la création d'un QR code

## 🔍 Dépannage

### Erreur : "relation does not exist"

**Cause** : La migration 2 n'a pas été exécutée.

**Solution** :
1. Vérifiez que vous avez exécuté `add_qr_onboarding_system_v2.sql`
2. Vérifiez les erreurs dans l'éditeur SQL
3. Essayez de réexécuter la migration

### Erreur : "column already exists"

**Cause** : Vous avez déjà exécuté une partie de la migration.

**Solution** :
- Ce n'est pas grave, continuez avec la migration suivante
- Le script détecte automatiquement les colonnes existantes

### Erreur : "permission denied"

**Cause** : Problème de permissions RLS.

**Solution** :
```sql
-- Désactiver temporairement RLS pour tester
ALTER TABLE onboarding_qr_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses DISABLE ROW LEVEL SECURITY;

-- Puis réactiver après avoir créé les policies
-- (la migration V2 les réactive automatiquement)
```

### Le cache ne se rafraîchit pas

**Solution** :
1. Allez dans **Settings** → **API** dans Supabase
2. Cliquez sur **"Reload schema cache"**
3. Attendez 10-20 secondes
4. Rafraîchissez votre application

## 📊 Vérification complète

Pour vérifier que TOUT est correctement installé, exécutez ce script :

```sql
-- Script de vérification complet
DO $$
DECLARE
    qr_count INTEGER;
    assessment_count INTEGER;
    response_count INTEGER;
    user_profile_columns INTEGER;
BEGIN
    -- Compter les tables
    SELECT COUNT(*) INTO qr_count
    FROM information_schema.tables
    WHERE table_name = 'onboarding_qr_codes';

    SELECT COUNT(*) INTO assessment_count
    FROM information_schema.tables
    WHERE table_name = 'onboarding_assessments';

    SELECT COUNT(*) INTO response_count
    FROM information_schema.tables
    WHERE table_name = 'onboarding_responses';

    -- Compter les colonnes user_profiles
    SELECT COUNT(*) INTO user_profile_columns
    FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name IN (
        'has_completed_onboarding',
        'job_role',
        'department',
        'initial_assessment_score',
        'initial_assessment_completed_at',
        'onboarded_via_qr',
        'birth_date'
    );

    -- Afficher les résultats
    RAISE NOTICE '=== Vérification de l''installation ===';
    RAISE NOTICE 'Table onboarding_qr_codes: %', CASE WHEN qr_count = 1 THEN '✓' ELSE '✗' END;
    RAISE NOTICE 'Table onboarding_assessments: %', CASE WHEN assessment_count = 1 THEN '✓' ELSE '✗' END;
    RAISE NOTICE 'Table onboarding_responses: %', CASE WHEN response_count = 1 THEN '✓' ELSE '✗' END;
    RAISE NOTICE 'Colonnes user_profiles: % / 7', user_profile_columns;

    IF qr_count = 1 AND assessment_count = 1 AND response_count = 1 AND user_profile_columns = 7 THEN
        RAISE NOTICE '✓✓✓ Installation complète et réussie ! ✓✓✓';
    ELSE
        RAISE WARNING '⚠ Installation incomplète. Vérifiez les erreurs ci-dessus.';
    END IF;
END $$;
```

## ✅ Checklist finale

Avant de considérer la migration comme réussie, vérifiez :

- [ ] Migration 1 exécutée sans erreur
- [ ] Migration 2 exécutée sans erreur
- [ ] Cache Supabase rafraîchi
- [ ] Script de vérification retourne "Installation complète"
- [ ] L'application ne montre plus d'erreurs dans la console
- [ ] Vous pouvez créer un QR code dans l'interface admin

## 🎯 Après la migration

Une fois la migration terminée :

1. **Rafraîchissez l'application** (F5)
2. **Connectez-vous en tant qu'admin** (admin@bodega.ma)
3. **Cliquez sur "Codes QR"**
4. **Créez votre premier QR code** ! 🎉

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les messages d'erreur dans l'éditeur SQL Supabase
2. Consultez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Vérifiez les logs de votre application (F12 → Console)

## 📚 Fichiers de migration

| Fichier | Description | Ordre |
|---------|-------------|-------|
| `00_check_user_profiles_columns.sql` | Colonnes user_profiles | 1er |
| `add_qr_onboarding_system_v2.sql` | Tables et système QR | 2ème |

---

**🚀 Une fois ces migrations exécutées, votre système QR Onboarding sera 100% fonctionnel !**
