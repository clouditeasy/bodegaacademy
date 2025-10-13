# Guide de dépannage - Bodega Academy

## Problèmes Vite / React

### Erreur: "@vitejs/plugin-react can't detect preamble"

**Symptômes** :
```
LoginForm.tsx:1  Uncaught Error: @vitejs/plugin-react can't detect preamble
```

**Solution** :

1. **Nettoyer tous les caches** :
```bash
# Supprimer le cache Vite
rm -rf node_modules/.vite

# Supprimer le dossier de build
rm -rf dist

# Nettoyer le cache npm
npm cache clean --force
```

2. **Redémarrer le serveur** :
```bash
npm run dev
```

3. **Dans le navigateur** :
   - Ouvrir les outils de développement (F12)
   - Faire un hard refresh : `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
   - Ou vider complètement le cache du navigateur

### Erreur: "The requested module '/@react-refresh' does not provide an export"

**Symptômes** :
```
Uncaught SyntaxError: The requested module '/@react-refresh' does not provide an export named 'injectIntoGlobalHook'
```

**Solution** :

Cette erreur est généralement liée à un cache corrompu. Suivez ces étapes :

1. **Fermer tous les onglets** du navigateur pointant vers localhost
2. **Arrêter le serveur Vite** (Ctrl+C)
3. **Nettoyer les caches** :
```bash
rm -rf node_modules/.vite dist
```
4. **Redémarrer** :
```bash
npm run dev
```
5. **Ouvrir une nouvelle fenêtre de navigation privée** et accéder à l'URL

### Ports multiples (5173, 5174, 5175...)

**Symptômes** :
Le serveur démarre sur différents ports à chaque fois.

**Cause** :
Plusieurs instances de Vite sont en cours d'exécution.

**Solution** :

**Windows** :
```bash
# Arrêter tous les processus Node
taskkill /F /IM node.exe

# Redémarrer
npm run dev
```

**Mac/Linux** :
```bash
# Arrêter tous les processus Node
killall node

