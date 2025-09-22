/**
 * API Utilities - Safe API functions and query utilities
 * Prevents crashes from API response handling
 */

import { apiRequest } from '@/config/api';

// Safe query creator for React Query
export const createSafeQuery = (queryKey, queryFn, options = {}) => {
  return {
    queryKey,
    queryFn: async (...args) => {
      try {
        const result = await queryFn(...args);
        return result;
      } catch (error) {
        console.error(`Query error for ${queryKey}:`, error);
        return {
          success: false,
          data: null,
          error: error.message
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes default
    retry: 1,
    ...options
  };
};

// Re-export apiRequest for convenience
export { apiRequest };