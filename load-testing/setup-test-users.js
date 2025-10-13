/**
 * Setup script to create test users in Supabase for load testing
 *
 * Usage:
 *   node setup-test-users.js
 *
 * Requirements:
 *   - npm install @supabase/supabase-js dotenv
 *   - Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test users to create
const TEST_USERS = [
  { email: 'loadtest1@bodega.ma', password: 'LoadTest123!', fullName: 'Load Test User 1' },
  { email: 'loadtest2@bodega.ma', password: 'LoadTest123!', fullName: 'Load Test User 2' },
  { email: 'loadtest3@bodega.ma', password: 'LoadTest123!', fullName: 'Load Test User 3' },
  { email: 'loadtest4@bodega.ma', password: 'LoadTest123!', fullName: 'Load Test User 4' },
  { email: 'loadtest5@bodega.ma', password: 'LoadTest123!', fullName: 'Load Test User 5' },
];

async function createTestUsers() {
  console.log('🚀 Starting test user creation...\n');

  let successCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const user of TEST_USERS) {
    try {
      console.log(`Creating user: ${user.email}`);

      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
            role: 'employee',
          },
          // Skip email confirmation for test users
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`  ℹ️  User already exists: ${user.email}`);
          existsCount++;
        } else {
          console.error(`  ❌ Error creating ${user.email}:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`  ✅ Created: ${user.email}`);
        successCount++;

        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error(`  ❌ Exception for ${user.email}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Created: ${successCount}`);
  console.log(`  ℹ️  Already existed: ${existsCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📈 Total: ${TEST_USERS.length}`);

  if (successCount + existsCount === TEST_USERS.length) {
    console.log('\n✅ All test users are ready!');
    console.log('\n📝 Next steps:');
    console.log('  1. Confirm email addresses if required (check Supabase auth settings)');
    console.log('  2. Run load test with: k6 run k6-supabase-auth.js');
    console.log('     Or with env vars: k6 run -e SUPABASE_URL=xxx -e SUPABASE_ANON_KEY=xxx k6-supabase-auth.js');
  } else {
    console.log('\n⚠️  Some users could not be created. Check errors above.');
  }
}

async function verifyTestUsers() {
  console.log('\n🔍 Verifying test users...\n');

  for (const user of TEST_USERS) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        console.log(`❌ ${user.email}: Cannot login - ${error.message}`);
      } else {
        console.log(`✅ ${user.email}: Can login successfully`);
        // Sign out after verification
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ ${user.email}: Exception - ${err.message}`);
    }

    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function main() {
  console.log('🏢 Bodega Academy - Load Test User Setup\n');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Users to create: ${TEST_USERS.length}\n`);

  // Create users
  await createTestUsers();

  // Verify they can login
  await verifyTestUsers();

  console.log('\n✨ Setup complete!');
}

main().catch(console.error);
