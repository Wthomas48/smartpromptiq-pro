// Quick test of Supabase signup functionality
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ycpvdoktcoejmywqfwwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcHZkb2t0Y29lam15d3Fmd3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjkyMjgsImV4cCI6MjA3MTMwNTIyOH0.y0iaqPlZkL0hEcDfTLzhSzR4DgiDHBEOZf_sq1G0JdQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseSignup() {
  console.log('🧪 Testing Supabase Signup...');

  try {
    // Test signup
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testFullName = 'Test User';

    console.log(`📧 Testing signup with: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName
        }
      }
    });

    if (error) {
      console.error('❌ Signup Error:', error.message);
      return;
    }

    console.log('✅ Signup Success:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session,
      emailConfirmed: !!data.user?.email_confirmed_at
    });

    // Check if we need email confirmation
    if (!data.session && data.user && !data.user.email_confirmed_at) {
      console.log('📧 Email confirmation required');
      return;
    }

    // If we have a session, try to fetch/create profile
    if (data.session && data.user) {
      console.log('👤 Checking profile creation...');

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile Error:', profileError.message);
      } else if (profile) {
        console.log('✅ Profile Found:', {
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          role: profile.role
        });
      }
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

testSupabaseSignup();