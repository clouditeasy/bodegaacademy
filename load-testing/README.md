# 🚀 Tests de Charge - Bodega Academy

Ce dossier contient les scripts de test de charge pour tester la capacité de votre application à gérer plusieurs utilisateurs simultanés.

## 📊 Objectifs des Tests

- Déterminer le nombre maximum d'utilisateurs simultanés supportés
- Identifier les goulots d'étranglement (Vercel, Supabase)
- Mesurer les temps de réponse sous charge
- Vérifier la stabilité de l'application

---

## 🛠️ Option 1 : Artillery (Recommandé pour débutants)

### Installation

```bash
npm install -g artillery
```

### Lancer le test

```bash
cd load-testing
artillery run artillery-config.yml
```

### Test rapide (1 minute)

```bash
artillery quick --count 50 --num 100 https://bodegaacademy.vercel.app
```

### Rapport HTML

```bash
artillery run artillery-config.yml --output report.json
artillery report report.json --output report.html
```

### Phases du test Artillery

1. **Warm-up** (1 min) : 10 utilisateurs/seconde
2. **Ramp-up** (2 min) : Montée de 10 à 50 utilisateurs/seconde
3. **Peak load** (3 min) : 100 utilisateurs/seconde
4. **Sustained load** (5 min) : 50 utilisateurs/seconde constants

**Durée totale** : ~12 minutes

---

## 🔥 Option 2 : k6 (Plus puissant, meilleur reporting)

### Installation

#### Windows
```bash
# Télécharger depuis https://k6.io/docs/get-started/installation/
# Ou avec Chocolatey:
choco install k6
```

#### macOS
```bash
brew install k6
```

#### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Lancer le test

```bash
cd load-testing
k6 run k6-load-test.js
```

### Test avec rapport détaillé

```bash
k6 run --out json=results.json k6-load-test.js
```

### Test avec Cloud (k6 Cloud - nécessite compte gratuit)

```bash
k6 cloud k6-load-test.js
```

### Phases du test k6

1. **Warm-up** (1 min) : 0 → 10 VUs
2. **Ramp-up** (2 min) : 10 → 50 VUs
3. **Peak load** (3 min) : 50 → 100 VUs
4. **Sustained load** (5 min) : 100 → 50 VUs (test de stabilité)
5. **Cool down** (1 min) : 50 → 0 VUs

**Durée totale** : 12 minutes

---

## 📈 Scénarios de Test

Les deux outils testent les mêmes scénarios :

### 1. Login Flow (40% du trafic)
- Chargement de la page d'accueil
- Connexion utilisateur
- Navigation vers le dashboard
- Chargement des modules

### 2. Browse Modules (30% du trafic)
- Navigation publique
- Chargement du logo et assets
- Consultation des pages sans authentification

### 3. QR Onboarding (20% du trafic)
- Accès à une page d'onboarding via QR code
- Soumission du formulaire d'inscription
- Évaluation du quiz

### 4. Static Assets (10% du trafic)
- Chargement des images
- CSS et JavaScript
- Assets statiques

---

## 🎯 Critères de Réussite

### Performance
- **P95** : 95% des requêtes < 2 secondes
- **P99** : 99% des requêtes < 5 secondes
- **Taux d'erreur** : < 5%

### Capacité
- ✅ **Bon** : 50+ utilisateurs simultanés
- ✅ **Excellent** : 100+ utilisateurs simultanés
- ✅ **Exceptionnel** : 200+ utilisateurs simultanés

---

## 📊 Comprendre les Résultats

### Artillery

```
Summary report:
  http.codes.200: 45678      ← Requêtes réussies
  http.request_rate: 45/sec  ← Requêtes par seconde
  http.response_time:
    min: 234                 ← Temps minimum
    max: 5678                ← Temps maximum
    median: 892              ← Temps médian
    p95: 1456                ← 95% des requêtes < 1.5s ✅
    p99: 2341                ← 99% des requêtes < 2.3s ✅
```

### k6

```
     ✓ home page loaded
     ✓ login successful
     ✓ dashboard loaded

     checks.........................: 98.54% ✅
     data_received..................: 145 MB
     data_sent......................: 23 MB
     http_req_duration..............: avg=876ms p95=1.8s p99=3.2s ✅
     http_req_failed................: 1.46% ✅
     http_reqs......................: 12543
     vus............................: 50
     vus_max........................: 100
```

