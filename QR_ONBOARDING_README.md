# Système d'Onboarding par QR Code - Bodega Academy

## Vue d'ensemble

Le système d'onboarding par QR code permet aux administrateurs de créer des codes QR que les nouveaux employés peuvent scanner pour :
1. S'inscrire avec leurs informations personnelles
2. Passer une évaluation initiale de leurs compétences
3. Voir leur score et être automatiquement enregistrés dans le système

## Installation

### 1. Configuration Supabase

**IMPORTANT** : Configuration requise pour l'auto-confirmation des utilisateurs

1. Connectez-vous à votre tableau de bord Supabase
2. Allez dans **Authentication** → **Providers** → **Email**
3. **Décochez** l'option **"Confirm email"** (Enable email confirmations)
4. Cliquez sur **Save**

Cette configuration permet aux nouveaux employés de créer leur compte sans confirmation par email, ce qui est nécessaire pour le processus d'onboarding QR instantané.

**Remarque** : Sans cette configuration, les utilisateurs recevront une erreur indiquant que la session n'a pas été créée automatiquement.

### 2. Migrations de base de données

Exécutez les migrations SQL dans votre projet Supabase **dans l'ordre suivant** :

```bash
# Connectez-vous au SQL Editor de votre projet Supabase et exécutez :
1. migrations/add_qr_onboarding_system_v3_clean.sql
2. migrations/rpc_submit_assessment.sql
3. migrations/fix_user_profiles_rls_for_onboarding.sql  ⚠️ IMPORTANT pour l'inscription
```

Ces migrations créent :
- Table `onboarding_qr_codes` - Stockage des codes QR générés
- Table `onboarding_assessments` - Questionnaires d'évaluation
- Table `onboarding_responses` - Réponses et scores des employés
- Colonnes additionnelles dans `user_profiles` pour le suivi
- Fonction RPC `submit_onboarding_assessment` - Soumission sécurisée des évaluations
- **Politiques RLS** permettant aux nouveaux utilisateurs de créer leur profil

### 3. Dépendances

Le package `qrcode.react` a déjà été installé. Si vous clonez le projet, exécutez :

```bash
npm install
```

## Utilisation

### Pour les Administrateurs

#### 1. Générer un code QR

1. Connectez-vous en tant qu'admin (admin@bodega.ma)
2. Allez dans le tableau de bord admin
3. Cliquez sur le bouton **"Codes QR"** (icône QR code teal)
4. Cliquez sur **"Nouveau code QR"**
5. Configurez les paramètres :
   - **Description** : Nom pour identifier le code (ex: "Formation Mars 2025")
   - **Expiration** : Durée de validité en heures (défaut: 72h / 3 jours)
   - **Nombre max d'utilisations** : Limite d'utilisation (vide = illimité)
6. Cliquez sur **"Créer le code QR"**

#### 2. Télécharger et partager le QR code

1. Une fois créé, le QR code s'affiche avec :
   - Code visuel scannable
   - Code alphanumérique unique
   - Statistiques d'utilisation
   - Date d'expiration
2. Cliquez sur **"Télécharger"** pour obtenir l'image PNG
3. Imprimez ou partagez le QR code avec les nouveaux employés

#### 3. Gérer les codes QR

- **Désactiver** : Rend le code QR inutilisable sans le supprimer
- **Supprimer** : Supprime définitivement le code QR
- Les codes expirés ou ayant atteint leur limite sont marqués automatiquement

#### 4. Consulter les évaluations

Les réponses et scores des employés sont stockés dans la base de données et visibles dans le profil de chaque utilisateur.

### Pour les Employés

#### 1. Scanner le QR code

- Utilisez l'appareil photo de votre smartphone
- Scannez le QR code fourni par votre manager/RH
- Vous serez redirigé vers le formulaire d'inscription

#### 2. Remplir le formulaire d'inscription

Informations requises :
- **Prénom** et **Nom**
- **Email** (utilisé pour la connexion)
- **Date de naissance**
- **Poste** : Sélectionnez parmi
  - Manager
  - Service
  - Bar
  - Cuisine
- **Mot de passe** (minimum 6 caractères)

#### 3. Passer l'évaluation initiale

- Répondez au questionnaire de 5 questions
- Une seule réponse par question
- Vous pouvez naviguer entre les questions
- Score de passage : 70%

#### 4. Voir les résultats

- Votre score s'affiche à l'écran
- Que vous réussissiez ou non, votre compte est créé
- Le score est enregistré comme référence de départ
- Cliquez sur **"Accéder à mon espace de formation"** pour commencer

## Structure technique

### Routes publiques

- `/onboarding/:code` - Formulaire d'inscription
- `/onboarding/:code/assessment` - Questionnaire d'évaluation
- `/onboarding/:code/results` - Affichage des résultats

### Composants principaux

