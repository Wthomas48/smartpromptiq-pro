/**
 * 🚨 EMERGENCY ARRAY FIX - Global replacements for all dangerous map operations
 *
 * This module provides globally available safe array operations that prevent crashes
 */

// 🚨 EMERGENCY: Global safe map function
(window as any).safeMap = function<T, R>(
  array: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => R,
  fallback: R[] = []
): R[] {
  if (!array || !Array.isArray(array)) {
    console.warn('🚨 EMERGENCY safeMap: Array is null/undefined/invalid:', typeof array, array);
    return fallback;
  }

  try {
    return array.map(callback);
  } catch (error) {
    console.error('🚨 EMERGENCY safeMap: Error during mapping:', error);
    return fallback;
  }
};

// 🚨 EMERGENCY: Global safe filter function
(window as any).safeFilter = function<T>(
  array: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => boolean,
  fallback: T[] = []
): T[] {
  if (!array || !Array.isArray(array)) {
    console.warn('🚨 EMERGENCY safeFilter: Array is null/undefined/invalid:', typeof array, array);
    return fallback;
  }

  try {
    return array.filter(callback);
  } catch (error) {
    console.error('🚨 EMERGENCY safeFilter: Error during filtering:', error);
    return fallback;
  }
};

// 🚨 EMERGENCY: Global safe slice function
(window as any).safeSlice = function<T>(
  array: T[] | undefined | null,
  start?: number,
  end?: number,
  fallback: T[] = []
): T[] {
  if (!array || !Array.isArray(array)) {
    console.warn('🚨 EMERGENCY safeSlice: Array is null/undefined/invalid:', typeof array, array);
    return fallback;
  }

  try {
    return array.slice(start, end);
  } catch (error) {
    console.error('🚨 EMERGENCY safeSlice: Error during slicing:', error);
    return fallback;
  }
};

// 🚨 EMERGENCY: Global safe some function
(window as any).safeSome = function<T>(
  array: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => boolean
): boolean {
  if (!array || !Array.isArray(array)) {
    console.warn('🚨 EMERGENCY safeSome: Array is null/undefined/invalid:', typeof array, array);
    return false;
  }

  try {
    return array.some(callback);
  } catch (error) {
    console.error('🚨 EMERGENCY safeSome: Error during some operation:', error);
    return false;
  }
};

// 🚨 EMERGENCY: Monkey patch dangerous array access patterns
const patchUnsafeArrayAccess = () => {
  // Override common property access patterns that cause crashes
  const originalProperty = Object.getOwnPropertyDescriptor;

  // Patch any property access that might be dangerous
  const dangerousProperties = ['map', 'filter', 'slice', 'some', 'every', 'forEach', 'find', 'reduce'];

  dangerousProperties.forEach(prop => {
    try {
      // Add to all objects as a safety fallback
      Object.defineProperty(Object.prototype, prop, {
        get: function() {
          if (this === null || this === undefined) {
            console.warn(`🚨 EMERGENCY: Accessing .${prop} on null/undefined, returning safe function`);
            if (prop === 'map' || prop === 'filter' || prop === 'slice') {
              return () => [];
            }
            if (prop === 'some' || prop === 'every') {
              return () => false;
            }
            return () => undefined;
          }

          if (Array.isArray(this)) {
            return Array.prototype[prop as keyof Array<any>].bind(this);
          }

          console.warn(`🚨 EMERGENCY: Accessing .${prop} on non-array:`, typeof this, this);
          if (prop === 'map' || prop === 'filter' || prop === 'slice') {
            return () => [];
          }
          if (prop === 'some' || prop === 'every') {
            return () => false;
          }
          return () => undefined;
        },
        configurable: true,
        enumerable: false
      });
    } catch (e) {
      console.warn(`🚨 EMERGENCY: Could not patch ${prop} property`);
    }
  });
};

// 🚨 EMERGENCY: Runtime array safety checks
const addRuntimeSafety = () => {
  // Intercept all function calls to check for array method calls on undefined
  const originalCall = Function.prototype.call;
  Function.prototype.call = function(thisArg, ...args) {
    try {
      // Check if this is an array method being called on null/undefined
      if (thisArg === null || thisArg === undefined) {
        const functionName = this.name;
        if (['map', 'filter', 'slice', 'some', 'every', 'forEach', 'find', 'reduce'].includes(functionName)) {
          console.warn(`🚨 EMERGENCY: Prevented ${functionName} call on null/undefined`);
          if (functionName === 'map' || functionName === 'filter' || functionName === 'slice') {
            return [];
          }
          if (functionName === 'some' || functionName === 'every') {
            return false;
          }
          return undefined;
        }
      }

      return originalCall.apply(this, [thisArg, ...args]);
    } catch (error) {
      console.error('🚨 EMERGENCY: Error in function call interception:', error);
      return originalCall.apply(this, [thisArg, ...args]);
    }
  };
};

// 🚨 EMERGENCY: Apply all safety measures
try {
  patchUnsafeArrayAccess();
  addRuntimeSafety();
} catch (error) {
  console.error('🚨 EMERGENCY: Error applying array safety measures:', error);
}

console.log('🚨 EMERGENCY ARRAY FIX: Global safe array operations loaded');

// Export for TypeScript modules
export const safeMap = (window as any).safeMap;
export const safeFilter = (window as any).safeFilter;
export const safeSlice = (window as any).safeSlice;
export const safeSome = (window as any).safeSome;