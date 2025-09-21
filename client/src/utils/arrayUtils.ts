/**
 * Array utility functions to ensure safe array operations throughout the application
 * This prevents "Cannot read properties of undefined (reading 'map')" errors
 */

/**
 * Safely ensures a value is an array, returning empty array if undefined/null
 */
export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safe map function that handles undefined/null arrays
 */
export function safeMap<T, R>(
  array: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => R
): R[] {
  return ensureArray(array).map(callback);
}

/**
 * Safe filter function that handles undefined/null arrays
 */
export function safeFilter<T>(
  array: T[] | undefined | null,
  predicate: (item: T, index: number, array: T[]) => boolean
): T[] {
  return ensureArray(array).filter(predicate);
}

/**
 * Safe slice function that handles undefined/null arrays
 */
export function safeSlice<T>(
  array: T[] | undefined | null,
  start?: number,
  end?: number
): T[] {
  return ensureArray(array).slice(start, end);
}

/**
 * Safe find function that handles undefined/null arrays
 */
export function safeFind<T>(
  array: T[] | undefined | null,
  predicate: (item: T, index: number, array: T[]) => boolean
): T | undefined {
  return ensureArray(array).find(predicate);
}

/**
 * Safe length property that handles undefined/null arrays
 */
export function safeLength<T>(array: T[] | undefined | null): number {
  return ensureArray(array).length;
}

/**
 * Global error handler for array operations
 */
export function withArraySafety<T extends any[], R>(
  operation: () => R,
  fallback: R,
  arrayContext?: string
): R {
  try {
    return operation();
  } catch (error) {
    console.warn(`Array safety fallback triggered${arrayContext ? ` for ${arrayContext}` : ''}:`, error);
    return fallback;
  }
}