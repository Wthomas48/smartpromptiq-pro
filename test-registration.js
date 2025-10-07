#!/usr/bin/env node

/**
 * Manual Registration Testing Script
 * Tests the registration endpoint with various payloads to identify 400 error causes
 */

const testRegistration = async (testName, payload, expectedStatus = 201) => {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://smartpromptiq.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://smartpromptiq.com',
        'User-Agent': 'TestScript/1.0'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`📥 Raw Response:`, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`📥 Parsed Response:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`❌ Non-JSON Response:`, responseText);
      return { success: false, error: 'Non-JSON response' };
    }

    const success = response.status === expectedStatus;
    console.log(`${success ? '✅' : '❌'} Test ${success ? 'PASSED' : 'FAILED'}`);

    return { success, status: response.status, data };

  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// Test cases to identify the issue
const runTests = async () => {
  console.log('🚀 Starting Registration Endpoint Tests');
  console.log('=' .repeat(50));

  // Test 1: Full valid payload
  await testRegistration('Valid Full Payload', {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.registration@example.com',
    password: 'testPassword123'
  });

  // Test 2: Minimal payload (no lastName)
  await testRegistration('Minimal Payload', {
    firstName: 'Test',
    email: 'test.minimal@example.com',
    password: 'testPassword123'
  });

  // Test 3: Missing firstName (should fail)
  await testRegistration('Missing firstName', {
    email: 'test.nofirst@example.com',
    password: 'testPassword123'
  }, 400);

  // Test 4: Missing email (should fail)
  await testRegistration('Missing Email', {
    firstName: 'Test',
    password: 'testPassword123'
  }, 400);

  // Test 5: Missing password (should fail)
  await testRegistration('Missing Password', {
    firstName: 'Test',
    email: 'test.nopass@example.com'
  }, 400);

  // Test 6: Short password (should fail)
  await testRegistration('Short Password', {
    firstName: 'Test',
    email: 'test.shortpass@example.com',
    password: '123'
  }, 400);

  // Test 7: Invalid email (should fail)
  await testRegistration('Invalid Email', {
    firstName: 'Test',
    email: 'invalid-email',
    password: 'testPassword123'
  }, 400);

  // Test 8: Empty strings
  await testRegistration('Empty Strings', {
    firstName: '',
    lastName: '',
    email: 'test.empty@example.com',
    password: 'testPassword123'
  }, 400);

  // Test 9: Extra fields
  await testRegistration('Extra Fields', {
    firstName: 'Test',
    email: 'test.extra@example.com',
    password: 'testPassword123',
    extraField: 'should be ignored',
    anotherField: 123
  });

  console.log('\n🏁 All tests completed!');
};

// Import fetch for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTests().catch(console.error);