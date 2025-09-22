/**
 * Array Safety Utilities - Prevents crashes from map operations on undefined arrays
 * Used by Dashboard component and other components that need safe array operations
 */

// Safe map function that prevents crashes
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

// Safe slice function
export const safeSlice = (array, start, end, fallback = []) => {
  try {
    if (!Array.isArray(array)) {
      console.warn('safeSlice: Expected array, got:', typeof array, array);
      return fallback;
    }
    return array.slice(start, end);
  } catch (error) {
    console.error('safeSlice error:', error);
    return fallback;
  }
};

// Safe filter function
export const safeFilter = (array, callback, fallback = []) => {
  try {
    if (!Array.isArray(array)) {
      console.warn('safeFilter: Expected array, got:', typeof array, array);
      return fallback;
    }
    return array.filter(callback);
  } catch (error) {
    console.error('safeFilter error:', error);
    return fallback;
  }
};

// Ensure array function
export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

// Higher-order function for array safety
export const withArraySafety = (fn, fallback = [], description = 'operation') => {
  try {
    const result = fn();
    if (Array.isArray(result)) {
      return result;
    }
    console.warn(`withArraySafety (${description}): Expected array result, got:`, typeof result, result);
    return fallback;
  } catch (error) {
    console.error(`withArraySafety (${description}) error:`, error);
    return fallback;
  }
};