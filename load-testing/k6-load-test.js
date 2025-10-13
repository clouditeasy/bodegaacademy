import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');

// Configuration du test de charge
export const options = {
  stages: [
    // Phase 1: Warm-up - Montée progressive
    { duration: '1m', target: 10 },   // 0 -> 10 utilisateurs en 1 minute

    // Phase 2: Ramp-up - Augmentation progressive
    { duration: '2m', target: 50 },   // 10 -> 50 utilisateurs en 2 minutes

    // Phase 3: Peak load - Test de charge maximale
    { duration: '3m', target: 100 },  // 50 -> 100 utilisateurs en 3 minutes

    // Phase 4: Sustained load - Charge constante
    { duration: '5m', target: 50 },   // 100 -> 50 utilisateurs en 5 minutes

    // Phase 5: Cool down
    { duration: '1m', target: 0 },    // 50 -> 0 utilisateurs en 1 minute
  ],

  // Thresholds - Critères de succès
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s
    http_req_failed: ['rate<0.05'],                  // Moins de 5% d'erreurs
    errors: ['rate<0.05'],                           // Moins de 5% d'erreurs custom
    login_duration: ['p(95)<3000'],                  // Login en moins de 3s
    dashboard_duration: ['p(95)<2000'],              // Dashboard en moins de 2s
  },

  // Nombre maximum de VUs (virtual users)
  vus: 100,
};

// Configuration de base
const BASE_URL = 'https://bodegaacademy.vercel.app';

// Pool d'utilisateurs de test
const TEST_USERS = [
  { email: 'test1@bodega.ma', password: 'TestPassword123!' },
  { email: 'test2@bodega.ma', password: 'TestPassword123!' },
  { email: 'test3@bodega.ma', password: 'TestPassword123!' },
  { email: 'test4@bodega.ma', password: 'TestPassword123!' },
  { email: 'test5@bodega.ma', password: 'TestPassword123!' },
];

// Génère un utilisateur aléatoire
function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

// Scénario principal
export default function () {
  // Choix du scénario aléatoire
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% - Scénario Login & Navigation
    loginAndBrowse();
  } else if (scenario < 0.7) {
    // 30% - Scénario Browse modules (sans login)
    browsePublicPages();
  } else if (scenario < 0.9) {
    // 20% - Scénario QR Onboarding
    qrOnboarding();
  } else {
    // 10% - Scénario Assets statiques
    loadStaticAssets();
  }

  // Temps de réflexion entre les actions
  sleep(Math.random() * 3 + 1); // 1-4 secondes
}

/**
 * Scénario 1: Login et navigation
 */
function loginAndBrowse() {
  const user = getRandomUser();

  group('Login Flow', function () {
    // 1. Charger la page d'accueil
    let homeResponse = http.get(`${BASE_URL}/`);
    check(homeResponse, {
      'home page loaded': (r) => r.status === 200,
    });
    errorRate.add(homeResponse.status !== 200);
    sleep(2);

    // 2. Login (simulé - adapté à votre API)
    const loginStart = Date.now();
    let loginResponse = http.post(`${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const loginSuccess = check(loginResponse, {
      'login successful': (r) => r.status === 200 || r.status === 201,
      'has auth token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.token || body.access_token;
        } catch (e) {
          return false;
        }
      },
    });

    loginDuration.add(Date.now() - loginStart);
    errorRate.add(!loginSuccess);
    sleep(3);

    // 3. Accéder au dashboard
    if (loginSuccess) {
      const dashboardStart = Date.now();
      let dashboardResponse = http.get(`${BASE_URL}/dashboard`);

      const dashboardSuccess = check(dashboardResponse, {
        'dashboard loaded': (r) => r.status === 200,
      });

      dashboardDuration.add(Date.now() - dashboardStart);
      errorRate.add(!dashboardSuccess);
      sleep(5);

      // 4. Naviguer vers un module
      let moduleResponse = http.get(`${BASE_URL}/modules`);
      check(moduleResponse, {
        'modules loaded': (r) => r.status === 200,
      });
      errorRate.add(moduleResponse.status !== 200);
    }
  });
}

/**
 * Scénario 2: Navigation publique
 */
function browsePublicPages() {
  group('Browse Public Pages', function () {
    // Page d'accueil
    let homeResponse = http.get(`${BASE_URL}/`);
    check(homeResponse, {
      'home accessible': (r) => r.status === 200,
    });
    errorRate.add(homeResponse.status !== 200);
    sleep(2);

    // Logo
    let logoResponse = http.get(`${BASE_URL}/logo-bodega.jpg`);
    check(logoResponse, {
      'logo loaded': (r) => r.status === 200,
    });
    errorRate.add(logoResponse.status !== 200);
  });
}

/**
 * Scénario 3: QR Code Onboarding
 */
function qrOnboarding() {
  group('QR Onboarding Flow', function () {
    const randomNum = Math.floor(Math.random() * 10000);
    const testCode = 'LOADTEST' + randomNum;

    // 1. Accéder à la page d'onboarding
    let onboardingResponse = http.get(`${BASE_URL}/onboarding/${testCode}`);
    check(onboardingResponse, {
      'onboarding page loaded': (r) => r.status === 200 || r.status === 404,
    });
    sleep(5);

    // 2. Soumettre le formulaire d'inscription (simulation)
    let registerResponse = http.post(`${BASE_URL}/api/onboarding/register`,
      JSON.stringify({
        firstName: 'LoadTest',
        lastName: 'User' + randomNum,
        email: `loadtest${randomNum}@example.com`,
        birthDate: '1990-01-01',
        jobRole: 'service',
        password: 'LoadTest123!',
        qrCode: testCode,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    check(registerResponse, {
      'registration attempted': (r) => r.status !== 500, // Accepter 404, 400, etc.
    });
    errorRate.add(registerResponse.status === 500);
  });
}

/**
 * Scénario 4: Assets statiques
 */
function loadStaticAssets() {
  group('Static Assets', function () {
    const batch = http.batch([
      ['GET', `${BASE_URL}/logo-bodega.jpg`],
      ['GET', `${BASE_URL}/assets/index.js`],
      ['GET', `${BASE_URL}/assets/index.css`],
    ]);

    batch.forEach((response) => {
      check(response, {
        'asset loaded': (r) => r.status === 200 || r.status === 304,
      });
    });
  });
}

/**
 * Setup - Exécuté une fois au début
 */
export function setup() {
  console.log('🚀 Starting load test against: ' + BASE_URL);
  console.log('📊 Test configuration:');
  console.log('   - Warm-up: 10 VUs for 1 minute');
  console.log('   - Ramp-up: 10->50 VUs over 2 minutes');
  console.log('   - Peak: 50->100 VUs over 3 minutes');
  console.log('   - Sustained: 100->50 VUs over 5 minutes');
  console.log('   - Total duration: 12 minutes');
}

/**
 * Teardown - Exécuté une fois à la fin
 */
export function teardown(data) {
  console.log('✅ Load test completed!');
  console.log('📈 Check the results above for detailed metrics');
}
