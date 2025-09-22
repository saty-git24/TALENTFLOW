import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { JobCard } from './JobCard.jsx';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.jsx';

export const JobsList = ({
  jobs = [],
  loading = false,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  candidateCounts = {},
  enableReorder = false,
  viewMode = 'grid',
  onReorder
}) => {
  // Handle drag end for react-beautiful-dnd
  const handleDragEndBeautiful = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;

    // Call the reorder function with the indices
    onReorder?.(source.index, destination.index);
  };

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

  const JobsContainer = () => (
    <Droppable droppableId="jobs-list">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
          }
        >
          {jobs.map((job, index) => (
            <Draggable
              key={job.id}
              draggableId={job.id.toString()}
              index={index}
              isDragDisabled={!enableReorder}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={{
                    ...provided.draggableProps.style,
                    transform: snapshot.isDragging 
                      ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                      : provided.draggableProps.style?.transform
                  }}
                >
                  <JobCard
                    job={job}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                    candidateCount={candidateCounts[job.id] || 0}
                    canReorder={enableReorder}
                    viewMode={viewMode}
                    isDragging={snapshot.isDragging}
                    dragHandleProps={provided.dragHandleProps}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEndBeautiful}>
      <JobsContainer />
      {loading && (
        <div className="flex justify-center mt-4">
          <LoadingSpinner />
        </div>
      )}
    </DragDropContext>
  );
};