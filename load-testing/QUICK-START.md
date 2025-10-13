# ⚡ Quick Start - Tests de Charge en 5 Minutes

## 🚀 Installation Rapide

### Option 1 : k6 (Recommandé)

**Windows (PowerShell en admin):**
```powershell
choco install k6
```

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
curl -L https://github.com/grafana/k6/releases/download/v0.48.0/k6-v0.48.0-linux-amd64.tar.gz | tar xvz
sudo mv k6-v0.48.0-linux-amd64/k6 /usr/local/bin/k6
```

### Option 2 : Artillery

```bash
npm install -g artillery
```

---

## 🎯 Lancer Votre Premier Test (1 commande)

### Avec k6 (Test 2 minutes, 50 utilisateurs)

```bash
cd load-testing
k6 run --vus 50 --duration 2m k6-load-test.js
```

### Avec Artillery (Test rapide)

```bash
cd load-testing
artillery quick --count 50 --num 100 https://bodegaacademy.vercel.app
```

---

## 📊 Résultats en 30 Secondes

### Ce que vous verrez :

```
✓ checks: 98.5%                    ← 98.5% de succès ✅
http_req_duration: avg=876ms       ← Temps moyen < 1s ✅
http_req_failed: 1.5%              ← 1.5% d'erreurs ✅
vus: 50                            ← 50 utilisateurs simultanés
```

### Interprétation Rapide :

| Métrique | Votre Valeur | Verdict |
|----------|--------------|---------|
| **Checks** | > 95% | ✅ Bon |
| **Checks** | 80-95% | ⚠️ Moyen |
| **Checks** | < 80% | ❌ Problème |
| **P95** | < 2s | ✅ Bon |
| **P95** | 2-5s | ⚠️ Moyen |
| **P95** | > 5s | ❌ Lent |
| **Errors** | < 5% | ✅ Bon |
| **Errors** | > 10% | ❌ Problème |

---

## 🎬 Tests Progressifs

### 1️⃣ Test Petit (Baseline)
```bash
k6 run --vus 10 --duration 2m k6-load-test.js
```
**Attendu** : 10 users → 99% success

### 2️⃣ Test Moyen
```bash
k6 run --vus 50 --duration 5m k6-load-test.js
```
**Attendu** : 50 users → 95% success

### 3️⃣ Test Complet (12 minutes)
```bash
k6 run k6-load-test.js
```
**Attendu** : 100 users → 90% success

### 4️⃣ Stress Test (Trouver la limite)
```bash
k6 run --vus 200 --duration 1m k6-load-test.js
```
**Objectif** : Voir quand ça casse

---

## 🔥 One-Liners Utiles

### Test rapide URL
```bash
k6 run --vus 50 --duration 30s - <<< 'import http from "k6/http"; export default () => http.get("https://bodegaacademy.vercel.app");'
```

### Test avec JSON report
```bash
k6 run --out json=results.json k6-load-test.js
```

### Test avec seuils custom
```bash
k6 run --vus 100 --duration 2m --threshold http_req_duration=p95:2000 k6-load-test.js
```

---

## 🎯 Objectifs Réalistes

### Plans Gratuits (Vercel + Supabase Free)
- ✅ **Supportable** : 20-50 utilisateurs simultanés
- ⚠️ **Limite haute** : 50-100 utilisateurs
- ❌ **Au-delà** : Nécessite upgrade

### Plans Payants (Pro)
- ✅ **Supportable** : 100-500 utilisateurs simultanés
- ⚠️ **Limite haute** : 500-1000 utilisateurs
- ❌ **Au-delà** : Nécessite architecture distribuée

---

## 🚨 Que Faire Si...

### ❌ Beaucoup d'erreurs (> 10%)
```bash
# 1. Vérifier Supabase Dashboard
# 2. Vérifier Vercel Logs
# 3. Réduire le nombre d'utilisateurs
k6 run --vus 20 --duration 2m k6-load-test.js
```

### ⏱️ Temps de réponse trop long (> 5s)
```bash
# 1. Vérifier les queries lentes dans Supabase
# 2. Ajouter des index sur les tables
# 3. Activer le cache
```

### 💥 Timeouts ou crashes
```bash
# 1. Vérifier les limites du plan gratuit
# 2. Réduire la charge
# 3. Considérer un upgrade
```

---

## 📱 Monitoring en Temps Réel

### Pendant le test, surveillez :

1. **Vercel Dashboard** : https://vercel.com/dashboard
   - Analytics → Real-time requests
   - Functions → Invocations

2. **Supabase Dashboard** : https://supabase.com/dashboard
   - Database → Monitoring
   - API → Usage

3. **Terminal k6** : Métriques live pendant le test

---

## 🎓 Commandes npm (si installé avec package.json)

```bash
cd load-testing
npm install

# Tests rapides
npm run test:quick              # Artillery quick test
npm run test:k6:small          # k6 - 10 users, 2min
npm run test:k6:medium         # k6 - 50 users, 5min
npm run test:k6:large          # k6 - 100 users, 12min
npm run test:k6:stress         # k6 - 200 users, 1min

# Avec rapport HTML
npm run test:artillery:report
```

---

## ✅ Checklist 5 Minutes

- [ ] Installer k6 ou Artillery
- [ ] Aller dans `cd load-testing`
- [ ] Lancer test petit : `k6 run --vus 10 --duration 1m k6-load-test.js`
- [ ] Noter les résultats (checks, p95, errors)
- [ ] Augmenter : `k6 run --vus 50 --duration 2m k6-load-test.js`
- [ ] Comparer les résultats
- [ ] Décider si upgrade nécessaire

---

## 🆘 Support Rapide

**Erreur "k6 not found"**
```bash
# Réinstaller k6
brew reinstall k6  # macOS
choco install k6   # Windows
```

**Erreur Artillery**
```bash
npm install -g artillery@latest
```

**Test ne démarre pas**
```bash
# Vérifier l'URL
curl https://bodegaacademy.vercel.app
# Si ça marche, relancer k6
```

---

## 🎉 Vous Avez Fini !

Vous savez maintenant :
✅ Combien d'utilisateurs votre app supporte
✅ Les temps de réponse sous charge
✅ Si un upgrade est nécessaire

**Prochaine étape** : Optimiser ou upgrader selon les résultats ! 🚀
