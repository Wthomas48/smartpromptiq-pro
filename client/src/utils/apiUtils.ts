/**
 * Safe API request utility to prevent errors in production
 */

export async function apiRequest(method: string, url: string, body?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Always return a response object, even for errors
    return response;
  } catch (error) {
    console.warn(`API request failed for ${url}:`, error);

    // Return a mock response for failed requests to prevent crashes
    return {
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        data: null,
        message: 'Network error - using offline mode',
        error: 'NETWORK_ERROR'
      })
    } as Response;
  }
}

/**
 * Safe query function for React Query
 */
export function createSafeQuery(key: string[], fetcher: () => Promise<any>) {
  return {
    queryKey: key,
    queryFn: async () => {
      try {
        return await fetcher();
      } catch (error) {
        console.warn(`Query failed for ${key.join('/')}:`, error);
        return {
          success: false,
          data: null,
          message: 'Failed to load data - using offline mode'
        };
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  };
}