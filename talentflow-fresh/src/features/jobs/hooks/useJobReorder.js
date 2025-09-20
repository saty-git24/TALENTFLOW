import { useState, useCallback } from 'react';
import { useJobsStore } from '../../../store/jobsStore.js';
import { jobsApi } from '../../../api/jobs.js';
import { reorderArray } from '../../../utils/helpers.js';

export const useJobReorder = () => {
  const { jobs, setJobs, reorderJobs } = useJobsStore();
  const [draggedJob, setDraggedJob] = useState(null);
  const [optimisticOrder, setOptimisticOrder] = useState(null);

  // Start dragging
  const handleDragStart = useCallback((job) => {
    setDraggedJob(job);
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (targetJob) => {
    if (!draggedJob || draggedJob.id === targetJob.id) {
      setDraggedJob(null);
      return;
    }

    const draggedIndex = jobs.findIndex(job => job.id === draggedJob.id);
    const targetIndex = jobs.findIndex(job => job.id === targetJob.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedJob(null);
      return;
    }

    // Optimistic update
    const newOrder = reorderArray(jobs, draggedIndex, targetIndex);
    const originalOrder = jobs;
    
    setOptimisticOrder(newOrder);
    reorderJobs(newOrder);

    try {
      // Make API call
      await jobsApi.reorderJobs(draggedJob.id, {
        fromOrder: draggedJob.order,
        toOrder: targetJob.order
      });
    } catch (error) {
      // Rollback on failure
      console.error('Failed to reorder jobs:', error);
      reorderJobs(originalOrder);
      
      // Show error notification
      // You might want to use a toast notification here
      alert('Failed to reorder jobs. Changes have been reverted.');
    } finally {
      setOptimisticOrder(null);
      setDraggedJob(null);
    }
  }, [draggedJob, jobs, reorderJobs]);

  // Cancel drag
  const handleDragEnd = useCallback(() => {
    setDraggedJob(null);
    if (optimisticOrder) {
      setOptimisticOrder(null);
    }
  }, [optimisticOrder]);

  // Check if item is being dragged
  const isDragging = useCallback((jobId) => {
    return draggedJob?.id === jobId;
  }, [draggedJob]);

  // Get current order (optimistic or actual)
  const currentOrder = optimisticOrder || jobs;

  return {
    currentOrder,
    draggedJob,
    isDragging,
    handleDragStart,
    handleDrop,
    handleDragEnd
  };
};