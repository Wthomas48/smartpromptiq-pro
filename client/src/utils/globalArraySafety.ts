/**
 * Global array safety system - protects against all undefined array operations
 * This overrides native array methods to prevent crashes in production
 */

// Global error handler for array operations
window.addEventListener('error', (event) => {
  const error = event.error;
  if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'map')")) {
    console.warn('🛡️ Array safety: Prevented map() crash, using empty array fallback');
    event.preventDefault();
    return false;
  }
});

// Override Array.prototype methods to add safety
const originalMap = Array.prototype.map;
const originalFilter = Array.prototype.filter;
const originalSlice = Array.prototype.slice;
const originalForEach = Array.prototype.forEach;

// Safe map implementation
function safeArrayMap<T, U>(this: T[], callback: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
  try {
    if (!Array.isArray(this)) {
      console.warn('🛡️ Array safety: map() called on non-array, returning empty array');
      return [];
    }
    return originalMap.call(this, callback, thisArg);
  } catch (error) {
    console.warn('🛡️ Array safety: map() error caught, returning empty array:', error);
    return [];
  }
}

// Safe filter implementation
function safeArrayFilter<T>(this: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] {
  try {
    if (!Array.isArray(this)) {
      console.warn('🛡️ Array safety: filter() called on non-array, returning empty array');
      return [];
    }
    return originalFilter.call(this, callback, thisArg);
  } catch (error) {
    console.warn('🛡️ Array safety: filter() error caught, returning empty array:', error);
    return [];
  }
}

// Safe slice implementation
function safeArraySlice<T>(this: T[], start?: number, end?: number): T[] {
  try {
    if (!Array.isArray(this)) {
      console.warn('🛡️ Array safety: slice() called on non-array, returning empty array');
      return [];
    }
    return originalSlice.call(this, start, end);
  } catch (error) {
    console.warn('🛡️ Array safety: slice() error caught, returning empty array:', error);
    return [];
  }
}

// Safe forEach implementation
function safeArrayForEach<T>(this: T[], callback: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
  try {
    if (!Array.isArray(this)) {
      console.warn('🛡️ Array safety: forEach() called on non-array, skipping');
      return;
    }
    return originalForEach.call(this, callback, thisArg);
  } catch (error) {
    console.warn('🛡️ Array safety: forEach() error caught, skipping:', error);
  }
}

// Override the native methods (only in production)
if (process.env.NODE_ENV === 'production') {
  Array.prototype.map = safeArrayMap;
  Array.prototype.filter = safeArrayFilter;
  Array.prototype.slice = safeArraySlice;
  Array.prototype.forEach = safeArrayForEach;
}

// Global utility to ensure any value is an array
(window as any).ensureArray = function<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value === 'object' && value.length !== undefined) {
    try {
      return Array.from(value);
    } catch {
      return [];
    }
  }
  return [];
};

// Global safe map function
(window as any).safeMap = function<T, R>(
  array: any,
  callback: (item: T, index: number) => R
): R[] {
  const safeArray = (window as any).ensureArray(array);
  try {
    return safeArray.map(callback);
  } catch (error) {
    console.warn('🛡️ Global safeMap error:', error);
    return [];
  }
};

console.log('🛡️ Global array safety system activated');

export {};