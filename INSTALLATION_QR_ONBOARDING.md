# Installation du système d'onboarding par QR Code

## Prérequis

- ✅ Projet Bodega Academy déjà configuré
- ✅ Compte Supabase actif
- ✅ Node.js version 18+ installé
- ✅ Accès admin à l'application (admin@bodega.ma)

## Étape 1 : Installation des dépendances

Le package `qrcode.react` a déjà été installé. Si vous clonez le projet, exécutez :

```bash
npm install
```

## Étape 2 : Configuration de la base de données

### 2.1 Accéder à Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet Bodega Academy
3. Cliquez sur **SQL Editor** dans le menu latéral

### 2.2 Exécuter la migration

1. Ouvrez le fichier `migrations/add_qr_onboarding_system_v2.sql`
2. Copiez tout le contenu (Ctrl+A, Ctrl+C)
3. Dans l'éditeur SQL de Supabase, collez le code
4. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

### 2.3 Vérifier la migration

Vous devriez voir le message :
```
QR Onboarding System V2 migration completed successfully!
```

Pour vérifier que tout est créé, exécutez :

```sql
-- Vérifier les tables
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'onboarding%';

-- Devrait retourner :
-- onboarding_qr_codes
-- onboarding_assessments
-- onboarding_responses
```

### 2.4 Vérifier l'évaluation par défaut

```sql
SELECT title, description, is_active
FROM onboarding_assessments;

-- Devrait retourner une ligne avec :
-- "Évaluation initiale générale"
```

## Étape 3 : Démarrage de l'application

### 3.1 Nettoyer les caches (si problèmes)

Si vous rencontrez des erreurs Vite :

```bash
# Windows
rm -rf node_modules/.vite
taskkill /F /IM node.exe

# Mac/Linux
rm -rf node_modules/.vite
killall node
```

### 3.2 Démarrer le serveur de développement

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:5173` (ou un autre port si 5173 est occupé).

### 3.3 Vérification

Ouvrez votre navigateur et accédez à l'URL affichée. Vous devriez voir la page de connexion.

## Étape 4 : Test du système

### 4.1 Connexion en tant qu'admin

1. Accédez à `http://localhost:5173`
2. Connectez-vous avec :
   - **Email** : admin@bodega.ma
   - **Mot de passe** : Votre mot de passe admin

### 4.2 Accéder à la gestion des QR codes

1. Une fois connecté, vous devriez voir le tableau de bord admin
2. Cherchez le bouton **"Codes QR"** (couleur teal/turquoise) avec une icône de QR code
3. Cliquez dessus

### 4.3 Créer votre premier QR code

1. Cliquez sur **"Nouveau code QR"**
2. Remplissez le formulaire :
   - **Description** : "Test onboarding"
   - **Expiration** : 72 (heures)
   - **Nombre max d'utilisations** : Laissez vide ou mettez 10
3. Cliquez sur **"Créer le code QR"**

### 4.4 Télécharger et tester le QR code

1. Une fois créé, le QR code s'affiche
2. Cliquez sur **"Télécharger"** pour obtenir l'image PNG
3. Copiez l'URL sous le QR code (format : `http://localhost:5173/onboarding/XXXXXX`)

### 4.5 Tester le flux d'onboarding

#### Option A : Test sur mobile (recommandé)

1. Assurez-vous que votre ordinateur et téléphone sont sur le même réseau
2. Remplacez `localhost` par l'IP de votre machine :
   ```
   http://192.168.X.X:5173/onboarding/XXXXXX
   ```
3. Scannez le QR code avec votre téléphone
4. Suivez le processus d'inscription

#### Option B : Test sur ordinateur

1. Ouvrez une **fenêtre de navigation privée** (Ctrl+Shift+N sur Chrome)
2. Collez l'URL du QR code
3. Remplissez le formulaire d'inscription :
   - Prénom : Jean
   - Nom : Dupont
   - Email : jean.dupont@test.com
   - Date de naissance : 01/01/1990
   - Poste : Service
   - Mot de passe : test123
   - Confirmer : test123
4. Cliquez sur **"Créer mon compte et continuer"**

### 4.6 Passer l'évaluation

1. Après l'inscription, vous êtes redirigé vers l'évaluation
2. Répondez aux 5 questions
3. Cliquez sur **"Suivant"** pour chaque question
4. Sur la dernière question, cliquez sur **"Terminer"**

