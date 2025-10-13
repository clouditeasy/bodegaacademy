# 📊 Exemple de Résultats - Tests de Charge

Ce document montre à quoi ressemblent les résultats typiques des tests de charge.

---

## 🎯 Exemple de Résultats k6

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: k6-load-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 100 max VUs, 12m30s max duration
           * default: Up to 100 looping VUs for 12m0s over 5 stages

     ✓ home page loaded
     ✓ login successful
     ✓ dashboard loaded
     ✓ modules loaded
     ✓ onboarding page loaded
     ✓ asset loaded

     checks.........................: 98.54% ✓ 45678  ✗ 678
     data_received..................: 145 MB 203 kB/s
     data_sent......................: 23 MB  32 kB/s
     http_req_blocked...............: avg=2.45ms   min=0s    med=1.2ms   max=156ms   p(90)=4.5ms  p(95)=6.8ms
     http_req_connecting............: avg=1.23ms   min=0s    med=0.6ms   max=89ms    p(90)=2.1ms  p(95)=3.4ms
     http_req_duration..............: avg=876ms    min=234ms med=654ms   max=5.6s    p(90)=1.5s   p(95)=1.8s
       { expected_response:true }...: avg=823ms    min=234ms med=621ms   max=4.2s    p(90)=1.4s   p(95)=1.7s
     http_req_failed................: 1.46%  ✓ 678    ✗ 45678
     http_req_receiving.............: avg=45.67ms  min=12ms  med=34ms    max=234ms   p(90)=89ms   p(95)=123ms
     http_req_sending...............: avg=12.34ms  min=3ms   med=8ms     max=67ms    p(90)=23ms   p(95)=34ms
     http_req_tls_handshaking.......: avg=1.12ms   min=0s    med=0.5ms   max=78ms    p(90)=2ms    p(95)=3.2ms
     http_req_waiting...............: avg=818ms    min=198ms med=612ms   max=5.4s    p(90)=1.4s   p(95)=1.7s
     http_reqs......................: 12543  17.5/s
     iteration_duration.............: avg=4.23s    min=1.2s  med=3.8s    max=12.5s   p(90)=6.5s   p(95)=7.8s
     iterations.....................: 2341   3.3/s
     vus............................: 1      min=1    max=100
     vus_max........................: 100    min=100  max=100

running (12m00.1s), 000/100 VUs, 2341 complete and 0 interrupted iterations
default ✓ [======================================] 000/100 VUs  12m0s
```

### 🔍 Analyse

✅ **Succès** : 98.54% des requêtes réussies
✅ **Performance** :
- P90 (90% des requêtes) < 1.5s
- P95 (95% des requêtes) < 1.8s
- Médiane : 654ms

⚠️ **Points d'attention** :
- 1.46% d'erreurs (678 requêtes sur 46356)
- Temps max de 5.6s pour certaines requêtes
- HTTP receiving time élevé (45ms en moyenne)

💡 **Capacité** : ~50-100 utilisateurs simultanés supportés

---

## 📈 Exemple de Résultats Artillery

```
Summary report @ 16:45:23(+0100)
  Scenarios launched:  2341
  Scenarios completed: 2341
  Requests completed:  12543
  Mean response/sec:   17.43
  Response time (msec):
    min: 234
    max: 5678
    median: 892
    p95: 1456
    p99: 2341
  Scenario counts:
    Login Flow: 936 (40%)
    Browse Modules: 702 (30%)
    QR Onboarding: 468 (20%)
    Static Assets: 235 (10%)
  Codes:
    200: 11865
    201: 345
    304: 234
    400: 45
    404: 32
    500: 22
