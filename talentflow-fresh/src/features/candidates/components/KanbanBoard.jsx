import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { KanbanColumn } from './KanbanColumn.jsx';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS } from '../../../utils/constants.js';

export const KanbanBoard = ({
  candidatesByStage = {},
  jobs = {},
  onStageChange,
  onEdit,
  onDelete,
  loading = false
}) => {
  const stages = Object.values(CANDIDATE_STAGES);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a valid destination, do nothing
    if (!destination) return;
    
    // If dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    // If dropped in a different column (stage change)
    if (destination.droppableId !== source.droppableId) {
      const candidateId = parseInt(draggableId, 10);
      const newStage = destination.droppableId;
      
      // Call the onStageChange function
      onStageChange(candidateId, newStage);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {stages.map(stage => (
          <Droppable key={stage} droppableId={stage}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-shrink-0"
              >
                <KanbanColumn
                  stage={stage}
                  title={CANDIDATE_STAGE_LABELS[stage]}
                  candidates={candidatesByStage[stage] || []}
                  jobs={jobs}
                  onStageChange={onStageChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  loading={loading}
                  isOver={snapshot.isDraggingOver}
                  canDrop={true}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};