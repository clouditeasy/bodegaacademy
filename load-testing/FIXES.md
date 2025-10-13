# Load Testing Fixes - Bodega Academy

## Problem Summary

Your k6 load test was failing with **24% error rate** and **0% login success** because:

1. The test tried to POST to `/api/auth/login` - **this endpoint doesn't exist**
2. The test tried to POST to `/api/onboarding/register` - **this endpoint doesn't exist**
3. Bodega Academy uses **Supabase authentication directly from the frontend**, not custom API routes

## Root Cause

Your app architecture:
```
Frontend (React) → Supabase Client → Supabase API
```

The old test assumed:
```
k6 → Vercel API Routes (/api/auth/login) → ???
```

But there are **no Vercel API routes** for authentication in your app!

## Solutions Provided

### 1. k6-load-test-fixed.js
- Tests **frontend pages only** (home, login, dashboard, etc.)
- Does NOT authenticate
- Good for testing page load performance and frontend availability
- **Use this to get started quickly**

```bash
cd load-testing
k6 run --vus 10 --duration 2m k6-load-test-fixed.js
```

### 2. k6-supabase-auth.js
- Authenticates **directly with Supabase REST API**
- Tests complete user flows with real authentication
- Requires test users to be created first
- More realistic but more complex

```bash
# Setup
npm install @supabase/supabase-js dotenv
node setup-test-users.js

# Run
k6 run k6-supabase-auth.js
```

### 3. setup-test-users.js
- Creates test users in your Supabase database
- Required for k6-supabase-auth.js to work
- Creates 5 users: loadtest1@bodega.ma through loadtest5@bodega.ma

## What Changed

### Before (Broken)
```javascript
// ❌ This endpoint doesn't exist in your app
http.post(`${BASE_URL}/api/auth/login`, {
  email: 'test@example.com',
  password: 'password'
})
```

### After (Fixed)
```javascript
// ✅ Option 1: Test pages without auth
http.get(`${BASE_URL}/login`)

// ✅ Option 2: Authenticate via Supabase API
http.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  email: 'test@example.com',
  password: 'password'
}, {
  headers: {
    'apikey': SUPABASE_ANON_KEY
  }
})
```

## Expected Results

### Fixed Test (No Auth)
```
checks_succeeded: 95%+
http_req_failed: <5%
errors: <5%
http_req_duration: p(95)<3000ms
```

### With Auth (Supabase)
```
login successful: 95%+
profile fetched: 95%+
modules fetched: 95%+
dashboard loaded: 95%+
```

## Quick Start Guide

**Easiest way to test right now:**

```bash
cd load-testing
k6 run --vus 10 --duration 2m k6-load-test-fixed.js
```

This will test your frontend without requiring any setup.

**For complete testing with authentication:**

```bash
cd load-testing

# 1. Install dependencies
npm install

# 2. Create test users
npm run setup-users

# 3. Run auth test
npm run test:k6:auth
```

## Files Added/Modified

### New Files
- `k6-load-test-fixed.js` - Frontend-only load test (recommended)
- `k6-supabase-auth.js` - Full auth test with Supabase
- `setup-test-users.js` - Creates test users in Supabase
- `FIXES.md` - This document

### Modified Files
- `README.md` - Added troubleshooting section
- `package.json` - Added new npm scripts and dependencies

### Deprecated Files
- `k6-load-test.js` - Original broken test (kept for reference)

## NPM Scripts Available

```bash
# Setup
npm run setup-users           # Create test users in Supabase

# Simple tests (no auth required)
npm run test:k6:simple        # 10 VUs for 2 minutes
npm run test:k6:small         # Same as simple
npm run test:k6:medium        # 50 VUs for 5 minutes
npm run test:k6:large         # Full test with stages

# Auth tests (requires setup-users first)
npm run test:k6:auth          # Full test with Supabase auth

# Artillery (alternative tool)
npm run test:artillery        # Run artillery test
npm run test:quick            # Quick artillery test
```

## Troubleshooting

### "Login failed 100%"
- You're using the old `k6-load-test.js` script
- Solution: Use `k6-load-test-fixed.js` or `k6-supabase-auth.js`

### "Test users don't exist"
- You need to run `npm run setup-users` first
- Only needed for `k6-supabase-auth.js`

### "High error rate (>25%)"
- Check if Vercel is online: `curl -I https://bodegaacademy.vercel.app`
- Check if Supabase is online: Check status.supabase.com
- Reduce VUs: Start with `--vus 10`

### "SUPABASE_URL not set"
- For `k6-supabase-auth.js`, you need to pass env vars:
```bash
k6 run -e SUPABASE_URL=https://xxx.supabase.co -e SUPABASE_ANON_KEY=xxx k6-supabase-auth.js
```

## Architecture Notes

Your app uses:
- **Frontend**: React on Vercel
- **Auth**: Supabase Auth (client-side)
- **Database**: Supabase PostgreSQL
- **Storage**: Azure Blob Storage

There are **no backend API routes** on Vercel for auth. Everything goes through Supabase directly.

This is a common architecture for JAMstack apps, but it means load testing needs to:
1. Either test frontend pages only (simple)
2. Or authenticate directly with Supabase (complex but more realistic)

## References

- k6 docs: https://k6.io/docs/
- Supabase Auth API: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- Your app's auth code: [src/hooks/useAuth.ts](../src/hooks/useAuth.ts)