```

### 🔍 Analyse

✅ **Performance** :
- P95 < 1.5s (Excellent ✅)
- P99 < 2.5s (Bon ✅)
- Médiane : 892ms (Correct)

✅ **Stabilité** :
- 94.5% de codes 2xx/3xx
- 5.5% d'erreurs (acceptable sous forte charge)

💡 **Recommandations** :
- Optimiser les requêtes avec P99 > 2s
- Investiguer les 22 erreurs 500

---

## 🎨 Interprétation des Métriques

### Métriques Clés

| Métrique | Signification | Bon | Acceptable | Mauvais |
|----------|---------------|-----|------------|---------|
| **P50 (Median)** | 50% des requêtes | < 500ms | < 1s | > 2s |
| **P95** | 95% des requêtes | < 1s | < 2s | > 3s |
| **P99** | 99% des requêtes | < 2s | < 5s | > 10s |
| **Error Rate** | % d'erreurs | < 1% | < 5% | > 10% |
| **RPS** | Requêtes/seconde | > 50 | > 20 | < 10 |

### Codes HTTP

- **2xx** (200, 201) : ✅ Succès
- **3xx** (304) : ✅ Cache (bon pour perf)
- **4xx** (400, 404) : ⚠️ Erreurs client (config ou test)
- **5xx** (500, 502, 503) : ❌ Erreurs serveur (problème!)

---

## 🚨 Scénarios de Problèmes

### Scénario 1 : Trop de 500 errors

```
Codes:
  200: 8000
  500: 4000  ❌ 33% d'erreurs!
```

**Cause probable** : Database overload, RLS policies trop strictes
**Solution** : Optimiser les queries, vérifier Supabase logs

### Scénario 2 : Temps de réponse explosent

```
Response time:
  p95: 12000ms  ❌
  p99: 25000ms  ❌
```

**Cause probable** : Pas assez de ressources (CPU/RAM)
**Solution** : Upgrader plan Vercel/Supabase, ajouter du cache

### Scénario 3 : Timeouts

```
http_req_failed: 45.2%  ❌
ERRO[0234] Request timeout
```

**Cause probable** : Serverless cold starts, DB connections
**Solution** : Connection pooling, keep-alive functions

---

## 💡 Exemples de Bons Résultats

### Configuration Idéale

```
✅ Checks: 99.8%
✅ P95: 845ms
✅ P99: 1234ms
✅ Error Rate: 0.2%
✅ RPS: 67.5
✅ VUs: 150 utilisateurs simultanés
```

**Verdict** : 🌟 Excellent! Supporte 150+ utilisateurs

### Configuration Moyenne

```
✅ Checks: 95%
⚠️ P95: 1856ms
⚠️ P99: 3421ms
⚠️ Error Rate: 5%
✅ RPS: 34.2
⚠️ VUs: 50 utilisateurs simultanés
```

**Verdict** : 👍 Acceptable pour 50 utilisateurs, optimisations recommandées

### Configuration Problématique

```
❌ Checks: 78%
❌ P95: 8542ms
❌ P99: 15234ms
❌ Error Rate: 22%
❌ RPS: 8.5
❌ VUs: 20 utilisateurs simultanés
```

**Verdict** : ⚠️ Problèmes critiques! Ne supporte que 20 utilisateurs

---

## 📊 Dashboard Exemple (k6 Cloud)

Quand vous utilisez `k6 cloud`, vous obtenez des graphiques comme :

```
┌─────────────────────────────────────────────────────┐
│  Response Time Distribution                         │
│  ████████████████████████████░░░░░░ 95% < 1.8s     │
│  █████████████████████████████████░ 99% < 3.2s     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Virtual Users Over Time                            │
│     100 ┤       ╭────────╮                          │
│      75 ┤     ╭─╯        ╰─╮                        │
│      50 ┤   ╭─╯            ╰─╮                      │
│      25 ┤ ╭─╯                ╰─╮                    │
│       0 ┼─╯                    ╰──                  │
│         0  2m  4m  6m  8m  10m  12m                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Error Rate                                         │
│   5% ┤                                              │
│   4% ┤                                              │
│   3% ┤                                              │
│   2% ┤  ░                                           │
│   1% ┤  █  ░    ░                                   │
│   0% ┼──█──█────█───────────────────────────────── │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Objectifs par Environnement

### Développement Local
- **Objectif** : Fonctionne sans erreur
- **Users** : 5-10 simultanés
- **P95** : < 3s

### Staging
- **Objectif** : Teste les configs
- **Users** : 20-50 simultanés
- **P95** : < 2s

### Production
- **Objectif** : Performance réelle
- **Users** : 50-200 simultanés
- **P95** : < 1.5s
- **Error Rate** : < 1%

---

**Note** : Ces résultats sont des exemples. Vos résultats réels dépendront de votre infrastructure, configuration, et charge réseau.