### 4.7 Voir les résultats

1. Votre score s'affiche avec :
   - Un graphique circulaire
   - Le nombre de bonnes réponses
   - Le statut (Réussi / Peut mieux faire)
2. Cliquez sur **"Accéder à mon espace de formation"**

### 4.8 Vérification dans l'admin

1. Retournez sur la fenêtre admin
2. Allez dans **"Gestion des utilisateurs"**
3. Vous devriez voir le nouvel employé avec :
   - Son nom complet
   - Son score initial
   - Le badge "Onboardé via QR"

## Étape 5 : Personnalisation (optionnel)

### 5.1 Modifier les questions d'évaluation

1. Connectez-vous à Supabase
2. Allez dans **Table Editor** → `onboarding_assessments`
3. Cliquez sur la ligne de l'évaluation
4. Modifiez le champ `questions` (format JSON)

Format d'une question :
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

### 5.2 Modifier le score de passage

1. Dans la même table `onboarding_assessments`
2. Modifiez le champ `passing_score`
3. Valeur entre 0 et 100 (défaut : 70%)

### 5.3 Ajouter des postes personnalisés

Éditez le fichier `src/components/Onboarding/QROnboardingForm.tsx` :

```typescript
const jobRoleOptions = [
  { id: 'manager', label: 'Manager' },
  { id: 'service', label: 'Service' },
  { id: 'bar', label: 'Bar' },
  { id: 'cuisine', label: 'Cuisine' },
  // Ajoutez vos postes ici
  { id: 'reception', label: 'Réception' },
  { id: 'livraison', label: 'Livraison' },
];
```

Redémarrez le serveur après modification.

## Étape 6 : Déploiement en production

### 6.1 Build de production

```bash
npm run build
```

Le dossier `dist/` contient les fichiers à déployer.

### 6.2 Configuration des variables d'environnement

Sur votre serveur de production, configurez :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme
```

### 6.3 Mise à jour des URL

Après déploiement, les QR codes pointeront automatiquement vers votre domaine de production :
```
https://votre-domaine.com/onboarding/XXXXXX
```

### 6.4 Test en production

1. Créez un nouveau QR code depuis la production
2. Testez le flux complet
3. Vérifiez que les données arrivent bien en base

## Dépannage

Si vous rencontrez des problèmes, consultez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) pour :
- Erreurs Vite / React
- Problèmes de base de données
- Problèmes de QR codes
- Problèmes d'évaluation

## Commandes de diagnostic

```bash
# Vérifier les versions
node --version  # Devrait être >= 18
npm --version

# Nettoyer complètement
rm -rf node_modules/.vite dist
npm cache clean --force
npm install
npm run dev

# Vérifier les dépendances manquantes
npm list qrcode.react
npm list @supabase/supabase-js
npm list react-router-dom
```

## Vérification de la configuration Supabase

### Permissions anonymes (critiques)

Exécutez dans l'éditeur SQL :

```sql
-- Vérifier les permissions
SELECT
  schemaname,
  tablename,
  has_table_privilege('anon', schemaname||'.'||tablename, 'SELECT') as anon_select
FROM pg_tables
WHERE tablename LIKE 'onboarding%';

-- Devrait retourner "true" pour :
-- onboarding_qr_codes
-- onboarding_assessments
```

### RLS (Row Level Security)

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename LIKE 'onboarding%';

-- Lister les politiques
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE tablename LIKE 'onboarding%';
```

## Support et documentation

- 📖 [README principal](./README.md)
- 🔧 [Guide de dépannage](./TROUBLESHOOTING.md)
- 📋 [Documentation QR Onboarding](./QR_ONBOARDING_README.md)
- 🗄️ [Migrations SQL](./migrations/)

## Ressources externes

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [QRCode.react Documentation](https://www.npmjs.com/package/qrcode.react)

## Contact

Pour toute question ou problème :
1. Consultez d'abord TROUBLESHOOTING.md
2. Vérifiez les logs de la console (F12)
3. Vérifiez les logs Supabase
4. Contactez l'équipe technique

---

✅ **Félicitations !** Si vous avez suivi toutes ces étapes, votre système d'onboarding par QR code est maintenant opérationnel !
