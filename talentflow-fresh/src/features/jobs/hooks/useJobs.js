import { useState, useEffect, useCallback } from 'react';
import { useJobsStore } from '../../../store/jobsStore.js';
import { jobsApi } from '../../../api/jobs.js';

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

  const [initialLoad, setInitialLoad] = useState(true);

  // Load jobs with current filters and pagination
  const loadJobs = useCallback(async (overrideFilters = {}) => {
    const params = {
      ...filters,
      ...overrideFilters,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };

    setLoading(true);
    clearError(); // Clear error at the start of fetch
    try {
      const data = await jobsApi.getJobs(params);
      setJobs(data.jobs);
      setPagination(data.pagination);
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      const body = error?.body;
      const msg = typeof body === 'string' ? body : (body && (body.error || body.message)) || error.message || 'Failed to load jobs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.pageSize, setJobs, setPagination, setError, setLoading, clearError, initialLoad]);

  // Create new job
  const createJob = useCallback(async (jobData) => {
    setLoading(true);
    try {
  const data = await jobsApi.createJob(jobData);
  // If API returned job object, add to store
  if (data?.job) addJob(data.job);
      // Reload to get updated pagination
      await loadJobs();
    } catch (error) {
      const body = error?.body;
      const msg = typeof body === 'string' ? body : (body && (body.error || body.message)) || error.message || 'Failed to create job';
      setError(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addJob, loadJobs, setError, setLoading]);

  // Update existing job
  const updateJobById = useCallback(async (id, updates) => {
    setLoading(true);
    try {
  const data = await jobsApi.updateJob(id, updates);
  if (data?.job) updateJob(Number(id), data.job);
      // Refresh list to ensure any list-level state (pagination/filters) is consistent
      await loadJobs();
    } catch (error) {
      const body = error?.body;
      const msg = typeof body === 'string' ? body : (body && (body.error || body.message)) || error.message || 'Failed to update job';
      setError(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateJob, setError, setLoading]);

  // Archive job
  const archiveJob = useCallback(async (id) => {
    return updateJobById(id, { status: 'archived' });
  }, [updateJobById]);

  // Unarchive job
  const unarchiveJob = useCallback(async (id) => {
    return updateJobById(id, { status: 'active' });
  }, [updateJobById]);

  // Delete job
  const deleteJob = useCallback(async (id) => {
    setLoading(true);
    try {
  await jobsApi.deleteJob(id);
  removeJob(Number(id));
      // Reload to get updated pagination
      await loadJobs();
    } catch (error) {
      const body = error?.body;
      const msg = typeof body === 'string' ? body : (body && (body.error || body.message)) || error.message || 'Failed to delete job';
      setError(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [removeJob, loadJobs, setError, setLoading]);

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

  // Reorder jobs
  const reorderJobs = useCallback(async (sourceIndex, destinationIndex) => {
    if (sourceIndex === destinationIndex) return;
    
    // Optimistically update local state
    const newJobs = Array.from(jobs);
    const [movedJob] = newJobs.splice(sourceIndex, 1);
    newJobs.splice(destinationIndex, 0, movedJob);
    setJobs(newJobs);

    try {
      // Call API to persist the reorder
      await jobsApi.reorderJobs(movedJob.id, {
        fromOrder: sourceIndex,
        toOrder: destinationIndex
      });
    } catch (error) {
      // Revert on error
      setJobs(jobs);
      const body = error?.body;
      const msg = typeof body === 'string' ? body : (body && (body.error || body.message)) || error.message || 'Failed to reorder jobs';
      setError(msg);
      throw error;
    }
  }, [jobs, setJobs, setError]);

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
    reorderJobs,
    
    // Utilities
    refetch: loadJobs
  };
};