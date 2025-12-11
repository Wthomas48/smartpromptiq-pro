import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { queueRequest, RequestPriority } from "@/utils/requestQueue";
import { getApiBaseUrl } from "@/config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`);
    (error as any).status = res.status;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  priority: RequestPriority = 'normal'
): Promise<Response> {
  const requestId = `${method}:${url}:${Date.now()}`;

  return queueRequest(async () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};

    if (data) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`✅ Token found and added to headers:`, token.substring(0, 20) + '...');
    } else {
      console.warn(`⚠️ NO TOKEN FOUND in localStorage!`);
    }

    const baseUrl = getApiBaseUrl();
    const fullUrl = `${baseUrl}${url}`;
    console.log(`🌐 QueryClient API Request: ${method} ${fullUrl}`);
    console.log(`📋 Headers:`, headers);

    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  }, requestId, priority);
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const requestId = `GET:${url}:${Date.now()}`;

    return queueRequest(async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log(`✅ useQuery Token found:`, token.substring(0, 20) + '...');
      } else {
        console.warn(`⚠️ useQuery NO TOKEN FOUND in localStorage!`);
      }

      const baseUrl = getApiBaseUrl();
      const fullUrl = `${baseUrl}${url}`;
      console.log(`🌐 QueryClient GET Request: ${fullUrl}`);
      console.log(`📋 useQuery Headers:`, headers);

      const res = await fetch(fullUrl, {
        headers,
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    }, requestId, 'normal');
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors and 5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for network errors and rate limits
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Export request queue utilities for direct use
export { requestQueue, queueRequest } from "@/utils/requestQueue";
export type { RequestPriority, QueueStatus } from "@/utils/requestQueue";
