/**
 * Test de charge simple avec Node.js (sans dépendances)
 * Usage: node simple-test.js
 */

const https = require('https');

// Configuration
const TARGET_URL = 'https://bodegaacademy.vercel.app';
const CONCURRENT_USERS = 50;
const DURATION_SECONDS = 60;
const TEST_INTERVAL_MS = 100; // Requête toutes les 100ms

// Statistiques
let stats = {
  total: 0,
  success: 0,
  errors: 0,
  times: [],
  startTime: Date.now(),
};

console.log('🚀 Test de Charge Simple - Bodega Academy');
console.log('==========================================');
console.log(`Target: ${TARGET_URL}`);
console.log(`Utilisateurs: ${CONCURRENT_USERS}`);
console.log(`Durée: ${DURATION_SECONDS}s`);
console.log('');

/**
 * Effectue une requête HTTP
 */
function makeRequest() {
  const start = Date.now();

  return new Promise((resolve) => {
    const req = https.get(TARGET_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - start;
        stats.total++;
        stats.times.push(duration);

        if (res.statusCode >= 200 && res.statusCode < 400) {
          stats.success++;
          process.stdout.write('✓');
        } else {
          stats.errors++;
          process.stdout.write('✗');
        }

        resolve();
      });
    });

    req.on('error', (err) => {
      stats.total++;
      stats.errors++;
      stats.times.push(Date.now() - start);
      process.stdout.write('✗');
      resolve();
    });

    req.setTimeout(10000, () => {
      req.destroy();
      stats.total++;
      stats.errors++;
      stats.times.push(10000);
      process.stdout.write('T');
      resolve();
    });
  });
}

/**
 * Simule un utilisateur
 */
async function simulateUser(userId) {
  while (Date.now() - stats.startTime < DURATION_SECONDS * 1000) {
    await makeRequest();
    await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000)); // 1-3s entre requêtes
  }
}

/**
 * Calcule les statistiques
 */
function calculateStats() {
  const sortedTimes = stats.times.sort((a, b) => a - b);
  const total = stats.total;

  const p50 = sortedTimes[Math.floor(total * 0.5)];
  const p95 = sortedTimes[Math.floor(total * 0.95)];
  const p99 = sortedTimes[Math.floor(total * 0.99)];
  const avg = stats.times.reduce((a, b) => a + b, 0) / total;
  const min = sortedTimes[0];
  const max = sortedTimes[total - 1];

  const duration = (Date.now() - stats.startTime) / 1000;
  const rps = (total / duration).toFixed(2);

  return {
    total,
    success: stats.success,
    errors: stats.errors,
    errorRate: ((stats.errors / total) * 100).toFixed(2),
    successRate: ((stats.success / total) * 100).toFixed(2),
    avg: avg.toFixed(0),
    min,
    max,
    p50,
    p95,
    p99,
    duration: duration.toFixed(0),
    rps,
  };
}

/**
 * Affiche les résultats
 */
function displayResults() {
  console.log('\n\n');
  console.log('📊 RÉSULTATS DU TEST');
  console.log('====================');

  const results = calculateStats();

  console.log('');
  console.log('Requêtes:');
  console.log(`  Total:     ${results.total}`);
  console.log(`  Succès:    ${results.success} (${results.successRate}%)`);
  console.log(`  Erreurs:   ${results.errors} (${results.errorRate}%)`);
  console.log(`  RPS:       ${results.rps} req/s`);
  console.log('');

  console.log('Temps de réponse (ms):');
  console.log(`  Min:       ${results.min}ms`);
  console.log(`  Moyenne:   ${results.avg}ms`);
  console.log(`  Médiane:   ${results.p50}ms`);
  console.log(`  P95:       ${results.p95}ms ${results.p95 < 2000 ? '✅' : '⚠️'}`);
  console.log(`  P99:       ${results.p99}ms ${results.p99 < 5000 ? '✅' : '⚠️'}`);
  console.log(`  Max:       ${results.max}ms`);
  console.log('');

  console.log('Verdict:');
  const successRate = parseFloat(results.successRate);
  const p95 = results.p95;

  if (successRate >= 95 && p95 < 2000) {
    console.log('  ✅ EXCELLENT - Votre application supporte bien la charge!');
  } else if (successRate >= 90 && p95 < 5000) {
    console.log('  ⚠️  ACCEPTABLE - Quelques optimisations recommandées');
  } else {
    console.log('  ❌ PROBLÉMATIQUE - Optimisations nécessaires');
  }

  console.log('');
  console.log(`Capacité estimée: ${CONCURRENT_USERS} utilisateurs simultanés`);
  console.log('');
}

/**
 * Lance le test
 */
async function runTest() {
  console.log('Démarrage du test...\n');

  // Lancer les utilisateurs simulés
  const users = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    users.push(simulateUser(i));
  }

  // Attendre la fin
  await Promise.all(users);

  // Afficher les résultats
  displayResults();
}

// Lancer le test
runTest().catch(console.error);
