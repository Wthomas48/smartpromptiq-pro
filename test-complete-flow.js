// Complete test of the signup flow
console.log('=== Testing Complete Signup Flow ===');

// Simulate ensureSafeUser function
function ensureSafeUser(userData) {
  if (!userData) {
    console.warn('🔍 ensureSafeUser: received null/undefined userData');
    return null;
  }

  // ✅ FIXED: Create safe user object without overwriting response properties
  const safeUser = {
    // Core user properties with fallbacks
    id: userData?.id || 'demo-user',
    email: userData?.email || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',

    // ✅ CRITICAL: Ensure role is never undefined
    role: userData?.role || 'USER',

    // ✅ CRITICAL: Ensure arrays are always arrays
    roles: Array.isArray(userData?.roles) ? userData.roles : [],
    permissions: Array.isArray(userData?.permissions) ? userData.permissions : [],

    // Optional properties with safe defaults
    profileImageUrl: userData?.profileImageUrl || '',
    subscriptionTier: userData?.subscriptionTier || userData?.plan || 'free',
    tokenBalance: typeof userData?.tokenBalance === 'number' ? userData.tokenBalance : 0,
    stripeCustomerId: userData?.stripeCustomerId || '',
    subscriptionStatus: userData?.subscriptionStatus || 'active',

    // ✅ FIXED: Only preserve safe additional user properties, not response metadata
    ...(userData && typeof userData === 'object' ? Object.fromEntries(
      Object.entries(userData).filter(([key]) =>
        // Exclude response metadata properties that should not be copied
        !['success', 'message', 'data', 'token', 'error'].includes(key)
      )
    ) : {})
  };

  console.log('🔍 ensureSafeUser: processed user data:', {
    input: userData,
    output: safeUser,
    inputHasSuccess: 'success' in userData,
    outputHasSuccess: 'success' in safeUser
  });

  return safeUser;
}

// Test the production response format
const productionResponse = {
  success: true,
  token: "demo-token",
  user: {
    id: "demo",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User"
  }
};

console.log('\n1. Production API Response:', productionResponse);

// Simulate API processing (authAPI.signup)
function processSignupResponse(data, userData) {
  console.log('\n2. Processing in authAPI.signup...');

  let safeResponse;

  if (data.data) {
    // Nested format: {success: true, data: {user: {...}, token: 'xxx'}}
    console.log('Using nested format processing');
    safeResponse = {
      ...data,
      data: {
        ...data.data,
        user: data.data.user ? ensureSafeUser({
          ...data.data.user,
          email: data.data.user.email || userData.email,
          firstName: data.data.user.firstName || userData.firstName || '',
          lastName: data.data.user.lastName || userData.lastName || '',
        }) : null,
        token: data.data.token || null
      }
    };
  } else {
    // Direct format: {success: true, user: {...}, token: 'xxx'} - keep as is
    console.log('Using direct format processing');
    safeResponse = {
      ...data,
      user: data.user ? ensureSafeUser({
        ...data.user,
        email: data.user.email || userData.email,
        firstName: data.user.firstName || userData.firstName || '',
        lastName: data.user.lastName || userData.lastName || '',
      }) : null
    };
  }

  console.log('Safe response:', safeResponse);
  console.log('Safe response success:', safeResponse.success);
  return safeResponse;
}

// Test the full flow
const userData = { email: 'test@example.com', firstName: 'Test', lastName: 'User' };
const processedResponse = processSignupResponse(productionResponse, userData);

console.log('\n3. Final response to useAuth:', processedResponse);
console.log('Final success value:', processedResponse.success);
console.log('Will useAuth validation pass?', processedResponse.success === true);