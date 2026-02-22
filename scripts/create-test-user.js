/**
 * Create Test User for Automated Testing
 * 
 * This script creates a test user using Supabase Admin API
 * Run with: node scripts/create-test-user.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

// Create Supabase admin client (with service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('🚀 Creating test user...\n');

  const testUser = {
    email: 'example@gmail.com',
    password: 'password123',
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      full_name: 'Test User',
      role: 'dispatcher'
    }
  };

  try {
    // 1. Create auth user
    console.log('📝 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: testUser.email_confirm,
      user_metadata: testUser.user_metadata
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists, updating instead...');
        
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === testUser.email);
        
        if (existingUser) {
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: testUser.password }
          );
          
          if (updateError) throw updateError;
          console.log('✅ Updated existing user password');
          
          // Use existing user data
          authData.user = existingUser;
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Auth user created successfully');
    }

    const userId = authData.user.id;
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${testUser.email}\n`);

    // 2. Create/update profile record
    console.log('📝 Creating profile record...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: testUser.email,
        full_name: testUser.user_metadata.full_name,
        role: testUser.user_metadata.role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.warn('⚠️  Profile creation failed (table might not exist):', profileError.message);
    } else {
      console.log('✅ Profile record created\n');
    }

    // 3. Verify user can sign in
    console.log('🔐 Testing sign-in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (signInError) {
      console.error('❌ Sign-in test failed:', signInError.message);
    } else {
      console.log('✅ Sign-in test successful\n');
      
      // Sign out
      await supabase.auth.signOut();
    }

    // 4. Display summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST USER CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Test Credentials:');
    console.log(`   Email:    ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`   User ID:  ${userId}`);
    console.log(`   Role:     ${testUser.user_metadata.role}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Try logging in at http://localhost:8080/login');
    console.log('   2. Re-run TestSprite tests');
    console.log('   3. Expect much higher pass rate!\n');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure SUPABASE_SERVICE_ROLE_KEY is in your .env file');
    console.error('   2. Get the service role key from Supabase Dashboard > Settings > API');
    console.error('   3. Never commit the service role key to git!\n');
    process.exit(1);
  }
}

// Run the script
createTestUser();
