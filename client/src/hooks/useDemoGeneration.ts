// hooks/useDemoGeneration.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { demoApiRequest } from '../config/api';
import { requestQueue } from '../utils/requestQueue';

// Debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

interface DemoGenerationState {
  loading: boolean;
  error: string | null;
  data: any | null;
  queuePosition: number;
  retryCount: number;
  retryAfter: number;
  remaining: number;
  cooldownUntil: number;
  lastRequestTime: number;
  isDebouncing: boolean;
}

export const useDemoGeneration = () => {
  const [state, setState] = useState<DemoGenerationState>({
    loading: false,
    error: null,
    data: null,
    queuePosition: 0,
    retryCount: 0,
    retryAfter: 0,
    remaining: -1,
    cooldownUntil: 0,
    lastRequestTime: 0,
    isDebouncing: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const queueIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateDemoInternal = useCallback(async (demoData: any, isRetry = false, retryAttempt = 0) => {
    const now = Date.now();

    // Check cooldown
    if (!isRetry && state.cooldownUntil > now) {
      const waitTime = Math.ceil((state.cooldownUntil - now) / 1000);
      setState(prev => ({
        ...prev,
        error: `Please wait ${waitTime} seconds before trying again`,
        isDebouncing: false
      }));
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      data: null,
      queuePosition: requestQueue.getStatus().queueLength + 1,
      retryCount: retryAttempt,
      lastRequestTime: now,
      isDebouncing: false
    }));

    // Update queue position periodically
    if (queueIntervalRef.current) {
      clearInterval(queueIntervalRef.current);
    }

    queueIntervalRef.current = setInterval(() => {
      const queueStatus = requestQueue.getStatus();
      setState(prev => ({
        ...prev,
        queuePosition: queueStatus.queueLength
      }));
    }, 500);

    try {
      // Add timeout handling (30 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - 30 seconds exceeded')), 30000);
      });

      const requestPromise = demoApiRequest('POST', '/api/demo/generate', demoData);

      const response = await Promise.race([requestPromise, timeoutPromise]) as Response;
      const result = await response.json();

      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
        queueIntervalRef.current = null;
      }

      // Set cooldown for 2 seconds after successful request
      const cooldownUntil = Date.now() + 2000;

      // Extract the actual content data for state
      let dataToStore = result;
      if (result.success && result.data) {
        dataToStore = result.data;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        data: dataToStore,
        queuePosition: 0,
        retryCount: 0,
        retryAfter: 0,
        cooldownUntil,
        remaining: -1 // Will be updated by separate rate limit check
      }));

      return dataToStore;
    } catch (error: any) {
      console.error('❌ useDemoGeneration: Error occurred:', error);

      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
        queueIntervalRef.current = null;
      }

      let errorMessage = 'Failed to generate demo';
      let retryAfter = 0;
      let remaining = -1;
      let shouldRetry = false;

      // Parse error response for 429 errors
      if (error.status === 429) {
        try {
          const errorData = JSON.parse(error.message);
          retryAfter = errorData.retryAfter || 60;
          remaining = errorData.remaining || 0;
          errorMessage = errorData.message || `Rate limited. Try again in ${retryAfter} seconds.`;
        } catch {
          retryAfter = 60;
          errorMessage = 'Rate limited. Please wait before trying again.';
        }

        // Auto-retry up to 3 times with exponential backoff
        if (retryAttempt < 3) {
          shouldRetry = true;
          const retryDelay = Math.min(retryAfter * 1000, (retryAttempt + 1) * 2000);
          setTimeout(() => {
            generateDemoInternal(demoData, true, retryAttempt + 1);
          }, retryDelay);

          setState(prev => ({
            ...prev,
            loading: true,
            error: `Rate limited. Retrying in ${Math.ceil(retryDelay / 1000)} seconds... (${retryAttempt + 1}/3)`,
            retryCount: retryAttempt + 1,
            retryAfter,
            remaining
          }));
          return;
        }
      } else if (error.message.includes('aborted')) {
        errorMessage = 'Request cancelled';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again.';
      } else if (error.status >= 400) {
        errorMessage = 'Invalid request. Please check your data.';
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: null,
        queuePosition: 0,
        retryCount: shouldRetry ? retryAttempt + 1 : 0,
        retryAfter,
        remaining,
        cooldownUntil: shouldRetry ? 0 : Date.now() + 5000 // 5 second cooldown on non-retry errors
      }));

      if (!shouldRetry) {
        throw error;
      }
    }
  }, [state.cooldownUntil]);

  // Debounced version of generateDemo
  const debouncedGenerate = useCallback(
    debounce((demoData: any) => {
      generateDemoInternal(demoData);
    }, 2000),
    [generateDemoInternal]
  );

  const generateDemo = useCallback(async (demoData: any) => {
    const now = Date.now();

    // Check if we're in cooldown
    if (state.cooldownUntil > now) {
      const waitTime = Math.ceil((state.cooldownUntil - now) / 1000);
      setState(prev => ({
        ...prev,
        error: `Please wait ${waitTime} seconds before trying again`
      }));
      return;
    }

    // Check if last request was too recent (debounce)
    if (state.lastRequestTime > 0 && (now - state.lastRequestTime) < 2000) {
      setState(prev => ({ ...prev, isDebouncing: true }));
      debouncedGenerate(demoData);
      return;
    }

    return generateDemoInternal(demoData);
  }, [generateDemoInternal, debouncedGenerate, state.cooldownUntil, state.lastRequestTime]);

  const checkRateLimit = useCallback(async (userEmail?: string) => {
    try {
      const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
      const response = await demoApiRequest('GET', `/api/demo/rate-limit-status${params}`);
      const result = await response.json();

      if (result.success) {
        const emailLimits = result.data.email;
        setState(prev => ({
          ...prev,
          remaining: emailLimits ? emailLimits.remaining : result.data.ip.remaining
        }));
        return result.data;
      }
    } catch (error) {
      console.warn('Failed to check rate limits:', error);
    }
    return null;
  }, []);

  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear queue monitoring
    if (queueIntervalRef.current) {
      clearInterval(queueIntervalRef.current);
      queueIntervalRef.current = null;
    }

    setState({
      loading: false,
      error: null,
      data: null,
      queuePosition: 0,
      retryCount: 0,
      retryAfter: 0,
      remaining: -1,
      cooldownUntil: 0,
      lastRequestTime: 0,
      isDebouncing: false
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (queueIntervalRef.current) {
      clearInterval(queueIntervalRef.current);
      queueIntervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: 'Request cancelled'
    }));
  }, []);

  const retry = useCallback(async (demoData: any) => {
    // Clear any previous error before retrying
    setState(prev => ({
      ...prev,
      error: null
    }));

    return generateDemo(demoData);
  }, [generateDemo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    generateDemo,
    reset,
    cancel,
    retry,
    checkRateLimit,
    isRetrying: state.retryCount > 0 && state.loading,
    canRetry: !state.loading && state.error !== null && state.cooldownUntil <= Date.now(),
    canGenerate: !state.loading && state.cooldownUntil <= Date.now() && !state.isDebouncing,
    progress: {
      queuePosition: state.queuePosition,
      isQueued: state.queuePosition > 0,
      isProcessing: state.loading && state.queuePosition === 0,
      retryCount: state.retryCount,
      maxRetries: 3,
      retryAfter: state.retryAfter,
      remaining: state.remaining,
      cooldownUntil: state.cooldownUntil,
      isDebouncing: state.isDebouncing
    }
  };
};

