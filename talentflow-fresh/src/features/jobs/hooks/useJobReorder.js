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
    if (!draggedJob || !targetJob || draggedJob.id === targetJob.id) {
      setDraggedJob(null);
      return;
    }

    const draggedIndex = jobs.findIndex(job => job.id === draggedJob.id);
    const targetIndex = jobs.findIndex(job => job.id === targetJob.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedJob(null);
      return;
    }

    // Create optimistic update
    const newOrder = [...jobs];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    // Update order property for each job
    const reorderedJobs = newOrder.map((job, index) => ({
      ...job,
      order: index + 1
    }));

    const originalOrder = jobs;
    
    // Apply optimistic update
    setOptimisticOrder(reorderedJobs);
    reorderJobs(reorderedJobs);

    try {
      // Make API call to persist the new order
      await jobsApi.reorderJobs(draggedJob.id, {
        fromOrder: draggedJob.order || draggedIndex + 1,
        toOrder: targetJob.order || targetIndex + 1,
        newOrder: reorderedJobs.map(job => ({ id: job.id, order: job.order }))
      });
      
      console.log('Jobs reordered successfully');
    } catch (error) {
      // Rollback on failure
      console.error('Failed to reorder jobs:', error);
      reorderJobs(originalOrder);
      
      // Show user-friendly error
      if (typeof window !== 'undefined') {
        window.alert('Failed to save job order. Changes have been reverted.');
      }
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