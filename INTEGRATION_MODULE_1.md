# Guide d'Intégration - Module 1 : Avant l'Arrivée du Client

## Vue d'ensemble

Ce guide explique comment intégrer le fichier `Module_1_Avant_Arrivee.html` dans le parcours de formation "Tronc Commun" de Bodega Academy.

## Contenu du Module

**Titre**: Module 1 - Avant l'Arrivée du Client
**Sous-titre**: Réservation & Pré-accueil
**Points totaux**: 30 points
**Sections principales**:
1. Réservation Téléphonique (Standards + Script)
2. Préparation de l'Environnement (Extérieur + Intérieur)
3. Coaching Flash - Jeu de Rôle

## Méthode d'Intégration

### Option 1: Via l'Interface Admin (Recommandé)

1. **Connectez-vous en tant qu'admin** sur Bodega Academy
2. **Accédez à la section "Admin"** > "Créer un Module"
3. **Remplissez le formulaire** avec les informations suivantes:

   - **Titre**: `Module 1 - Avant l'Arrivée du Client`
   - **Description**: `Formation sur la gestion des réservations téléphoniques et la préparation de l'environnement. Apprenez les standards téléphoniques, le script de réservation et la préparation de l'espace.`
   - **Parcours de formation**: Sélectionnez "Tronc Commun"
   - **Ordre**: `1` (premier module du parcours)
   - **Obligatoire**: ✅ Oui
   - **Contenu**: Copiez le contenu HTML depuis `Module_1_Avant_Arrivee.html` (ou utilisez l'éditeur riche)

4. **Ajoutez les 10 questions du quiz** (voir section Quiz ci-dessous)

5. **Activez le module** et sauvegardez

### Option 2: Via SQL (Pour les utilisateurs avancés)

J'ai créé un script SQL prêt à l'emploi: [`scripts/insert-module-avant-arrivee.sql`](scripts/insert-module-avant-arrivee.sql)

**Étapes**:

1. **Ouvrez Supabase Dashboard** > SQL Editor
2. **Récupérez l'ID du parcours "Tronc Commun"**:
   ```sql
   SELECT id FROM training_paths WHERE name = 'Tronc Commun';
   ```
3. **Récupérez votre ID utilisateur admin**:
   ```sql
   SELECT id FROM user_profiles WHERE email = 'admin@bodega.ma';
   ```
4. **Ouvrez le fichier** `scripts/insert-module-avant-arrivee.sql`
5. **Remplacez les placeholders**:
   - `VOTRE_USER_ID_ADMIN` par votre ID d'admin
   - `TRAINING_PATH_ID` par l'ID du parcours Tronc Commun
6. **Exécutez le script** dans SQL Editor
7. **Vérifiez l'insertion** avec la requête de vérification fournie

### Option 3: Upload du fichier HTML comme ressource

Si vous souhaitez conserver le fichier HTML original comme ressource téléchargeable:

1. **Uploadez le fichier** dans Supabase Storage:
   - Bucket: `modules` ou `presentations`
   - Path: `tronc-commun/module-1-avant-arrivee.html`

2. **Récupérez l'URL publique** du fichier

3. **Ajoutez l'URL** dans le champ `presentation_url` du module (via l'interface admin ou SQL)

## Questions du Quiz (10 questions)

