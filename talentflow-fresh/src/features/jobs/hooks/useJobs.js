import { useState, useEffect, useCallback } from 'react';
import { useJobsStore } from '../../../store/jobsStore.js';
import { jobsApi } from '../../../api/jobs.js';
import { useApi } from '../../../hooks/useApi.js';

export const useJobs = (initialFilters = {}) => {
  const {
    jobs,
    filters,
    pagination,
    loading,
    error,
    setJobs,
    setFilters,
    setPagination,
    setLoading,
    setError,
    clearError,
    addJob,
    updateJob,
    removeJob
  } = useJobsStore();

  const { makeRequest } = useApi();
  const [initialLoad, setInitialLoad] = useState(true);

  // Load jobs with current filters and pagination
  const loadJobs = useCallback(async (overrideFilters = {}) => {
    const params = {
      ...filters,
      ...overrideFilters,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };

    await makeRequest(
      () => jobsApi.getJobs(params),
      {
        onSuccess: (response) => {
          setJobs(response.jobs);
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
  }, [filters, pagination.currentPage, pagination.pageSize, makeRequest, setJobs, setPagination, setError, initialLoad]);

  // Create new job
  const createJob = useCallback(async (jobData) => {
    return makeRequest(
      () => jobsApi.createJob(jobData),
      {
        onSuccess: (response) => {
          addJob(response.job);
          // Reload to get updated pagination
          loadJobs();
        }
      }
    );
  }, [makeRequest, addJob, loadJobs]);

  // Update existing job
  const updateJobById = useCallback(async (id, updates) => {
    return makeRequest(
      () => jobsApi.updateJob(id, updates),
      {
        onSuccess: (response) => {
          updateJob(id, response.job);
        }
      }
    );
  }, [makeRequest, updateJob]);

  // Archive job
  const archiveJob = useCallback(async (id) => {
    return makeRequest(
      () => jobsApi.archiveJob(id),
      {
        onSuccess: (response) => {
          updateJob(id, response.job);
        }
      }
    );
  }, [makeRequest, updateJob]);

  // Unarchive job
  const unarchiveJob = useCallback(async (id) => {
    return makeRequest(
      () => jobsApi.unarchiveJob(id),
      {
        onSuccess: (response) => {
          updateJob(id, response.job);
        }
      }
    );
  }, [makeRequest, updateJob]);

  // Delete job
  const deleteJob = useCallback(async (id) => {
    return makeRequest(
      () => jobsApi.deleteJob(id),
      {
        onSuccess: () => {
          removeJob(id);
          // Reload to get updated pagination
          loadJobs();
        }
      }
    );
  }, [makeRequest, removeJob, loadJobs]);

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
    setFilters({ search: '', status: '', tags: [] });
    setPagination({ currentPage: 1 });
  }, [setFilters, setPagination]);

  // Load jobs when filters or pagination change
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Set initial filters
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters, setFilters]);

  return {
    // State
    jobs,
    filters,
    pagination,
    loading,
    error,
    initialLoad,
    
    // Actions
    loadJobs,
    createJob,
    updateJob: updateJobById,
    archiveJob,
    unarchiveJob,
    deleteJob,
    updateFilters,
    updatePagination,
    clearFilters,
    clearError,
    
    // Utilities
    refetch: loadJobs
  };
};