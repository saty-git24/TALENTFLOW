
import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (requestFn, options = {}) => {
    const { onSuccess, onError, showErrorToast = true } = options;
    
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      // If the thrown error contains a server body (our parseResponse attaches it), prefer that
      const serverBody = err && (err.body || err.response || err.data);
      // Normalize serverBody to a user-friendly string
      let serverMsg = '';
      if (typeof serverBody === 'string' && serverBody.length > 0) {
        serverMsg = serverBody;
      } else if (serverBody && typeof serverBody === 'object') {
        serverMsg = serverBody.error || serverBody.message || JSON.stringify(serverBody);
      }

      const errorMessage = serverMsg || (err && err.message) || 'An unexpected error occurred';

      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      if (showErrorToast) {
        // Add slight delay to avoid showing errors before success updates
        setTimeout(() => {
          console.error('API Error:', err);
        }, 100);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    makeRequest,
    clearError
  };
};

export const useAsyncOperation = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (asyncFn, options = {}) => {
    const { onSuccess, onError } = options;
    
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
};