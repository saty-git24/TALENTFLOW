import React from 'react';
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
  onEdit,
  onDelete,
  loading = false,
  isOver = false,
  canDrop = true
}) => {
  const stageColorClass = CANDIDATE_STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className={cn(
        'kanban-column flex-shrink-0 w-80 min-h-96',
        isOver && canDrop && 'bg-blue-50 border-blue-200 border-2 border-dashed rounded-lg',
        isOver && !canDrop && 'bg-red-50 border-red-200 border-2 border-dashed rounded-lg'
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
      {isOver && canDrop && (
        <div className="mb-4 p-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-600 text-sm font-medium">Drop candidate here</p>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {candidates.map((candidate, index) => (
          <div key={candidate.id} className="kanban-card">
            <CandidateCard
              candidate={candidate}
              job={jobs[candidate.jobId]}
              onEdit={onEdit}
              onDelete={onDelete}
              onStageChange={onStageChange}
              compact={true}
              draggable={true}
              showJobTitle={true}
              index={index}
            />
          </div>
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