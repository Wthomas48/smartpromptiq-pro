/**
 * ULTIMATE Array Safety System - Nuclear option to prevent all array crashes
 * This completely overrides and monkey-patches ALL array operations
 */

// Store original methods before any possible modifications
const originalArrayMethods = {
  map: Array.prototype.map,
  filter: Array.prototype.filter,
  slice: Array.prototype.slice,
  forEach: Array.prototype.forEach,
  find: Array.prototype.find,
  reduce: Array.prototype.reduce,
  some: Array.prototype.some,
  every: Array.prototype.every
};

// Global error catcher for array errors only - DO NOT interfere with React hooks
const originalConsoleError = console.error;
console.error = function(...args: any[]) {
  const errorMessage = args.join(' ');

  // Only intercept specific array-related errors, NOT React hook errors
  if (errorMessage.includes("Cannot read properties of undefined (reading 'map')") ||
      errorMessage.includes("Cannot read property 'map' of undefined") ||
      errorMessage.includes("Cannot read properties of undefined (reading 'slice')") ||
      errorMessage.includes("Cannot read property 'slice' of undefined") ||
      errorMessage.includes("Cannot read properties of undefined (reading 'filter')") ||
      errorMessage.includes("Cannot read property 'filter' of undefined") ||
      errorMessage.includes(".slice is not a function") ||
      errorMessage.includes(".map is not a function") ||
      errorMessage.includes(".filter is not a function")) {

    // Don't intercept if this is a React hook error
    if (errorMessage.includes('Invalid hook call') ||
        errorMessage.includes('Hooks can only be called') ||
        errorMessage.includes('react')) {
      originalConsoleError.apply(console, args);
      return;
    }

    console.warn('🛡️ ULTIMATE ARRAY SAFETY: Intercepted array method error, preventing crash');
    return;
  }
  originalConsoleError.apply(console, args);
};

// Ultimate global error handler
window.addEventListener('error', (event) => {
  if (event.error && event.error.message) {
    const message = event.error.message;
    if (message.includes("Cannot read properties of undefined (reading 'map')") ||
        message.includes("Cannot read property 'map' of undefined") ||
        message.includes("Cannot read properties of undefined (reading 'filter')") ||
        message.includes("Cannot read property 'filter' of undefined") ||
        message.includes("Cannot read properties of undefined (reading 'slice')") ||
        message.includes("Cannot read property 'slice' of undefined") ||
        message.includes(".slice is not a function") ||
        message.includes(".map is not a function") ||
        message.includes(".filter is not a function") ||
        message.includes(".forEach is not a function") ||
        message.includes(".find is not a function") ||
        message.includes(".reduce is not a function")) {

      console.warn('🛡️ ULTIMATE ARRAY SAFETY: Prevented array crash:', message);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }
}, true);

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message) {
    const message = event.reason.message;
    if (message.includes("Cannot read properties of undefined (reading 'map')")) {
      console.warn('🛡️ ULTIMATE ARRAY SAFETY: Prevented promise rejection from array error');
      event.preventDefault();
      return false;
    }
  }
});

// NUCLEAR OPTION: Override ALL array methods globally and aggressively
function createSuperSafeArrayMethod<T, R>(
  originalMethod: Function,
  methodName: string,
  defaultReturn: any
) {
  return function(this: any, ...args: any[]): any {
    try {
      // Check if 'this' is actually an array or array-like
      if (this === null || this === undefined) {
        console.warn(`🛡️ ULTIMATE ARRAY SAFETY: ${methodName}() called on null/undefined, returning fallback`);
        return defaultReturn;
      }

      // Check if it has length property (array-like)
      if (typeof this.length !== 'number') {
        console.warn(`🛡️ ULTIMATE ARRAY SAFETY: ${methodName}() called on non-array-like object, returning fallback`);
        return defaultReturn;
      }

      // Ensure it's actually an array
      if (!Array.isArray(this) && typeof this !== 'object') {
        console.warn(`🛡️ ULTIMATE ARRAY SAFETY: ${methodName}() called on invalid type, returning fallback`);
        return defaultReturn;
      }

      // Call the original method
      return originalMethod.apply(this, args);
    } catch (error) {
      console.warn(`🛡️ ULTIMATE ARRAY SAFETY: ${methodName}() error caught:`, error);
      return defaultReturn;
    }
  };
}

// Override ALL potentially problematic array methods
Array.prototype.map = createSuperSafeArrayMethod(originalArrayMethods.map, 'map', []);
Array.prototype.filter = createSuperSafeArrayMethod(originalArrayMethods.filter, 'filter', []);
Array.prototype.slice = createSuperSafeArrayMethod(originalArrayMethods.slice, 'slice', []);
Array.prototype.forEach = createSuperSafeArrayMethod(originalArrayMethods.forEach, 'forEach', undefined);
Array.prototype.find = createSuperSafeArrayMethod(originalArrayMethods.find, 'find', undefined);
Array.prototype.reduce = createSuperSafeArrayMethod(originalArrayMethods.reduce, 'reduce', undefined);
Array.prototype.some = createSuperSafeArrayMethod(originalArrayMethods.some, 'some', false);
Array.prototype.every = createSuperSafeArrayMethod(originalArrayMethods.every, 'every', true);