# Redémarrer
npm run dev
```

### Erreur 404: "pwa-entry-point-loaded"

**Symptômes** :
```
Failed to load resource: the server responded with a status of 404
@vite-plugin-pwa/pwa-entry-point-loaded
```

**Solution** :

Cette erreur est bénigne et peut être ignorée si vous n'utilisez pas PWA. Pour la supprimer complètement :

1. Vérifiez que `vite-plugin-pwa` n'est pas dans vos dépendances
2. Si présent, supprimez-le :
```bash
npm uninstall vite-plugin-pwa
```

## Problèmes de base de données (Supabase)

### Erreur: "relation does not exist"

**Symptômes** :
```
Error: relation "onboarding_qr_codes" does not exist
```

**Solution** :

Vous devez exécuter les migrations SQL.

1. Connectez-vous à votre [tableau de bord Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez le contenu de `migrations/add_qr_onboarding_system_v2.sql`
5. Collez et exécutez (bouton Run)

### Erreur: "permission denied for table"

**Symptômes** :
```
Error: permission denied for table onboarding_qr_codes
```

**Solution** :

Les politiques RLS ne sont pas correctement configurées.

1. Vérifiez que la migration V2 a été exécutée complètement
2. Si nécessaire, réexécutez juste la partie des permissions :

```sql
-- Réappliquer les permissions
GRANT SELECT ON onboarding_qr_codes TO anon;
GRANT SELECT ON onboarding_assessments TO anon;
GRANT EXECUTE ON FUNCTION is_qr_code_valid(UUID) TO anon;
```

### Erreur: "JWT expired" ou "Invalid token"

**Symptômes** :
L'utilisateur est déconnecté automatiquement ou reçoit des erreurs d'authentification.

**Solution** :

1. Vérifiez les paramètres JWT dans Supabase :
   - Dashboard → Settings → API
   - JWT expiry devrait être au minimum 3600 (1 heure)

2. Déconnectez-vous et reconnectez-vous

3. Si le problème persiste, vérifiez les variables d'environnement :
```bash
# .env
VITE_SUPABASE_URL=votre_url
VITE_SUPABASE_ANON_KEY=votre_clé
```

## Problèmes QR Code

### Le QR code ne s'affiche pas

**Symptômes** :
Zone vide où devrait apparaître le QR code.

**Solution** :

1. Vérifiez que la bibliothèque est installée :
```bash
npm install qrcode.react
```

2. Vérifiez les logs de la console (F12)

3. Essayez de recharger la page

### Le scan du QR code renvoie une erreur "Code invalide"

**Symptômes** :
Après avoir scanné le QR code, l'utilisateur voit "Code QR invalide".

**Causes possibles** :

1. **Code expiré** - Vérifiez la date d'expiration dans l'interface admin
2. **Limite atteinte** - Le code a atteint son nombre maximum d'utilisations
3. **Code désactivé** - Vérifiez que `is_active = true`
4. **Problème de base de données** - Vérifiez que la table existe

**Solution** :

Dans l'interface admin :
1. Vérifiez l'état du code (actif/inactif)
2. Vérifiez les dates d'expiration
3. Vérifiez le nombre d'utilisations
4. Si nécessaire, créez un nouveau code QR

### L'inscription échoue après le scan

**Symptômes** :
Le formulaire s'affiche mais la création du compte échoue.

**Vérifications** :

1. **Email déjà utilisé** - Essayez avec un email différent
2. **Permissions Supabase** - Vérifiez que les utilisateurs anonymes peuvent s'inscrire
3. **Validation du formulaire** - Assurez-vous que tous les champs sont remplis

**Solution dans Supabase** :

1. Dashboard → Authentication → Providers
2. Vérifiez que **Email** est activé
3. Vérifiez les paramètres de confirmation email (désactivez si en dev)

## Problèmes d'évaluation

### L'évaluation ne se charge pas

**Symptômes** :
Page blanche ou erreur après avoir soumis le formulaire d'inscription.

**Solution** :

1. Vérifiez qu'il existe au moins une évaluation active dans la base :
```sql
SELECT * FROM onboarding_assessments WHERE is_active = true;
```

2. Si aucune évaluation n'existe, exécutez à nouveau la migration ou créez-en une manuellement

### Les réponses ne sont pas enregistrées

**Symptômes** :
L'utilisateur termine l'évaluation mais le score n'apparaît pas dans le profil.

**Solution** :

1. Vérifiez les logs de la console (F12)
2. Vérifiez les permissions sur `onboarding_responses`
3. Vérifiez que l'utilisateur est bien authentifié après l'inscription

## Problèmes de build

### Erreur lors du build de production

**Symptômes** :
```bash
npm run build
# Erreur de build
```

**Solution** :

1. Vérifiez qu'il n'y a pas d'erreurs TypeScript :
```bash
npx tsc --noEmit
```

2. Corrigez les erreurs de type

3. Relancez le build :
```bash
npm run build
```

### Bundle trop volumineux

**Symptômes** :
```
(!) Some chunks are larger than 500 kB after minification
```

**Solution** :

Ce warning est normal pour l'instant. Pour l'optimiser :

1. Ajoutez le code splitting dans `vite.config.ts` :
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'qrcode.react'],
        },
      },
    },
  },
});
```

## Commandes utiles

### Réinitialisation complète

Si tout échoue, réinitialisez complètement :

```bash
# 1. Arrêter tous les processus
taskkill /F /IM node.exe  # Windows
# ou
killall node  # Mac/Linux

# 2. Nettoyer tous les caches
rm -rf node_modules/.vite
rm -rf dist
rm -rf node_modules

# 3. Réinstaller
npm install

# 4. Redémarrer
npm run dev
```

### Vérifier les versions

```bash
# Version de Node
node --version  # Devrait être >= 18

# Version de npm
npm --version

# Vérifier les dépendances obsolètes
npm outdated
```

### Logs détaillés

Pour plus d'informations sur les erreurs :

```bash
# Démarrer avec logs verbeux
npm run dev -- --debug

# Voir les logs Vite
DEBUG=vite:* npm run dev
```

## Support

Si le problème persiste :

1. **Vérifiez les logs** dans la console navigateur (F12)
2. **Vérifiez les logs Supabase** dans le dashboard
3. **Consultez la documentation** :
   - [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
   - [Supabase Docs](https://supabase.com/docs)
   - [React Docs](https://react.dev/)

4. **GitHub Issues** - Recherchez des problèmes similaires
5. **Contactez l'équipe technique** avec :
   - Description du problème
   - Logs de la console
   - Étapes pour reproduire
   - Version de Node/npm
