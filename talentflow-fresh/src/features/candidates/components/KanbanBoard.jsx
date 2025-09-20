import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {stages.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            title={CANDIDATE_STAGE_LABELS[stage]}
            candidates={candidatesByStage[stage] || []}
            jobs={jobs}
            onStageChange={onStageChange}
            onEdit={onEdit}
            onDelete={onDelete}
            loading={loading}
          />
        ))}
      </div>
    </DndProvider>
  );
};