```json
[
  {
    "question": "Combien de sonneries maximum avant de répondre au téléphone ?",
    "options": ["1 sonnerie", "3 sonneries", "5 sonneries", "Ça dépend de la situation"],
    "correct": 1
  },
  {
    "question": "Quelle est la formule d'accueil téléphonique correcte ?",
    "options": ["\"Allô, oui ?\"", "\"Bonjour, La Bodega\"", "\"La Bodega, bonsoir, [Prénom] à votre service\"", "\"Restaurant La Bodega, que puis-je faire pour vous ?\""],
    "correct": 2
  },
  {
    "question": "Quelles sont les 3 questions essentielles pour une réservation ?",
    "options": ["Nom, nombre de personnes, budget", "Jour, heure, nombre de personnes", "Heure, régime alimentaire, occasion", "Nom, téléphone, adresse"],
    "correct": 1
  },
  {
    "question": "Pourquoi doit-on reformuler la réservation au client ?",
    "options": ["Pour montrer qu'on l'a bien compris", "Pour éviter les erreurs", "Pour confirmer tous les détails", "Toutes ces réponses"],
    "correct": 3
  },
  {
    "question": "Que doit-on proposer au client lors de la réservation ?",
    "options": ["Le menu du jour", "Un choix d'ambiance (en salle ou près de la scène)", "Une réduction", "Rien, juste prendre la réservation"],
    "correct": 1
  },
  {
    "question": "Quel est le ton de voix à adopter au téléphone ?",
    "options": ["Professionnel et neutre", "Chaleureux et souriant", "Rapide et efficace", "Formel et distant"],
    "correct": 1
  },
  {
    "question": "Combien de points vaut la checklist des standards téléphoniques ?",
    "options": ["5 points", "8 points", "10 points", "12 points"],
    "correct": 2
  },
  {
    "question": "Que doit-on vérifier à l'extérieur avant le service ?",
    "options": ["Seulement le parking", "Enseigne, parking, entrée, menu, plantes", "Uniquement l'enseigne", "Rien, l'extérieur n'est pas important"],
    "correct": 1
  },
  {
    "question": "Combien de points vaut la préparation de l'intérieur ?",
    "options": ["8 points", "10 points", "12 points", "15 points"],
    "correct": 2
  },
  {
    "question": "Quel est le KPI visé pour les réservations téléphoniques ?",
    "options": ["> 70%", "> 80%", "> 90%", "100%"],
    "correct": 2
  }
]
```

## Configuration du Parcours Tronc Commun

Le parcours "Tronc Commun" est déjà défini dans le fichier [`src/config/bodegaTrainingPaths.ts`](src/config/bodegaTrainingPaths.ts):

```typescript
{
  id: 'tronc-commun',
  name: 'Tronc Commun',
  description: 'Formations obligatoires pour tous les employés de Bodega Academy',
  color: 'bg-blue-500',
  icon: '🌟',
  order: 1,
  targetRoles: ['all'], // Accessible à tous les rôles
  hasEndQuiz: true,
  estimatedDuration: 8,
  priority: 'high'
}
```

Après intégration de ce module, vous pourrez ajouter d'autres modules au parcours Tronc Commun.

## Vérification

Après l'intégration, vérifiez que:

1. ✅ Le module apparaît dans l'interface admin
2. ✅ Le module est lié au parcours "Tronc Commun"
3. ✅ Le module est marqué comme obligatoire
4. ✅ Le quiz contient bien 10 questions
5. ✅ Le module est visible pour tous les employés
6. ✅ L'ordre du module est correct (order_index = 1)

## Points Clés du Module

- **30 points totaux** répartis entre réservation téléphonique et préparation
- **KPI visé**: > 90% de taux de réussite
- **Script téléphonique** à mémoriser
- **Checklist** d'inspection intérieur/extérieur
- **Exercice pratique**: Jeu de rôle téléphonique (10 minutes)

## Prochaines Étapes

Après l'intégration de ce module, vous pouvez:

1. Créer les modules suivants du parcours Tronc Commun
2. Configurer le quiz de fin de parcours
3. Assigner le parcours aux nouveaux employés via l'onboarding
4. Suivre les statistiques de complétion dans l'interface admin

## Support

Si vous rencontrez des problèmes:
- Vérifiez les logs de la console navigateur
- Consultez les erreurs dans Supabase Dashboard
- Vérifiez que votre compte a bien le rôle "admin"
- Assurez-vous que le parcours "Tronc Commun" existe dans la base de données

---

**Date de création**: 2025-10-23
**Module**: Module 1 - Avant l'Arrivée du Client
**Parcours**: Tronc Commun
**Statut**: Prêt à intégrer
