# 🔧 Fix Rapide - Erreurs de connexion

## Problème actuel

Votre navigateur essaie de se connecter à `http://localhost:5173` mais le serveur tourne sur un autre port.

## ✅ Solution en 3 étapes

### Étape 1 : Arrêter tous les serveurs

Ouvrez PowerShell (ou un nouveau terminal) et exécutez :

```powershell
# Windows PowerShell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Ou simplement fermez tous les terminaux qui exécutent `npm run dev`.

### Étape 2 : Nettoyer les caches

Dans votre terminal du projet :

```bash
cd c:\Users\malot\dev\bodegaacademy
rm -rf node_modules/.vite
rm -rf dist
```

### Étape 3 : Redémarrer proprement

```bash
npm run dev
```

Le serveur va démarrer et vous montrer l'URL exacte, par exemple :
```
➜  Local:   http://localhost:5173/
```

### Étape 4 : Vider le cache du navigateur

**Option A - Hard Refresh (Rapide)**

1. Fermez TOUS les onglets localhost
2. Rouvrez un nouvel onglet
3. Allez sur l'URL affichée par Vite
4. Appuyez sur **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac)

**Option B - Navigation privée (Plus sûr)**

1. Ouvrez une **fenêtre de navigation privée** :
   - Chrome/Edge : Ctrl + Shift + N
   - Firefox : Ctrl + Shift + P
2. Allez sur l'URL affichée par Vite (ex: http://localhost:5173)

**Option C - Vider complètement le cache**

**Chrome/Edge** :
1. Appuyez sur F12 pour ouvrir les outils de développement
2. Faites un clic droit sur le bouton de rafraîchissement
3. Sélectionnez "Vider le cache et effectuer une actualisation forcée"

**Firefox** :
1. Ctrl + Shift + Delete
2. Cochez "Cache"
3. Sélectionnez "Dernière heure"
4. Cliquez sur "Effacer maintenant"

## ✅ Vérification

Après ces étapes, vous devriez voir :
- La page de connexion de Bodega Academy
- Pas d'erreurs dans la console (F12)

## 🚀 Démarrage rapide complet

Si vous voulez repartir de zéro complètement :

```bash
# 1. Arrêter tous les processus node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Nettoyer
cd c:\Users\malot\dev\bodegaacademy
rm -rf node_modules/.vite
rm -rf dist

# 3. Redémarrer
npm run dev

# 4. Ouvrir en navigation privée
# L'URL sera affichée dans le terminal
```

## 🔍 Diagnostic

Pour vérifier quel port est utilisé :

```bash
# Windows PowerShell
Get-NetTCPConnection | Where-Object {$_.State -eq "Listen" -and $_.LocalPort -match "517"}
```

Cela vous montrera tous les ports 517X (5173, 5174, etc.) qui écoutent.

## ⚡ Forcer un port spécifique

Si vous voulez toujours utiliser le port 5173, ajoutez dans `package.json` :

```json
{
  "scripts": {
    "dev": "vite --port 5173 --strictPort"
  }
}
```

L'option `--strictPort` arrêtera avec une erreur si le port est occupé au lieu de chercher un autre port.

## 📝 Note importante

Les erreurs que vous voyez :
```
GET http://localhost:5173/@vite/client net::ERR_CONNECTION_REFUSED
```

Signifient simplement que **le navigateur essaie de se connecter au mauvais port**. Ce n'est pas un problème de code, juste un problème de cache/port.
