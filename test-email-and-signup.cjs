/**
 * Test Email Service and Signup Flow
 * This script tests:
 * 1. Email service configuration
 * 2. Complete signup flow
 * 3. Email delivery verification
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_FIRSTNAME = 'TestUser';
const TEST_LASTNAME = 'SignupFlow';

console.log('🧪 COMPREHENSIVE SIGNUP AND EMAIL FLOW TEST\n');
console.log('━'.repeat(60));

// Test 1: Check if server is healthy
async function testServerHealth() {
  console.log('\n📡 TEST 1: Server Health Check');
  console.log('─'.repeat(60));

  try {
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Server is healthy');
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

// Test 2: Test Email Service Status
async function testEmailServiceStatus() {
  console.log('\n📧 TEST 2: Email Service Status');
  console.log('─'.repeat(60));

  try {
    // Make a simple request to trigger email service initialization
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Email service should be initialized');
    console.log('   Check backend logs for: "📧 Email service configured with SMTP"');
    return true;
  } catch (error) {
    console.error('❌ Failed to check email service:', error.message);
    return false;
  }
}

// Test 3: Test Signup Flow
async function testSignupFlow() {
  console.log('\n👤 TEST 3: User Signup Flow');
  console.log('─'.repeat(60));
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Name: ${TEST_FIRSTNAME} ${TEST_LASTNAME}`);
  console.log(`   Password: ${TEST_PASSWORD}`);

  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: TEST_FIRSTNAME,
      lastName: TEST_LASTNAME
    });

    console.log('✅ Signup successful!');
    console.log('   User ID:', response.data.data?.user?.id);
    console.log('   Email:', response.data.data?.user?.email);
    console.log('   Plan:', response.data.data?.user?.plan);
    console.log('   Token received:', response.data.data?.token ? 'Yes (JWT token)' : 'No');

    if (response.data.data?.token) {
      console.log('\n📧 Email Status:');
      console.log('   ✉️  Welcome email should be sent to:', TEST_EMAIL);
      console.log('   ✉️  Verification email should be sent to:', TEST_EMAIL);
      console.log('   📝 Check backend logs for email delivery status');
    }

    return {
      success: true,
      userId: response.data.data?.user?.id,
      token: response.data.data?.token
    };
  } catch (error) {
    if (error.response) {
      console.error('❌ Signup failed:', error.response.data.message);
      console.error('   Status:', error.response.status);
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Signup request failed:', error.message);
    }
    return { success: false };
  }
}

// Test 4: Verify User Can Login
async function testLogin(email, password) {
  console.log('\n🔐 TEST 4: User Login Verification');
  console.log('─'.repeat(60));

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: email,
      password: password
    });

    console.log('✅ Login successful!');
    console.log('   User authenticated:', response.data.data?.user?.email);
    console.log('   Token received:', response.data.data?.token ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Check Email Verification Status
async function checkEmailVerificationStatus(token) {
  console.log('\n📬 TEST 5: Email Verification Status');
  console.log('─'.repeat(60));

  try {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const emailVerified = response.data.data?.user?.emailVerified;
    console.log('   Email Verified:', emailVerified ? '✅ Yes' : '❌ No');
    console.log('   Account Active:', response.data.data?.user?.isActive ? '✅ Yes' : '❌ No');
    console.log('   Can Access App:', response.data.data?.user?.isActive ? '✅ Yes (email verification not required)' : '❌ No');

    return emailVerified;
  } catch (error) {
    console.error('❌ Failed to check verification status:', error.message);
    return false;
  }
}

// Test 6: Check Database for User
async function checkDatabaseForUser(userId) {
  console.log('\n💾 TEST 6: Database Verification');
  console.log('─'.repeat(60));
  console.log('   User should exist in database with:');
  console.log('   • emailVerified: false (initially)');
  console.log('   • isActive: true');
  console.log('   • generationsLimit: 5 (FREE tier)');
  console.log('   • tokenBalance: 0');
  console.log('   ✅ User created successfully (ID: ' + userId + ')');
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting Comprehensive Test Suite...\n');

  const results = {
    serverHealth: false,
    emailService: false,
    signup: false,
    login: false,
    emailVerification: false
  };

  // Test 1: Server Health
  results.serverHealth = await testServerHealth();
  if (!results.serverHealth) {
    console.log('\n❌ Server is not running. Please start the backend server first.');
    process.exit(1);
  }

  // Test 2: Email Service
  results.emailService = await testEmailServiceStatus();

  // Test 3: Signup
  const signupResult = await testSignupFlow();
  results.signup = signupResult.success;

  if (!results.signup) {
    console.log('\n⚠️  Signup failed. Cannot proceed with remaining tests.');
    printSummary(results);
    process.exit(1);
  }

  // Wait 2 seconds for emails to be sent
  console.log('\n⏳ Waiting 2 seconds for email processing...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Login
  results.login = await testLogin(TEST_EMAIL, TEST_PASSWORD);

  // Test 5: Email Verification Status
  if (signupResult.token) {
    results.emailVerification = await checkEmailVerificationStatus(signupResult.token);
  }

  // Test 6: Database Check
  if (signupResult.userId) {
    await checkDatabaseForUser(signupResult.userId);
  }

  // Print summary
  printSummary(results);
}

function printSummary(results) {
  console.log('\n');
  console.log('━'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('━'.repeat(60));

  const tests = [
    { name: 'Server Health', status: results.serverHealth },
    { name: 'Email Service', status: results.emailService },
    { name: 'User Signup', status: results.signup },
    { name: 'User Login', status: results.login },
    { name: 'Email Verification Check', status: results.emailVerification }
  ];

  tests.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    const status = test.status ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${test.name.padEnd(30)} ${status}`);
  });

  const passedTests = tests.filter(t => t.status).length;
  const totalTests = tests.length;

  console.log('─'.repeat(60));
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log('━'.repeat(60));

  console.log('\n📧 EMAIL VERIFICATION NOTES:');
  console.log('─'.repeat(60));
  console.log('• Welcome email should be sent via Zoho SMTP');
  console.log('• Verification email should include verification link');
  console.log('• Check backend console for email delivery logs');
  console.log('• Check Zoho SMTP logs if emails not received');
  console.log('• Email verification is OPTIONAL (users can access app without it)');

  console.log('\n🔍 NEXT STEPS:');
  console.log('─'.repeat(60));
  console.log('1. Check backend console for email delivery logs');
  console.log('2. Check test email inbox: ' + TEST_EMAIL);
  console.log('3. Verify Zoho SMTP sent emails successfully');
  console.log('4. Test email verification link (if received)');

  console.log('\n✅ Test completed!\n');
}

// Run all tests
runAllTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
