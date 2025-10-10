# 🔒 Implémentation du Verrouillage de Modules

## ✅ Ce qui a été fait

### 1. Base de données (SQL) ✅

#### Migration principale : `migrations/add_module_locking.sql`
- ✅ Correction des doublons d'order_index (ONBOARDING=0, Hola Bienvenido=1)
- ✅ Fonction `is_module_locked(user_id, module_id)` - Vérifie si un module est verrouillé
- ✅ Fonction `get_locked_modules_for_user(user_id, path_id)` - Liste modules avec statut
- ✅ Vue `user_module_access` - Vue SQL combinée
- ✅ Index unique sur (training_path_id, order_index) - Empêche futurs doublons
- ✅ Index de performance pour optimiser les requêtes
- ✅ Trigger de validation pour order_index
- ✅ Tests automatiques

#### Fonction RPC : `migrations/add_rpc_function.sql`
- ⏳ **À EXÉCUTER** : Fonction `get_module_access_status(user_id, path_id)`
- Cette fonction est appelée par les hooks React

### 2. Code Frontend (TypeScript/React) ✅

#### Hooks mis à jour :
- ✅ **useModuleAccess.ts** - Utilise la fonction SQL via RPC
- ✅ **useModuleLocking.ts** - Déjà compatible (utilise get_module_access_status)

#### Composants utilisant le verrouillage :
- ✅ **CategoryModulesView.tsx** - Affiche les modules verrouillés avec icône 🔒
- ✅ **PathProgressIndicator.tsx** - Indicateur de progression avec verrouillage
- ✅ **ModulePageNavigation.tsx** - Navigation entre pages avec verrouillage

---

## 🚀 Prochaines étapes

### Étape 1 : Exécuter le script RPC ⏳

**Copiez et exécutez** dans Supabase SQL Editor :
```bash
# Fichier : migrations/add_rpc_function.sql
```

Ce script crée la fonction `get_module_access_status` utilisée par le frontend.

### Étape 2 : Tester le verrouillage 🧪

1. **Connectez-vous** en tant qu'employé
2. **Ouvrez** un parcours de formation (ex: "Tronc Commun")
3. **Vérifiez** que :
   - Le premier module (ONBOARDING) est **déverrouillé** 🔓
   - Le deuxième module (Hola Bienvenido) est **verrouillé** 🔒
4. **Complétez** le premier module avec score ≥ 80%
5. **Vérifiez** que le deuxième module se **déverrouille** automatiquement

### Étape 3 : Vérifier les logs 📋

Ouvrez la console du navigateur et vérifiez :
```
🔍 Fetching module access for user...
✅ Received X modules
  🔓 ONBOARDING (order: 0)
  🔒 Hola, Bienvenido a la Bodega !!! (order: 1)
```

---

## 🔧 Comment ça fonctionne

### Logique de verrouillage

Un module est **verrouillé** si :
1. Son `order_index > 0` (pas le premier module)
2. **ET** le module précédent (`order_index - 1`) n'est **pas complété**

Un module est **déverrouillé** si :
- `order_index = 0` (premier module du parcours)
- **OU** le module précédent est **complété** (status = 'completed')

### Flux de données

```
User complète un module (score ≥ 80%)
    ↓
user_progress.status = 'completed'
    ↓
Trigger Realtime Supabase
    ↓
useModuleAccess/useModuleLocking détecte le changement
    ↓
Appelle get_module_access_status()
    ↓
Fonction SQL is_module_locked() vérifie l'accès
    ↓
UI se met à jour automatiquement
    ↓
Module suivant se déverrouille 🔓
```

---

## 📊 Fonctions SQL disponibles

### 1. `is_module_locked(user_id, module_id)` → boolean
Vérifie si un module spécifique est verrouillé pour un utilisateur.

```sql
SELECT is_module_locked(
  '123e4567-e89b-12d3-a456-426614174000',  -- user_id
  '123e4567-e89b-12d3-a456-426614174001'   -- module_id
);
-- Retourne: true ou false
```

### 2. `get_locked_modules_for_user(user_id, path_id)` → TABLE
Retourne tous les modules d'un parcours avec leur statut de verrouillage.

```sql
SELECT * FROM get_locked_modules_for_user(
  '123e4567-e89b-12d3-a456-426614174000',  -- user_id
  'TC'                                      -- training_path_id
);
-- Retourne: module_id, module_title, order_index, is_locked, required_module_title
```

### 3. `get_module_access_status(user_id, path_id)` → TABLE (RPC)
Version RPC pour le frontend. Ajoute le champ `reason`.

```sql
SELECT * FROM get_module_access_status(
  '123e4567-e89b-12d3-a456-426614174000',
  'TC'
);
-- Utilisé par useModuleAccess et useModuleLocking
```

### 4. Vue `user_module_access`
Vue SQL combinant modules, parcours, progression et verrouillage.

```sql
SELECT * FROM user_module_access
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
  AND training_path_id = 'TC';
```

---

## 🐛 Dépannage

### Le module ne se déverrouille pas
1. Vérifiez que le quiz a un score ≥ 80%
2. Vérifiez dans `user_progress` que status = 'completed'
3. Vérifiez l'order_index dans la table `modules`
4. Consultez les logs de la console navigateur

### Erreur "function does not exist"
→ Exécutez le script `migrations/add_rpc_function.sql`

### Tous les modules sont verrouillés
→ Vérifiez que le premier module a `order_index = 0`

### Les modules ne s'affichent pas
→ Vérifiez que `training_path_id` est bien défini

---

## 📝 Notes importantes

- ⚠️ La fonction `is_module_locked` est marquée `SECURITY DEFINER` - elle s'exécute avec les privilèges du créateur
- 🔄 Le verrouillage est recalculé en temps réel via Supabase Realtime
- 🎯 Le premier module (order_index=0) est TOUJOURS déverrouillé
- 📊 Les modules sans `training_path_id` sont déverrouillés par défaut
- 🚫 L'index unique empêche les doublons futurs d'order_index

---

## 🎯 Résultat attendu

```
Parcours "Tronc Commun"
├── 🔓 ONBOARDING (order_index: 0)        → Toujours accessible
└── 🔒 Hola, Bienvenido ! (order_index: 1) → Verrouillé jusqu'à complétion de ONBOARDING

Après complétion de ONBOARDING avec score ≥ 80% :
├── ✅ ONBOARDING (order_index: 0)        → Complété
└── 🔓 Hola, Bienvenido ! (order_index: 1) → Maintenant déverrouillé !
```

---

## ✅ Checklist finale

- [x] Migration principale exécutée
- [ ] Migration RPC exécutée ← **À FAIRE**
- [x] Hooks React mis à jour
- [ ] Tests manuels effectués
- [ ] Logs de console vérifiés
- [ ] Déverrouillage automatique confirmé

