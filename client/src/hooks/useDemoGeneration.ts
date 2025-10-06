// hooks/useDemoGeneration.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { requestQueue } from '../utils/requestQueue';

interface DemoGenerationState {
  loading: boolean;
  error: string | null;
  data: any | null;
  queuePosition: number;
  retryCount: number;
}

export const useDemoGeneration = () => {
  const [state, setState] = useState<DemoGenerationState>({
    loading: false,
    error: null,
    data: null,
    queuePosition: 0,
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const queueIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateDemo = useCallback(async (demoData: any) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState({
      loading: true,
      error: null,
      data: null,
      queuePosition: requestQueue.getStatus().queueLength + 1,
      retryCount: 0
    });

    // Update queue position periodically
    if (queueIntervalRef.current) {
      clearInterval(queueIntervalRef.current);
    }

    queueIntervalRef.current = setInterval(() => {
      const queueStatus = requestQueue.getStatus();
      setState(prev => ({
        ...prev,
        queuePosition: queueStatus.queueLength,
        retryCount: prev.retryCount // Maintain retry count
      }));
    }, 500);

    try {
      const response = await apiRequest('POST', '/api/demo/generate', demoData);
      const result = await response.json();

      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
        queueIntervalRef.current = null;
      }

      setState({
        loading: false,
        error: null,
        data: result,
        queuePosition: 0,
        retryCount: 0
      });

      return result;
    } catch (error: any) {
      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
        queueIntervalRef.current = null;
      }

      let errorMessage = 'Failed to generate demo';
      let retryCount = 0;

      if (error.status === 429) {
        errorMessage = 'Server is busy. Your request will be retried automatically.';
        retryCount = parseInt(error.retryCount || '0');
      } else if (error.message.includes('Max retries')) {
        errorMessage = 'Server is experiencing high load. Please try again in a few minutes.';
        retryCount = 5; // Max retries reached
      } else if (error.message.includes('aborted')) {
        errorMessage = 'Request cancelled';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again.';
      } else if (error.status >= 400) {
        errorMessage = 'Invalid request. Please check your data.';
      }

      setState({
        loading: false,
        error: errorMessage,
        data: null,
        queuePosition: 0,
        retryCount
      });

      throw error;
    }
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
      retryCount: 0
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
    isRetrying: state.retryCount > 0 && state.loading,
    canRetry: !state.loading && state.error !== null,
    progress: {
      queuePosition: state.queuePosition,
      isQueued: state.queuePosition > 0,
      isProcessing: state.loading && state.queuePosition === 0,
      retryCount: state.retryCount,
      maxRetries: 5
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
      // Use apiRequest for each batch item since we're using the config API
      const results = await Promise.all(
        demoDataArray.map(async (demoData) => {
          const response = await apiRequest('POST', '/api/demo/generate', demoData);
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