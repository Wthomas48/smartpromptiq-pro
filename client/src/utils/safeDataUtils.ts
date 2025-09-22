/**
 * ✅ URGENT DEPLOYMENT PRIORITY: Safe data utilities to prevent map errors
 *
 * These utilities ensure that all data structures are safe to use
 * and prevent runtime errors when mapping over potentially undefined arrays.
 */

// ✅ Universal safe mapping utility - prevents map errors on undefined/null arrays
export const safeMap = <T, R>(array: T[] | undefined | null, callback: (item: T, index: number, array: T[]) => R, fallback: R[] = []): R[] => {
  if (!Array.isArray(array)) {
    console.warn('🔍 safeMap: expected array, got:', {
      type: typeof array,
      value: array,
      isNull: array === null,
      isUndefined: array === undefined,
      timestamp: new Date().toISOString()
    });
    return fallback;
  }

  try {
    return array.map(callback);
  } catch (error) {
    console.error('❌ safeMap: Error during mapping:', error);
    return fallback;
  }
};

// ✅ Safe filter utility - prevents filter errors on undefined/null arrays
export const safeFilter = <T>(array: T[] | undefined | null, callback: (item: T, index: number, array: T[]) => boolean, fallback: T[] = []): T[] => {
  if (!Array.isArray(array)) {
    console.warn('🔍 safeFilter: expected array, got:', {
      type: typeof array,
      value: array,
      timestamp: new Date().toISOString()
    });
    return fallback;
  }

  try {
    return array.filter(callback);
  } catch (error) {
    console.error('❌ safeFilter: Error during filtering:', error);
    return fallback;
  }
};

// ✅ Safe forEach utility - prevents forEach errors on undefined/null arrays
export const safeForEach = <T>(array: T[] | undefined | null, callback: (item: T, index: number, array: T[]) => void): void => {
  if (!Array.isArray(array)) {
    console.warn('🔍 safeForEach: expected array, got:', {
      type: typeof array,
      value: array,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    array.forEach(callback);
  } catch (error) {
    console.error('❌ safeForEach: Error during iteration:', error);
  }
};

// ✅ Safe user data utility - ensures user object has safe structure
export const ensureSafeUser = (userData: any) => {
  if (!userData) {
    console.warn('🔍 ensureSafeUser: received null/undefined userData');
    return null;
  }

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

    // Preserve any additional properties
    ...userData
  };

  console.log('🔍 ensureSafeUser: processed user data:', {
    input: userData,
    output: safeUser,
    hasRole: !!safeUser.role,
    roleType: typeof safeUser.role,
    hasRoles: !!safeUser.roles,
    rolesIsArray: Array.isArray(safeUser.roles),
    hasPermissions: !!safeUser.permissions,
    permissionsIsArray: Array.isArray(safeUser.permissions),
    timestamp: new Date().toISOString()
  });

  return safeUser;
};

// ✅ Safe array access utility - prevents errors when accessing array properties
export const safeArrayAccess = <T>(array: T[] | undefined | null, index: number, fallback?: T): T | undefined => {
  if (!Array.isArray(array)) {
    console.warn('🔍 safeArrayAccess: expected array, got:', {
      type: typeof array,
      value: array,
      index,
      timestamp: new Date().toISOString()
    });
    return fallback;
  }

  if (index < 0 || index >= array.length) {
    console.warn('🔍 safeArrayAccess: index out of bounds:', {
      index,
      arrayLength: array.length,
      timestamp: new Date().toISOString()
    });
    return fallback;
  }

  return array[index];
};

// ✅ Safe array length utility - prevents errors when checking array length
export const safeArrayLength = (array: any[] | undefined | null): number => {
  if (!Array.isArray(array)) {
    console.warn('🔍 safeArrayLength: expected array, got:', {
      type: typeof array,
      value: array,
      timestamp: new Date().toISOString()
    });
    return 0;
  }

  return array.length;
};

// ✅ Type guard for arrays
export const isValidArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

// ✅ Type guard for safe user objects
export const isValidUser = (value: any): boolean => {
  return value &&
         typeof value === 'object' &&
         typeof value.id === 'string' &&
         typeof value.email === 'string' &&
         (typeof value.role === 'string' || value.role === null || value.role === undefined) &&
         Array.isArray(value.roles) &&
         Array.isArray(value.permissions);
};

export default {
  safeMap,
  safeFilter,
  safeForEach,
  ensureSafeUser,
  safeArrayAccess,
  safeArrayLength,
  isValidArray,
  isValidUser
};