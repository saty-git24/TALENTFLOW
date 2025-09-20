import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { JobCard } from './JobCard.jsx';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.jsx';
import { useJobReorder } from '../hooks/useJobReorder.js';

export const JobsList = ({
  jobs = [],
  loading = false,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  candidateCounts = {},
  enableReorder = false
}) => {
  const {
    currentOrder,
    draggedJob,
    isDragging,
    handleDragStart,
    handleDrop,
    handleDragEnd
  } = useJobReorder();

  const jobsToRender = enableReorder ? currentOrder : jobs;

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No jobs found</div>
        <p className="text-gray-400">Try adjusting your search criteria or create a new job.</p>
      </div>
    );
  }

  const JobsGrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {jobsToRender.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
          candidateCount={candidateCounts[job.id] || 0}
          isDragging={isDragging(job.id)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          canReorder={enableReorder}
        />
      ))}
    </div>
  );

  if (enableReorder) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div onDragEnd={handleDragEnd}>
          <JobsGrid />
        </div>
        {loading && (
          <div className="flex justify-center mt-4">
            <LoadingSpinner />
          </div>
        )}
      </DndProvider>
    );
  }

  return (
    <>
      <JobsGrid />
      {loading && (
        <div className="flex justify-center mt-4">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
};