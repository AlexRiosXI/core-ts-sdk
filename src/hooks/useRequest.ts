import { useState, useEffect, useCallback, useRef } from 'react';
import { request } from '../core/request';
import { ApiResult, RequestConfig } from '../types';

/**
 * Hook for making HTTP GET requests with state management
 * Provides loading state, error handling, and data management
 * 
 * @param url - The URL to make the request to
 * @param options - Request configuration options
 * @param options.params - Query parameters for the request
 * @param options.config - Additional request configuration (timeout, headers, etc.)
 * @param options.enabled - Whether the request should be executed (default: true)
 * @param options.dependencies - Array of dependencies that trigger re-execution
 * @returns Object containing request state and data
 */
export function useRequest<T = any>(
  url: string | null,
  options?: {
    params?: Record<string, any>;
    config?: RequestConfig;
    enabled?: boolean;
    dependencies?: any[];
  }
) {
  // State management
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Main request function
  const executeRequest = useCallback(async () => {
    if (!url || options?.enabled === false) {
      return;
    }

    // Reset state
    setIsLoading(true);
    setError(null);
    setStatus(null);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const requestOptions: {
        params?: Record<string, any>;
        config?: RequestConfig;
      } = {};

      if (options?.params) {
        requestOptions.params = options.params;
      }

      if (options?.config) {
        requestOptions.config = {
          ...options.config,
          signal: abortControllerRef.current.signal,
        };
      } else {
        requestOptions.config = {
          signal: abortControllerRef.current.signal,
        };
      }

      const result = await request<T>(url, requestOptions);

      // Check if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      if (result.error) {
        setError(result.error.message);
        setStatus(result.error.status || null);
        setData(null);
      } else {
        setData(result.data);
        setError(null);
        setStatus(200); // Assuming success if no error
      }
    } catch (err: any) {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      // Handle abort errors separately
      if (err.name === 'AbortError') {
        return; // Don't set error for aborted requests
      }

      setError(err.message || 'An unexpected error occurred');
      setStatus(err.status || null);
      setData(null);
    } finally {
      // Check if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [url, options?.params, options?.config, options?.enabled]);

  // Execute request when dependencies change
  useEffect(() => {
    executeRequest();
  }, [executeRequest, ...(options?.dependencies || [])]);

  // Manual refetch function
  const refetch = useCallback(() => {
    executeRequest();
  }, [executeRequest]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    status,
    refetch,
    cancel,
  };
}

/**
 * Hook for making requests with automatic retry on failure
 * 
 * @param url - The URL to make the request to
 * @param options - Request configuration options
 * @param options.retryCount - Number of retry attempts (default: 3)
 * @param options.retryDelay - Delay between retries in ms (default: 1000)
 * @param options.retryCondition - Function to determine if retry should happen
 */
export function useRequestWithRetry<T = any>(
  url: string | null,
  options?: {
    params?: Record<string, any>;
    config?: RequestConfig;
    enabled?: boolean;
    dependencies?: any[];
    retryCount?: number;
    retryDelay?: number;
    retryCondition?: (error: any) => boolean;
  }
) {
  const [retryAttempt, setRetryAttempt] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data,
    error,
    isLoading,
    status,
    
    cancel,
  } = useRequest<T>(url, {
    ...options,
    dependencies: [...(options?.dependencies || []), retryAttempt],
  });

  // Enhanced refetch with retry logic
  const refetchWithRetry = useCallback(async () => {
    const maxRetries = options?.retryCount || 3;
    const delay = options?.retryDelay || 1000;
    const shouldRetry = options?.retryCondition || ((err: any) => err.status >= 500);

    if (error && retryAttempt < maxRetries && shouldRetry(error)) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Schedule retry
      retryTimeoutRef.current = setTimeout(() => {
        setRetryAttempt(prev => prev + 1);
      }, delay);
    }
  }, [error, retryAttempt, options?.retryCount, options?.retryDelay, options?.retryCondition]);

  // Enhanced cancel function
  const cancelWithCleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    cancel();
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    status,
    retryAttempt,
    refetch: refetchWithRetry,
    cancel: cancelWithCleanup,
  };
}

/**
 * Hook for making requests with optimistic updates
 * 
 * @param url - The URL to make the request to
 * @param options - Request configuration options
 * @param options.optimisticData - Data to show immediately while loading
 */
export function useRequestOptimistic<T = any>(
  url: string | null,
  options?: {
    params?: Record<string, any>;
    config?: RequestConfig;
    enabled?: boolean;
    dependencies?: any[];
    optimisticData?: T;
  }
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(options?.optimisticData || null);

  const {
    data,
    error,
    isLoading,
    status,
    refetch,
    cancel,
  } = useRequest<T>(url, options);

  // Show optimistic data while loading, fallback to actual data
  const displayData = isLoading && optimisticData ? optimisticData : data;

  // Update optimistic data
  const setOptimistic = useCallback((newData: T) => {
    setOptimisticData(newData);
  }, []);

  return {
    data: displayData,
    error,
    isLoading,
    status,
    refetch,
    cancel,
    setOptimistic,
    optimisticData,
  };
} 