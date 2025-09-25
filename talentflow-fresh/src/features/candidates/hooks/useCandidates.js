import { useState, useEffect, useCallback } from 'react';
import { useCandidatesStore } from '../../../store/candidatesStore.js';
import { candidatesApi } from '../../../api/candidates.js';
import { useApi } from '../../../hooks/useApi.js';

export const useCandidates = (initialFilters = {}) => {
  const {
    candidates,
    filters,
    pagination,
    loading,
    error,
    setCandidates,
    setFilters,
    setPagination,
    setLoading,
    setError,
    clearError,
    addCandidate,
    updateCandidate,
    removeCandidate,
    moveCandidateStage
  } = useCandidatesStore();

  const { makeRequest } = useApi();
  const [initialLoad, setInitialLoad] = useState(true);

  // Load candidates with current filters and pagination
  const loadCandidates = useCallback(async (overrideFilters = {}) => {
    const params = {
      ...filters,
      ...overrideFilters,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };

    await makeRequest(
      () => candidatesApi.getCandidates(params),
      {
        onSuccess: (response) => {
          setCandidates(response.candidates);
          setPagination(response.pagination);
          if (initialLoad) {
            setInitialLoad(false);
          }
        },
        onError: (error) => {
          setError(error.message);
        }
      }
    );
  }, [filters, pagination.currentPage, pagination.pageSize, makeRequest, setCandidates, setPagination, setError, initialLoad]);

  // Create new candidate
  const createCandidate = useCallback(async (candidateData) => {
    return makeRequest(
      () => candidatesApi.createCandidate(candidateData),
      {
        onSuccess: (response) => {
          addCandidate(response.candidate);
          // Reload to get updated pagination
          loadCandidates();
        }
      }
    );
  }, [makeRequest, addCandidate, loadCandidates]);

  // Update existing candidate
  const updateCandidateById = useCallback(async (id, updates) => {
    return makeRequest(
      () => candidatesApi.updateCandidate(id, updates),
      {
        onSuccess: (response) => {
          updateCandidate(id, response.candidate);
        }
      }
    );
  }, [makeRequest, updateCandidate]);

  // Move candidate to different stage
  const moveCandidateToStage = useCallback(async (candidateId, newStage, changedBy = 'user') => {
    // Patch: Always update updatedAt to now when moving stage
    const updates = { stage: newStage, changedBy, updatedAt: new Date().toISOString() };
    return makeRequest(
      () => candidatesApi.updateCandidate(candidateId, updates),
      {
        onSuccess: (response) => {
          updateCandidate(candidateId, response.candidate);
        }
      }
    );
  }, [makeRequest, updateCandidate]);

  // Delete candidate
  const deleteCandidate = useCallback(async (id) => {
    return makeRequest(
      () => candidatesApi.deleteCandidate(id),
      {
        onSuccess: () => {
          removeCandidate(id);
          // Reload to get updated pagination
          loadCandidates();
        }
      }
    );
  }, [makeRequest, removeCandidate, loadCandidates]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination({ currentPage: 1 }); // Reset to first page when filtering
  }, [setFilters, setPagination]);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(newPagination);
  }, [setPagination]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ search: '', stage: '', jobId: '' });
    setPagination({ currentPage: 1 });
  }, [setFilters, setPagination]);

  // Load candidates when filters or pagination change
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Set initial filters
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters, setFilters]);

  return {
    // State
    candidates,
    filters,
    pagination,
    loading,
    error,
    initialLoad,
    
    // Actions
    loadCandidates,
    createCandidate,
    updateCandidate: updateCandidateById,
    moveCandidateToStage,
    deleteCandidate,
    updateFilters,
    updatePagination,
    clearFilters,
    clearError,
    
    // Utilities
    refetch: loadCandidates
  };
};