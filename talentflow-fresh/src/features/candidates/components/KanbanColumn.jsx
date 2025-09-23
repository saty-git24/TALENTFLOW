import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CandidateCard } from './CandidateCard.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.jsx';
import { cn } from '../../../utils/helpers.js';
import { CANDIDATE_STAGE_COLORS } from '../../../utils/constants.js';

export const KanbanColumn = ({
  stage,
  title,
  candidates = [],
  jobs = {},
  onStageChange,
  onDelete,
  loading = false
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  });

  const stageColorClass = CANDIDATE_STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-column flex-shrink-0 w-80 min-h-96',
        isOver && 'bg-blue-50 border-blue-200 border-2 border-dashed rounded-lg'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge className={stageColorClass} size="sm">
          {candidates.length}
        </Badge>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mb-4 p-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-600 text-sm font-medium">Drop candidate here</p>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            job={jobs[candidate.jobId]}
            onDelete={onDelete}
            onStageChange={onStageChange}
            compact={true}
            draggable={true}
            showJobTitle={true}
            index={index}
          />
        ))}
        
        {candidates.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No candidates in this stage</p>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};