// Hook for batch demo generation
export const useBatchDemoGeneration = () => {
  const [batchState, setBatchState] = useState<{
    loading: boolean;
    error: string | null;
    results: any[];
    completed: number;
    total: number;
  }>({
    loading: false,
    error: null,
    results: [],
    completed: 0,
    total: 0
  });

  const generateBatch = useCallback(async (demoDataArray: any[]) => {
    setBatchState({
      loading: true,
      error: null,
      results: [],
      completed: 0,
      total: demoDataArray.length
    });

    try {
      // Use demoApiRequest for each batch item to avoid auth issues
      const results = await Promise.all(
        demoDataArray.map(async (demoData) => {
          const response = await demoApiRequest('POST', '/api/demo/generate', demoData);
          return response.json();
        })
      );

      setBatchState({
        loading: false,
        error: null,
        results,
        completed: results.length,
        total: demoDataArray.length
      });

      return results;
    } catch (error: any) {
      setBatchState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Batch generation failed'
      }));
      throw error;
    }
  }, []);

  const resetBatch = useCallback(() => {
    setBatchState({
      loading: false,
      error: null,
      results: [],
      completed: 0,
      total: 0
    });
  }, []);

  return {
    ...batchState,
    generateBatch,
    resetBatch,
    progress: batchState.total > 0 ? (batchState.completed / batchState.total) * 100 : 0
  };
};

// Hook for demo generation with real-time status updates
export const useDemoGenerationWithStatus = () => {
  const demoGeneration = useDemoGeneration();
  const [queueStatus, setQueueStatus] = useState(requestQueue.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueStatus(requestQueue.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...demoGeneration,
    queueStatus,
    systemLoad: {
      queueLength: queueStatus.queueLength,
      activeRequests: queueStatus.activeRequests,
      maxConcurrent: queueStatus.maxConcurrent,
      utilization: (queueStatus.activeRequests / queueStatus.maxConcurrent) * 100
    }
  };
};