---

## 🔍 Analyser les Goulots d'Étranglement

### Si les temps de réponse augmentent :

1. **Vérifier Vercel** (Frontend/Serverless)
   - Dashboard Vercel → Analytics
   - Fonction Duration & Invocations
   - Limites du plan (gratuit: 100GB bandwidth, 100h serverless)

2. **Vérifier Supabase** (Database/API)
   - Dashboard Supabase → Database → Monitoring
   - Connexions actives
   - Queries lentes
   - Limites du plan (gratuit: 500MB database, 50k monthly active users)

3. **Optimisations possibles**
   - ✅ Ajouter des index sur les tables Supabase
   - ✅ Mettre en cache avec Redis/Vercel Edge
   - ✅ Optimiser les queries RLS
   - ✅ Upgrader vers plan payant si nécessaire

---

## ⚠️ Limites des Plans Gratuits

### Vercel (Hobby Plan)
- 100 GB bandwidth/mois
- 100 heures de compute/mois
- 6 000 minutes build/mois
- Serverless function: 10s timeout

### Supabase (Free Tier)
- 500 MB de database
- 1 GB de storage
- 2 GB de bandwidth
- 50k monthly active users
- Unlimited API requests

---

## 🚀 Tests Progressifs Recommandés

### Test 1 : Baseline (Petit)
```bash
k6 run --vus 10 --duration 2m k6-load-test.js
```
**Objectif** : 10 utilisateurs pendant 2 minutes

### Test 2 : Moyen
```bash
k6 run --vus 50 --duration 5m k6-load-test.js
```
**Objectif** : 50 utilisateurs pendant 5 minutes

### Test 3 : Grande Charge (Utiliser le script complet)
```bash
k6 run k6-load-test.js
```
**Objectif** : Monter jusqu'à 100 utilisateurs

### Test 4 : Stress Test
```bash
k6 run --vus 200 --duration 1m k6-load-test.js
```
**Objectif** : Trouver le point de rupture

---

## 📝 Checklist Avant le Test

- [ ] Vérifier que l'application est déployée sur Vercel
- [ ] Vérifier que Supabase est opérationnel
- [ ] Créer 5-10 utilisateurs de test dans la base de données
- [ ] Désactiver les limites de rate limiting si configurées
- [ ] Avertir l'équipe (pour éviter confusion avec trafic réel)
- [ ] Prendre une baseline avant le test (temps normal)
- [ ] Surveiller les dashboards pendant le test

---

## 🎓 Bonnes Pratiques

1. **Commencer petit** : Toujours tester avec 10-20 utilisateurs d'abord
2. **Augmenter progressivement** : Ne pas sauter de 10 à 1000 utilisateurs
3. **Surveiller en temps réel** : Garder les dashboards ouverts
4. **Tester hors production** : Utiliser un environnement de staging si possible
5. **Analyser les résultats** : Comprendre pourquoi ça échoue, pas juste "ça marche pas"

---

## 🆘 Support

- **Artillery Docs** : https://www.artillery.io/docs
- **k6 Docs** : https://k6.io/docs/
- **Vercel Status** : https://www.vercel-status.com/
- **Supabase Status** : https://status.supabase.com/

---

## 📧 Résultats Attendus

Après avoir lancé les tests, vous obtiendrez :

✅ **Nombre d'utilisateurs simultanés supportés**
✅ **Temps de réponse moyen**
✅ **Taux d'erreur**
✅ **Points de défaillance**
✅ **Recommandations d'optimisation**

---

---

## 🐛 Troubleshooting - IMPORTANT

### ❌ Problème: Login Failed (0% success rate)

**Symptôme**: Vous voyez dans les résultats k6:
```
✗ login successful
  ↳  0% — ✓ 0 / ✗ 78
✗ has auth token
  ↳  0% — ✓ 0 / ✗ 78
errors: 24.14%
```

**Cause**: Bodega Academy utilise **Supabase authentication** directement du frontend. Il n'y a **PAS** d'endpoint `/api/auth/login` sur Vercel.

**Solution**: Utiliser le bon script de test!