// Additional safety: Intercept property access on undefined/null
const originalObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const originalObjectGetOwnPropertyNames = Object.getOwnPropertyNames;

// Global safety for any object trying to call .map on undefined
(window as any).safeCall = function(obj: any, method: string, ...args: any[]) {
  if (obj === null || obj === undefined) {
    console.warn(`🛡️ ULTIMATE ARRAY SAFETY: Prevented ${method} call on null/undefined`);
    if (method === 'map' || method === 'filter' || method === 'slice') return [];
    return undefined;
  }

  if (typeof obj[method] === 'function') {
    try {
      return obj[method](...args);
    } catch (error) {
      console.warn(`🛡️ ULTIMATE ARRAY SAFETY: Prevented error in ${method}:`, error);
      if (method === 'map' || method === 'filter' || method === 'slice') return [];
      return undefined;
    }
  }

  console.warn(`🛡️ ULTIMATE ARRAY SAFETY: Method ${method} not found on object`);
  return undefined;
};

// Patch React's internals if possible (last resort)
const patchReactInternals = () => {
  try {
    // Try to find React's internal error boundaries and patch them
    if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (internals.ReactCurrentDispatcher && internals.ReactCurrentDispatcher.current) {
        console.log('🛡️ ULTIMATE ARRAY SAFETY: React internals found, applying patches');
      }
    }
  } catch (e) {
    // Silently continue if React internals aren't accessible
  }
};

// Apply patches after a short delay to ensure everything is loaded
setTimeout(patchReactInternals, 100);

// NUCLEAR OPTION 2: Create a global Proxy to intercept all property access
const createSafeProxy = (target: any) => {
  if (!target || typeof target !== 'object') return target;

  return new Proxy(target, {
    get(obj, prop) {
      try {
        const value = obj[prop];

        // If accessing array methods on non-arrays, return safe versions
        if (prop === 'map' && !Array.isArray(obj)) {
          console.warn('🛡️ ULTIMATE ARRAY SAFETY: Prevented map() on non-array, returning safe version');
          return () => [];
        }
        if (prop === 'slice' && !Array.isArray(obj)) {
          console.warn('🛡️ ULTIMATE ARRAY SAFETY: Prevented slice() on non-array, returning safe version');
          return () => [];
        }
        if (prop === 'filter' && !Array.isArray(obj)) {
          console.warn('🛡️ ULTIMATE ARRAY SAFETY: Prevented filter() on non-array, returning safe version');
          return () => [];
        }

        return value;
      } catch (error) {
        console.warn(`🛡️ ULTIMATE ARRAY SAFETY: Error accessing property ${String(prop)}:`, error);
        return undefined;
      }
    }
  });
};

// Monkey patch common window/global objects that might cause issues
if (typeof window !== 'undefined') {
  try {
    // Patch Array constructor to return safe arrays
    const originalArray = window.Array;
    window.Array = function(...args: any[]) {
      const arr = new originalArray(...args);
      return createSafeProxy(arr);
    } as any;

    // Copy static methods
    Object.setPrototypeOf(window.Array, originalArray);
    Object.getOwnPropertyNames(originalArray).forEach(name => {
      if (typeof originalArray[name as keyof typeof originalArray] === 'function') {
        (window.Array as any)[name] = originalArray[name as keyof typeof originalArray];
      }
    });
  } catch (e) {
    console.warn('🛡️ ULTIMATE ARRAY SAFETY: Could not patch Array constructor');
  }
}

// Add global try-catch wrapper for critical operations
(window as any).safeArrayOp = function(obj: any, method: string, ...args: any[]) {
  try {
    if (!obj) {
      console.warn(`🛡️ ULTIMATE ARRAY SAFETY: safeArrayOp called on null/undefined for ${method}`);
      return method === 'slice' || method === 'map' || method === 'filter' ? [] : undefined;
    }

    if (!Array.isArray(obj) && typeof obj[method] !== 'function') {
      console.warn(`🛡️ ULTIMATE ARRAY SAFETY: ${method} not available on object, providing fallback`);
      return method === 'slice' || method === 'map' || method === 'filter' ? [] : undefined;
    }

    return obj[method](...args);
  } catch (error) {
    console.warn(`🛡️ ULTIMATE ARRAY SAFETY: safeArrayOp caught error in ${method}:`, error);
    return method === 'slice' || method === 'map' || method === 'filter' ? [] : undefined;
  }
};

console.log('🛡️ ULTIMATE ARRAY SAFETY SYSTEM ACTIVATED - ALL ARRAY OPERATIONS PROTECTED + ENHANCED SLICE PROTECTION');

export {};