- `QRCodeManagement.tsx` - Gestion admin des QR codes
- `QROnboardingForm.tsx` - Formulaire d'inscription
- `AssessmentQuiz.tsx` - Questionnaire d'évaluation
- `AssessmentResults.tsx` - Page de résultats

### Service backend

- `qrOnboardingService.ts` - Logique métier pour :
  - Génération de codes QR
  - Validation de codes
  - Gestion des assessments
  - Soumission des réponses

### Types TypeScript

Nouveaux types ajoutés dans `supabase.ts` :
- `OnboardingQRCode` - Structure d'un code QR
- `OnboardingAssessment` - Structure d'une évaluation
- `OnboardingResponse` - Structure d'une réponse

## Sécurité

### Validation des codes QR

Les codes QR sont validés selon plusieurs critères :
- Existence du code dans la base de données
- Statut actif (`is_active = true`)
- Date d'expiration non dépassée
- Nombre maximum d'utilisations non atteint

### Permissions (RLS - Row Level Security)

- **Admins** : Peuvent créer, modifier et supprimer tous les codes QR
- **Public** : Peut lire les codes QR actifs et non expirés uniquement
- **Employés** : Peuvent lire et créer leurs propres réponses d'évaluation

### Authentification

- Les routes d'onboarding sont **publiques** (pas de login requis)
- Un compte utilisateur est créé automatiquement lors de l'inscription
- Les employés peuvent se connecter normalement après l'onboarding

## Personnalisation

### Modifier les questions d'évaluation

1. Connectez-vous à votre base Supabase
2. Allez dans la table `onboarding_assessments`
3. Modifiez le champ `questions` (format JSON)

Format des questions :
```json
{
  "question": "Votre question ici?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correct": 1  // Index de la bonne réponse (0-3)
}
```

### Modifier les postes disponibles

Éditez le tableau `jobRoleOptions` dans `QROnboardingForm.tsx` :

```typescript
const jobRoleOptions = [
  { id: 'manager', label: 'Manager' },
  { id: 'service', label: 'Service' },
  { id: 'bar', label: 'Bar' },
  { id: 'cuisine', label: 'Cuisine' },
  // Ajoutez vos postes ici
];
```

### Modifier le score de passage

Dans la table `onboarding_assessments`, modifiez la colonne `passing_score` (valeur de 0 à 100).

## Suivi et analytics

### Données collectées

Pour chaque employé onboardé via QR :
- Score initial de l'évaluation (`initial_assessment_score`)
- Date de l'évaluation (`initial_assessment_completed_at`)
- Indicateur d'onboarding QR (`onboarded_via_qr = true`)
- Date de naissance (`birth_date`)
- Poste (`job_role`)

### Rapports disponibles

Les admins peuvent consulter :
- Nombre total d'utilisations par code QR
- Liste des employés onboardés avec leurs scores
- Taux de réussite des évaluations
- Évolution des scores dans le temps

## Dépannage

### Le QR code ne fonctionne pas

- Vérifiez que le code n'est pas expiré
- Vérifiez qu'il n'a pas atteint sa limite d'utilisations
- Vérifiez qu'il est toujours actif dans l'interface admin

### Erreur lors de l'inscription

- Vérifiez que l'email n'est pas déjà utilisé
- Vérifiez que tous les champs obligatoires sont remplis
- Vérifiez que le mot de passe contient au moins 6 caractères

### Erreur "La session n'a pas été créée automatiquement"

Cette erreur indique que la confirmation email est activée dans Supabase. Pour la résoudre :
1. Allez dans votre tableau de bord Supabase
2. **Authentication** → **Providers** → **Email**
3. **Décochez** l'option **"Confirm email"**
4. Cliquez sur **Save**
5. Réessayez l'inscription

### Erreur "new row violates row-level security policy for table user_profiles" (403 Forbidden)

Cette erreur indique que les politiques RLS n'autorisent pas les nouveaux utilisateurs à créer leur profil. **Solution** :
1. Allez dans le SQL Editor de votre projet Supabase
2. Exécutez la migration `migrations/fix_user_profiles_rls_for_onboarding.sql`
3. Cette migration crée les politiques nécessaires pour permettre aux utilisateurs de créer leur propre profil
4. Réessayez l'inscription

### L'évaluation ne se charge pas

- Vérifiez qu'il existe une évaluation active dans la base
- Vérifiez les logs de la console navigateur
- Vérifiez les permissions Supabase (RLS)

## Support

Pour toute question ou problème :
1. Consultez les logs de la console navigateur (F12)
2. Vérifiez les logs Supabase
3. Contactez l'équipe technique

## Évolutions futures possibles

- [ ] Évaluations multi-langues (FR/AR)
- [ ] Génération de QR codes par lot
- [ ] Statistiques détaillées par code QR
- [ ] Export des résultats en CSV/Excel
- [ ] Notifications email après onboarding
- [ ] QR codes personnalisés par département
- [ ] Tests de progression (avant/après formation)
