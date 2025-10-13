import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadDuration = new Trend('page_load_duration');
const dashboardDuration = new Trend('dashboard_duration');

// Load test configuration
export const options = {
  stages: [
    // Phase 1: Warm-up - gradual ramp
    { duration: '1m', target: 10 },   // 0 -> 10 users in 1 minute

    // Phase 2: Ramp-up - progressive increase
    { duration: '2m', target: 50 },   // 10 -> 50 users in 2 minutes

    // Phase 3: Peak load - max load test
    { duration: '3m', target: 100 },  // 50 -> 100 users in 3 minutes

    // Phase 4: Sustained load - constant load
    { duration: '5m', target: 50 },   // 100 -> 50 users in 5 minutes

    // Phase 5: Cool down
    { duration: '1m', target: 0 },    // 50 -> 0 users in 1 minute
  ],

  // Thresholds - success criteria
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'], // 95% < 3s, 99% < 5s
    http_req_failed: ['rate<0.05'],                  // Less than 5% errors
    errors: ['rate<0.05'],                           // Less than 5% custom errors
    page_load_duration: ['p(95)<3000'],              // Page load < 3s
    dashboard_duration: ['p(95)<3000'],              // Dashboard < 3s
  },

  // Maximum VUs (virtual users)
  vus: 100,
};

// Base configuration
const BASE_URL = 'https://bodegaacademy.vercel.app';

// Main scenario
export default function () {
  // Random scenario selection
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% - Browse authenticated pages (without actual Supabase auth)
    browseAuthenticatedFlow();
  } else if (scenario < 0.7) {
    // 30% - Browse public pages
    browsePublicPages();
  } else if (scenario < 0.9) {
    // 20% - QR Onboarding flow
    qrOnboardingFlow();
  } else {
    // 10% - Static assets
    loadStaticAssets();
  }

  // Think time between actions
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

/**
 * Scenario 1: Browse authenticated pages
 * Note: We can't actually authenticate with Supabase from k6,
 * so we test the pages that would be accessed after login
 */
function browseAuthenticatedFlow() {
  group('Authenticated Page Flow', function () {
    // 1. Load home page
    const homeStart = Date.now();
    let homeResponse = http.get(`${BASE_URL}/`);
    const homeSuccess = check(homeResponse, {
      'home page loaded': (r) => r.status === 200,
      'home page has content': (r) => r.body.includes('Bodega') || r.body.length > 1000,
    });
    pageLoadDuration.add(Date.now() - homeStart);
    errorRate.add(!homeSuccess);
    sleep(2);

    // 2. Try to access dashboard (will redirect to login if not authenticated)
    const dashStart = Date.now();
    let dashResponse = http.get(`${BASE_URL}/dashboard`, {
      redirects: 0, // Don't follow redirects
    });

    // Expect either 200 (cached) or 302/307 (redirect to login)
    const dashSuccess = check(dashResponse, {
      'dashboard accessible': (r) => [200, 302, 307, 401].includes(r.status),
    });
    dashboardDuration.add(Date.now() - dashStart);
    errorRate.add(!dashSuccess);
    sleep(3);

    // 3. Try to load modules page
    let modulesResponse = http.get(`${BASE_URL}/modules`, {
      redirects: 0,
    });
    const modulesSuccess = check(modulesResponse, {
      'modules page accessible': (r) => [200, 302, 307, 401].includes(r.status),
    });
    errorRate.add(!modulesSuccess);
    sleep(2);
  });
}

/**
 * Scenario 2: Public page browsing
 */
function browsePublicPages() {
  group('Browse Public Pages', function () {
    // Home page
    let homeResponse = http.get(`${BASE_URL}/`);
    const homeSuccess = check(homeResponse, {
      'home accessible': (r) => r.status === 200,
      'home has title': (r) => r.body.includes('Bodega') || r.body.includes('Academy'),
    });
    errorRate.add(!homeSuccess);
    sleep(2);

    // Login page
    let loginResponse = http.get(`${BASE_URL}/login`);
    const loginSuccess = check(loginResponse, {
      'login page loaded': (r) => r.status === 200,
    });
    errorRate.add(!loginSuccess);
    sleep(1);

    // Logo
    let logoResponse = http.get(`${BASE_URL}/logo-bodega.jpg`);
    const logoSuccess = check(logoResponse, {
      'logo loaded': (r) => r.status === 200 && r.body.length > 0,
    });
    errorRate.add(!logoSuccess);
  });
}

/**
 * Scenario 3: QR Code Onboarding flow
 */
function qrOnboardingFlow() {
  group('QR Onboarding Flow', function () {
    const randomNum = Math.floor(Math.random() * 100000);
    const testCode = `LOADTEST${randomNum}`;

    // Access onboarding page with test QR code
    let onboardingResponse = http.get(`${BASE_URL}/onboarding/${testCode}`);
    const onboardingSuccess = check(onboardingResponse, {
      'onboarding page accessible': (r) => r.status === 200 || r.status === 404,
      'page loads correctly': (r) => r.body.length > 0,
    });
    errorRate.add(onboardingResponse.status === 500);
    sleep(3);

    // Try to access a valid onboarding page
    let validOnboardingResponse = http.get(`${BASE_URL}/onboarding`);
    check(validOnboardingResponse, {
      'onboarding base page accessible': (r) => [200, 302, 307, 404].includes(r.status),
    });
  });
}

/**
 * Scenario 4: Static assets
 */
function loadStaticAssets() {
  group('Static Assets', function () {
    const responses = http.batch([
      ['GET', `${BASE_URL}/logo-bodega.jpg`],
      ['GET', `${BASE_URL}/`], // Main page to get bundled assets
    ]);

    responses.forEach((response, index) => {
      const assetSuccess = check(response, {
        'asset loaded': (r) => r.status === 200 || r.status === 304 || r.status === 404,
      });
      // Only count 500 errors, not 404s
      errorRate.add(response.status >= 500);
    });

    sleep(1);
  });
}

/**
 * Scenario 5: API endpoint stress test
 * Tests Supabase API endpoints through the app
 */
function apiEndpointStress() {
  group('API Endpoints', function () {
    // These will hit Supabase through the frontend
    const responses = http.batch([
      ['GET', `${BASE_URL}/`],
      ['GET', `${BASE_URL}/dashboard`],
    ]);

    responses.forEach((response) => {
      errorRate.add(response.status >= 500);
    });
  });
}

/**
 * Setup - runs once at start
 */
export function setup() {
  console.log('🚀 Starting load test against: ' + BASE_URL);
  console.log('📊 Test configuration:');
  console.log('   - Warm-up: 10 VUs for 1 minute');
  console.log('   - Ramp-up: 10->50 VUs over 2 minutes');
  console.log('   - Peak: 50->100 VUs over 3 minutes');
  console.log('   - Sustained: 100->50 VUs over 5 minutes');
  console.log('   - Total duration: 12 minutes');
  console.log('');
  console.log('⚠️  NOTE: This test does NOT authenticate with Supabase');
  console.log('   It tests public pages and page load performance');
  console.log('   For authenticated flows, use browser-based testing');
}

/**
 * Teardown - runs once at end
 */
export function teardown(data) {
  console.log('✅ Load test completed!');
  console.log('📈 Check the results above for detailed metrics');
  console.log('');
  console.log('💡 Key metrics to review:');
  console.log('   - http_req_duration: Should be <3s for p95');
  console.log('   - http_req_failed: Should be <5%');
  console.log('   - errors: Should be <5%');
}
