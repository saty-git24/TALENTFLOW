import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn.jsx';
import { CandidateCard } from './CandidateCard.jsx';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS } from '../../../utils/constants.js';
import { isValidStageTransition } from '../../../utils/helpers.js';

export const KanbanBoard = ({
  candidatesByStage = {},
  jobs = {},
  onStageChange,
  onDelete,
  loading = false
}) => {
  const [activeCandidate, setActiveCandidate] = React.useState(null);
  const stages = Object.values(CANDIDATE_STAGES);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const candidateId = active.id;
    
    // Find the candidate being dragged
    let draggedCandidate = null;
    for (const stage of stages) {
      const candidate = candidatesByStage[stage]?.find(c => c.id === candidateId);
      if (candidate) {
        draggedCandidate = candidate;
        break;
      }
    }
    
    setActiveCandidate(draggedCandidate);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id;
    const newStage = over.id;

    // Find current stage of the candidate
    let currentStage = null;
    for (const stage of stages) {
      if (candidatesByStage[stage]?.some(c => c.id === candidateId)) {
        currentStage = stage;
        break;
      }
    }

    // If dropped in the same stage, do nothing
    if (currentStage === newStage) return;

    // Validate stage transition
    if (!isValidStageTransition(currentStage, newStage)) {
      alert(`Invalid transition from ${CANDIDATE_STAGE_LABELS[currentStage]} to ${CANDIDATE_STAGE_LABELS[newStage]}`);
      return;
    }

    // Call the onStageChange function
    onStageChange(candidateId, newStage);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {stages.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            title={CANDIDATE_STAGE_LABELS[stage]}
            candidates={candidatesByStage[stage] || []}
            jobs={jobs}
            onStageChange={onStageChange}
            onDelete={onDelete}
            loading={loading}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeCandidate ? (
          <div className="transform rotate-3 scale-105 shadow-2xl">
            <CandidateCard
              candidate={activeCandidate}
              job={jobs[activeCandidate.jobId]}
              onDelete={() => {}}
              onStageChange={() => {}}
              compact={true}
              draggable={false}
              showJobTitle={true}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};