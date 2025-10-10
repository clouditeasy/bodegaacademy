# 🐛 Guide de débogage - Page blanche sur mobile

## ✅ Corrections appliquées

### 1. ErrorBoundary ajouté
- **Fichier**: `src/components/ErrorBoundary.tsx`
- **Fonctionnalité**: Capture toutes les erreurs React et affiche un message d'erreur détaillé au lieu d'une page blanche
- **Avantage**: Vous verrez maintenant le message d'erreur exact si l'application crash

### 2. Logs de débogage ajoutés
- **Fichier**: `src/App.tsx`
- **Logs ajoutés**:
  - `[App] Component mounting...`
  - `[App] useAuth result: {...}`
  - `[App] Loading state...`
  - `[App] Rendering AuthPage`
  - `[App] Rendering MainLayout with LanguageProvider`

### 3. Gestion d'erreurs globales
- **Fichier**: `src/main.tsx`
- **Fonctionnalité**: Capture les erreurs non gérées et les promesses rejetées

### 4. LanguageContext corrigé
- **Fichier**: `src/contexts/LanguageContext.tsx`
- Support des clés imbriquées de traduction
- Gestion d'erreur pour localStorage

## 📱 Comment déboguer sur mobile

### Option 1: Utiliser Chrome DevTools (Recommandé)

1. **Sur Android**:
   - Connectez votre téléphone via USB
   - Activez le débogage USB dans les options développeur
   - Ouvrez Chrome sur PC → `chrome://inspect`
   - Ouvrez l'application sur mobile
   - Cliquez sur "Inspect" pour voir la console

2. **Sur iOS**:
   - Connectez votre iPhone via USB
   - Sur Mac → Safari → Développement → [Votre iPhone] → [L'onglet]
   - Voir la console Web

### Option 2: Utiliser un service de remote debugging

1. **Eruda** (console mobile intégrée):
   ```javascript
   // Ajouter temporairement dans index.html avant </body>
   <script src="//cdn.jsdelivr.net/npm/eruda"></script>
   <script>eruda.init();</script>
   ```

### Option 3: Vérifier l'ErrorBoundary

Maintenant, au lieu d'une page blanche, vous devriez voir:
- ⚠️ Un écran rouge avec le message d'erreur
- Le détails de l'erreur
- Le stack trace
- Les informations système (User Agent, Viewport, etc.)

## 🔍 Que regarder dans la console

### Logs normaux (application qui fonctionne):
```
[App] Component mounting...
[App] useAuth result: { hasUser: false, hasProfile: false, loading: true }
[App] Loading state...
[App] useAuth result: { hasUser: false, hasProfile: false, loading: false }
[App] Rendering AuthPage
```

### Si erreur avant useAuth:
```
[App] Component mounting...
[App] Error in useAuth: [ERROR MESSAGE]
```

### Si erreur dans LanguageProvider:
```
[App] Rendering MainLayout with LanguageProvider
localStorage not available: [ERROR]
```

## 🚨 Erreurs courantes sur mobile

### 1. localStorage bloqué
**Symptôme**: Page blanche en navigation privée
**Solution**: Déjà corrigée avec try/catch dans LanguageContext

### 2. CSS trop lourd
**Symptôme**: Page blanche, puis affichage après 5-10 secondes
**Solution**: Vérifier la connexion réseau

### 3. JavaScript trop lourd
**Symptôme**: Page blanche, erreur "Out of memory"
**Solution**: Build réussi, bundle = 1.14 MB (acceptable)

### 4. Supabase non accessible
**Symptôme**: Reste bloqué sur "Loading..."
**Solution**: Vérifier la connexion internet et les variables d'environnement

### 5. Variables d'environnement manquantes
**Symptôme**: Erreur dans useAuth
**Solution**: Vérifier que `.env` contient:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 📊 Prochaines étapes de débogage

1. **Déployez** la nouvelle version avec ErrorBoundary
2. **Ouvrez** l'application sur mobile
3. **Observez**:
   - Si page blanche → ErrorBoundary devrait afficher l'erreur
   - Si écran de chargement infini → Problème de connexion Supabase
   - Si écran rouge avec erreur → **Partagez le message d'erreur exact**

4. **Vérifiez la console**:
   - Ouvrez Chrome DevTools (méthode ci-dessus)
   - Regardez les logs `[App]` dans la console
   - **Partagez les logs exacts**

## 💡 Test rapide

Pour tester si l'ErrorBoundary fonctionne, ajoutez temporairement cette ligne dans `App.tsx` ligne 10:

```typescript
throw new Error("Test ErrorBoundary"); // SUPPRIMER APRÈS TEST
```

Vous devriez voir l'écran d'erreur rouge au lieu d'une page blanche.

## 📞 Informations à fournir

Si le problème persiste, partagez:
1. **Message d'erreur** affiché par l'ErrorBoundary (texte complet)
2. **User Agent** affiché en bas de l'écran d'erreur
3. **Logs de la console** (méthode Chrome DevTools)
4. **Type d'appareil** (iPhone, Android, navigateur utilisé)
5. **Réseau** (WiFi, 4G, navigation privée ou non)