#### Option A: Test sans authentification (recommandé pour démarrer)
```bash
k6 run k6-load-test-fixed.js
```
✅ Teste les pages publiques et la performance frontend
✅ Pas besoin de créer des utilisateurs
✅ Rapide et simple

#### Option B: Test avec authentification Supabase réelle
```bash
# 1. Créer les utilisateurs de test
npm install @supabase/supabase-js dotenv
node setup-test-users.js

# 2. Lancer le test avec auth
k6 run -e SUPABASE_URL=$VITE_SUPABASE_URL -e SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY k6-supabase-auth.js
```
✅ Authentification réelle via l'API Supabase
✅ Teste les endpoints protégés
✅ Plus réaliste mais plus complexe

### 📁 Scripts disponibles

| Script | Description | Authentification | Utilisation |
|--------|-------------|------------------|-------------|
| `k6-load-test.js` | ❌ Script original (cassé) | Essaie d'utiliser `/api/auth/login` qui n'existe pas | **Ne pas utiliser** |
| `k6-load-test-fixed.js` | ✅ Test frontend uniquement | Non | Pages publiques, performance frontend |
| `k6-supabase-auth.js` | ✅ Test avec Supabase | Oui (via API REST Supabase) | Test complet avec authentification |
| `artillery-config.yml` | ⚠️ À corriger | Essaie aussi `/api/auth/login` | Similaire problème |

### 🔧 Corriger le problème d'auth

Le script original `k6-load-test.js` essaie:
```javascript
// ❌ Ceci ne fonctionne pas - l'endpoint n'existe pas
http.post(`${BASE_URL}/api/auth/login`, ...)
```

Bodega Academy utilise directement Supabase depuis le frontend:
```javascript
// ✅ Comment l'app fait vraiment l'auth
supabase.auth.signInWithPassword({ email, password })
```

Pour tester l'auth depuis k6, il faut appeler **l'API Supabase directement**:
```javascript
// ✅ Correct pour k6
http.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, ...)
```

### 📊 Interpréter les résultats

#### Résultats Normaux (Attendus)

✅ **Test frontend uniquement** (k6-load-test-fixed.js):
```
checks_succeeded: 95%+
http_req_failed: <5%
errors: <5%
```

✅ **Test avec auth** (k6-supabase-auth.js):
```
login successful: 95%+
profile fetched: 95%+
modules fetched: 95%+
```

#### Résultats Problématiques

❌ **Si errors > 25%**:
- Vérifier que Vercel est en ligne
- Vérifier que Supabase est accessible
- Réduire le nombre de VUs (commencer avec `--vus 10`)

❌ **Si login failed = 100%**:
- Les utilisateurs de test n'existent pas → Exécuter `node setup-test-users.js`
- Mauvais credentials Supabase → Vérifier variables d'environnement
- Rate limiting Supabase → Réduire le nombre de VUs

❌ **Si http_req_duration trop élevé (p95 > 5s)**:
- Problème de performance backend (Supabase)
- Problème de réseau
- Trop de charge → Réduire les VUs

### 🎯 Quick Start (Recommandé)

**Pour commencer rapidement sans configuration**:

```bash
cd load-testing
k6 run --vus 10 --duration 2m k6-load-test-fixed.js
```

Ceci va tester:
- ✅ Pages publiques (home, login, onboarding)
- ✅ Assets statiques (logo, CSS, JS)
- ✅ Performance de chargement
- ❌ Ne teste PAS l'authentification réelle

**Pour un test complet avec authentification**:

```bash
# 1. Installer les dépendances
npm install @supabase/supabase-js dotenv

# 2. Créer les utilisateurs
node setup-test-users.js

# 3. Lancer le test
k6 run k6-supabase-auth.js
```

### 🆘 Support & Debug

**Vérifier que votre app fonctionne**:
```bash
# Tester manuellement l'auth Supabase
curl -X POST "${VITE_SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -d '{"email":"admin@bodega.ma","password":"your_password"}'
```

**Vérifier Vercel**:
```bash
curl -I https://bodegaacademy.vercel.app
# Doit retourner: HTTP/2 200
```

**Vérifier les variables d'env**:
```bash
# Dans le dossier load-testing/
node -e "require('dotenv').config({path:'../.env'}); console.log('URL:', process.env.VITE_SUPABASE_URL)"
```

---

**Bon test de charge ! 🚀**
