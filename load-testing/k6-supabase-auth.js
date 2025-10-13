import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');

// Load test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm-up
    { duration: '2m', target: 25 },   // Ramp-up
    { duration: '2m', target: 25 },   // Sustained
    { duration: '1m', target: 0 },    // Cool down
  ],

  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.1'],
    login_duration: ['p(95)<3000'],
  },
};

// !!! IMPORTANT: Set these environment variables !!!
// k6 run -e SUPABASE_URL=https://xxx.supabase.co -e SUPABASE_ANON_KEY=xxx k6-supabase-auth.js
const SUPABASE_URL = __ENV.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const BASE_URL = 'https://bodegaacademy.vercel.app';

// Test users pool - MUST exist in your Supabase database
const TEST_USERS = [
  { email: 'loadtest1@bodega.ma', password: 'LoadTest123!' },
  { email: 'loadtest2@bodega.ma', password: 'LoadTest123!' },
  { email: 'loadtest3@bodega.ma', password: 'LoadTest123!' },
  { email: 'loadtest4@bodega.ma', password: 'LoadTest123!' },
  { email: 'loadtest5@bodega.ma', password: 'LoadTest123!' },
];

function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

// Main test scenario
export default function () {
  const scenario = Math.random();

  if (scenario < 0.5) {
    // 50% - Full authentication flow
    authenticatedFlow();
  } else {
    // 50% - Public pages
    publicFlow();
  }

  sleep(Math.random() * 3 + 1);
}

/**
 * Authenticated flow - Actually logs in via Supabase
 */
function authenticatedFlow() {
  const user = getRandomUser();

  group('Authenticated Flow', function () {
    // 1. Authenticate with Supabase
    const loginStart = Date.now();
    const authResponse = http.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
      }
    );

    const loginSuccess = check(authResponse, {
      'login successful': (r) => r.status === 200,
      'has access token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.access_token !== undefined;
        } catch {
          return false;
        }
      },
    });

    loginDuration.add(Date.now() - loginStart);
    errorRate.add(!loginSuccess);

    if (!loginSuccess) {
      console.error(`Login failed for ${user.email}: ${authResponse.status} - ${authResponse.body}`);
      return;
    }

    // Extract token
    let accessToken;
    try {
      const authData = JSON.parse(authResponse.body);
      accessToken = authData.access_token;
    } catch (e) {
      console.error('Failed to parse auth response');
      errorRate.add(true);
      return;
    }

    sleep(1);

    // 2. Fetch user profile
    const profileResponse = http.get(
      `${SUPABASE_URL}/rest/v1/user_profiles?select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const profileSuccess = check(profileResponse, {
      'profile fetched': (r) => r.status === 200,
    });
    errorRate.add(!profileSuccess);
    sleep(1);

    // 3. Fetch modules
    const modulesResponse = http.get(
      `${SUPABASE_URL}/rest/v1/modules?select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const modulesSuccess = check(modulesResponse, {
      'modules fetched': (r) => r.status === 200,
    });
    errorRate.add(!modulesSuccess);
    sleep(2);

    // 4. Fetch user progress
    const progressResponse = http.get(
      `${SUPABASE_URL}/rest/v1/user_progress?select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const progressSuccess = check(progressResponse, {
      'progress fetched': (r) => r.status === 200,
    });
    errorRate.add(!progressSuccess);

    // 5. Test dashboard page load (frontend)
    const dashStart = Date.now();
    const dashResponse = http.get(`${BASE_URL}/dashboard`);
    dashboardDuration.add(Date.now() - dashStart);

    check(dashResponse, {
      'dashboard page loads': (r) => [200, 302, 307].includes(r.status),
    });
  });
}

/**
 * Public flow - No authentication
 */
function publicFlow() {
  group('Public Pages', function () {
    // Home page
    let homeResponse = http.get(`${BASE_URL}/`);
    check(homeResponse, {
      'home page loads': (r) => r.status === 200,
    });
    errorRate.add(homeResponse.status !== 200);
    sleep(2);

    // Login page
    let loginResponse = http.get(`${BASE_URL}/login`);
    check(loginResponse, {
      'login page loads': (r) => r.status === 200,
    });
    errorRate.add(loginResponse.status !== 200);
    sleep(1);

    // Static assets
    const assetResponses = http.batch([
      ['GET', `${BASE_URL}/logo-bodega.jpg`],
    ]);

    assetResponses.forEach((response) => {
      check(response, {
        'asset loads': (r) => r.status === 200 || r.status === 304,
      });
      errorRate.add(response.status >= 500);
    });
  });
}

export function setup() {
  console.log('🚀 Starting Supabase-authenticated load test');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🌐 App URL: ${BASE_URL}`);
  console.log(`👥 Test users: ${TEST_USERS.length}`);
  console.log('');

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.error('❌ ERROR: SUPABASE_URL not set!');
    console.error('Run with: k6 run -e SUPABASE_URL=xxx -e SUPABASE_ANON_KEY=xxx k6-supabase-auth.js');
    throw new Error('Missing Supabase configuration');
  }

  console.log('⚠️  Make sure test users exist in your database!');
  console.log('   Run: node setup-test-users.js (to be created)');
  console.log('');
}

export function teardown(data) {
  console.log('✅ Load test completed!');
  console.log('📊 Review metrics above');
}
