# Migration: Traductions Darija pour l'Onboarding

Cette migration ajoute le support des traductions arabes (darija) pour le processus d'onboarding en créant des tables de référence pour les rôles et départements.

## Ce que fait cette migration

1. **Crée la table `job_roles`** avec les colonnes:
   - `id` (clé primaire)
   - `name` (nom en français)
   - `name_ar` (nom en darija)
   - `description` (description en français)
   - `description_ar` (description en darija)
   - `category` ('store', 'warehouse', ou 'corporate')
   - `icon` (nom de l'icône Lucide)

2. **Crée la table `departments`** avec les colonnes:
   - `id` (clé primaire)
   - `name` (nom en français)
   - `name_ar` (nom en darija)
   - `description` (description en français)
   - `description_ar` (description en darija)

3. **Insère les données** pour:
   - 15 rôles de job (Store Operations, Warehouse, Corporate)
   - 8 départements

4. **Configure RLS** (Row Level Security):
   - Tout le monde peut lire
   - Seuls les admins peuvent modifier

## Comment exécuter cette migration

### Option 1: Via Supabase Dashboard (Recommandé)

1. Ouvrez votre projet Supabase: https://app.supabase.com
2. Allez dans **SQL Editor**
3. Cliquez sur **New Query**
4. Copiez-collez le contenu du fichier `add_onboarding_arabic_translations.sql`
5. Cliquez sur **Run**

### Option 2: Via CLI Supabase

```bash
# Si vous avez Supabase CLI installé
supabase db push

# Ou directement avec psql
psql $DATABASE_URL -f migrations/add_onboarding_arabic_translations.sql
```

## Vérification

Après l'exécution de la migration, vérifiez que tout fonctionne:

```sql
-- Vérifier les job roles
SELECT id, name, name_ar, category FROM job_roles ORDER BY category, name;

-- Vérifier les départements
SELECT id, name, name_ar FROM departments ORDER BY name;

-- Compter les entrées
SELECT
  (SELECT COUNT(*) FROM job_roles) as job_roles_count,
  (SELECT COUNT(*) FROM departments) as departments_count;
```

Résultat attendu:
- 15 job roles (5 store + 5 warehouse + 5 corporate)
- 8 départements

## Traductions incluses

### Job Roles (Exemples)

| ID | Français | Darija |
|----|----------|--------|
| manager | Store Manager | مدير المحل |
| cashier | Cashier | الكاشير |
| warehouse_manager | Warehouse Manager | مدير المخزن |
| hr | Human Resources | الموارد البشرية |

### Départements (Exemples)

| ID | Français | Darija |
|----|----------|--------|
| store_operations | Store Operations | عمليات المحل |
| warehouse_logistics | Warehouse & Logistics | المخزن واللوجستيات |
| human_resources | Human Resources | الموارد البشرية |

## Impact sur l'application

Après cette migration, l'application va:

1. **Charger les rôles et départements depuis la base de données** au lieu d'utiliser des données en dur
2. **Afficher automatiquement les traductions** selon la langue sélectionnée (FR/AR)
3. **Permettre aux admins** de modifier les rôles et départements via l'interface (future fonctionnalité)

## Rollback

Si vous devez annuler cette migration:

```sql
-- Supprimer les tables
DROP TABLE IF EXISTS job_roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
```

**⚠️ Attention:** Cela supprimera toutes les données de référence. Assurez-vous qu'aucune donnée utilisateur ne dépende de ces tables.

## Prochaines étapes

1. ✅ Exécuter la migration
2. ✅ Tester l'onboarding en français et en darija
3. ✅ Vérifier que les traductions s'affichent correctement
4. 🔄 (Futur) Ajouter une interface admin pour gérer les rôles et départements

## Support

Si vous rencontrez des problèmes:

1. Vérifiez que vous êtes connecté avec un compte admin Supabase
2. Vérifiez les logs d'erreur dans le SQL Editor
3. Assurez-vous que les tables n'existent pas déjà (conflit)
4. Contactez l'équipe de développement

---

**Date de création:** 2025-10-13
**Version:** 1.0
**Compatibilité:** PostgreSQL 12+, Supabase
