// utils/safeOperations.js
export const safeMap = (array, callback, fallback = []) => {
  try {
    if (!Array.isArray(array)) {
      console.warn('safeMap: Expected array, got:', typeof array, array);
      return fallback;
    }
    return array.map(callback);
  } catch (error) {
    console.error('safeMap error:', error);
    return fallback;
  }
};

export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

export const safeUser = (userData) => ({
  ...userData,
  roles: ensureArray(userData?.roles),
  permissions: ensureArray(userData?.permissions),
  role: userData?.role || null
});