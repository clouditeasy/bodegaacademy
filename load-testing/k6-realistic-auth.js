import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const sessionDuration = new Trend('session_duration');

// Realistic load test configuration - simulates actual employee behavior
export const options = {
  stages: [
    // Morning rush - employees arriving and logging in
    { duration: '2m', target: 20 },   // 20 employees over 2 minutes

    // Active work period - sustained browsing
    { duration: '5m', target: 20 },   // Maintain 20 concurrent users

    // Lunch dip
    { duration: '1m', target: 10 },   // Drop to 10

    // Afternoon activity
    { duration: '3m', target: 25 },   // Peak at 25

    // End of day
    { duration: '1m', target: 0 },    // Everyone logs off
  ],

  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'],      // Allow 10% failures (rate limiting)
    errors: ['rate<0.15'],               // Allow 15% errors (rate limiting)
    login_duration: ['p(95)<3000'],
  },
};

const SUPABASE_URL = __ENV.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const BASE_URL = 'https://bodegaacademy.vercel.app';

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

/**
 * REALISTIC USER SESSION
 * Simulates an employee logging in and using the platform for training
 */
export default function () {
  const user = getRandomUser();
  const sessionStart = Date.now();

  // 1. Login ONCE per session (realistic behavior)
  const token = login(user);

  if (!token) {
    // If login failed (rate limit), just browse public pages
    browsePublicPages();
    sleep(5);
    return;
  }

  // 2. Extended session - employee browses training modules
  authenticatedSession(token);

  // 3. Track session duration
  sessionDuration.add(Date.now() - sessionStart);

  // 4. Long think time - employees don't immediately re-login
  sleep(Math.random() * 60 + 30); // 30-90 seconds between sessions
}

/**
 * Login function - called ONCE per session
 */
function login(user) {
  group('Login', function () {
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
      if (authResponse.status === 429) {
        console.log(`⚠️  Rate limited: ${user.email}`);
      } else {
        console.error(`❌ Login failed for ${user.email}: ${authResponse.status}`);
      }
      return null;
    }

    // Extract token
    try {
      const authData = JSON.parse(authResponse.body);
      return authData.access_token;
    } catch (e) {
      return null;
    }
  });
}

/**
 * Authenticated session - employee browsing training content
 * This simulates realistic usage after login
 */
function authenticatedSession(token) {
  group('Training Session', function () {
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    };

    // Load dashboard
    let dashResponse = http.get(`${BASE_URL}/dashboard`);
    check(dashResponse, {
      'dashboard loads': (r) => [200, 302, 307].includes(r.status),
    });
    sleep(3); // Read dashboard

    // Fetch user profile
    const profileResponse = http.get(
      `${SUPABASE_URL}/rest/v1/user_profiles?select=*`,
      { headers }
    );
    check(profileResponse, {
      'profile fetched': (r) => r.status === 200,
    });
    errorRate.add(profileResponse.status !== 200);
    sleep(1);

    // Browse modules (typical employee activity)
    for (let i = 0; i < 3; i++) {
      const modulesResponse = http.get(
        `${SUPABASE_URL}/rest/v1/modules?select=*&limit=10`,
        { headers }
      );

      check(modulesResponse, {
        'modules fetched': (r) => r.status === 200,
      });
      errorRate.add(modulesResponse.status !== 200);

      sleep(Math.random() * 5 + 3); // 3-8 seconds reading module
    }

    // Check progress
    const progressResponse = http.get(
      `${SUPABASE_URL}/rest/v1/user_progress?select=*`,
      { headers }
    );

    check(progressResponse, {
      'progress fetched': (r) => r.status === 200,
    });
    errorRate.add(progressResponse.status !== 200);

    sleep(2);
  });
}

/**
 * Public browsing - for users who couldn't login
 */
function browsePublicPages() {
  group('Public Browsing', function () {
    let homeResponse = http.get(`${BASE_URL}/`);
    check(homeResponse, {
      'home page loads': (r) => r.status === 200,
    });

    sleep(2);

    let loginPageResponse = http.get(`${BASE_URL}/login`);
    check(loginPageResponse, {
      'login page loads': (r) => r.status === 200,
    });
  });
}

export function setup() {
  console.log('🚀 Starting REALISTIC Supabase load test');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`👥 Test users: ${TEST_USERS.length}`);
  console.log('');
  console.log('📊 Simulating realistic employee behavior:');
  console.log('   - Login once per session (not continuously)');
  console.log('   - Browse 3-5 modules per session');
  console.log('   - 30-90 second breaks between sessions');
  console.log('   - Morning rush, sustained activity, afternoon peak');
  console.log('');

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.error('❌ ERROR: SUPABASE_URL not set!');
    throw new Error('Missing Supabase configuration');
  }
}

export function teardown(data) {
  console.log('✅ Realistic load test completed!');
  console.log('📊 Review metrics above');
  console.log('');
  console.log('💡 This test simulates actual employee usage patterns');
  console.log('   Much less aggressive than continuous login test');
}
