import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { cn, formatDate } from '../../../utils/helpers.js';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS, HIRING_PROCESS_ORDER } from '../../../utils/constants.js';

export const CandidateTimeline = ({ 
  currentStage, 
  timeline = [],
  compact = false, 
  className = "",
  showLabels = true,
  showDates = false 
}) => {
  // Get date for a specific stage from timeline
  const getStageDate = (stage) => {
    const stageEntry = timeline.find(entry => entry.stage === stage);
    return stageEntry ? stageEntry.changedAt : null;
  };

  const getStageStatus = (stage) => {
    const currentIndex = HIRING_PROCESS_ORDER.indexOf(currentStage);
    const stageIndex = HIRING_PROCESS_ORDER.indexOf(stage);
    
    // Handle rejected state
    if (currentStage === CANDIDATE_STAGES.REJECTED) {
      return stage === CANDIDATE_STAGES.REJECTED ? 'current' : 'pending';
    }
    
    // Handle hired state
    if (currentStage === CANDIDATE_STAGES.HIRED) {
      if (stage === CANDIDATE_STAGES.HIRED) return 'current';
      return stageIndex < HIRING_PROCESS_ORDER.length - 1 ? 'completed' : 'pending';
    }
    
    // Normal progression
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStageIcon = (stage, status) => {
    if (stage === CANDIDATE_STAGES.REJECTED) {
      return <X className="w-4 h-4 drop-shadow-sm" strokeWidth={2.5} />;
    }
    
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 drop-shadow-sm" strokeWidth={3} />;
      case 'current':
        return <Clock className="w-4 h-4 drop-shadow-sm" strokeWidth={2.5} />;
      default:
        return <div className="w-2 h-2 rounded-full bg-current shadow-sm" />;
    }
  };

  const getStageColors = (status) => {
    switch (status) {
      case 'completed':
        return 'text-white bg-green-500 ring-2 ring-green-100';
      case 'current':
        return 'text-white bg-blue-500 ring-2 ring-blue-100 shadow-sm';
      case 'rejected':
        return 'text-white bg-red-500 ring-2 ring-red-100';
      default:
        return 'text-gray-400 bg-gray-100 border border-gray-200';
    }
  };

  const stages = currentStage === CANDIDATE_STAGES.REJECTED 
    ? [...HIRING_PROCESS_ORDER, CANDIDATE_STAGES.REJECTED]
    : HIRING_PROCESS_ORDER;

  if (compact) {
    // Enhanced compact timeline for kanban cards
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex items-center space-x-1.5">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage);
            const isLast = index === stages.length - 1;
            
            return (
              <React.Fragment key={stage}>
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-200 border",
                    getStageColors(status),
                    status === 'completed' ? 'border-green-300 shadow-sm' :
                    status === 'current' ? 'border-blue-300 shadow-sm ring-2 ring-blue-100' :
                    status === 'rejected' ? 'border-red-300' : 'border-gray-300'
                  )}
                  title={CANDIDATE_STAGE_LABELS[stage]}
                >
                  {getStageIcon(stage, status)}
                </div>
                {!isLast && (
                  <div 
                    className={cn(
                      "h-0.5 w-2 transition-all duration-300",
                      status === 'completed' ? 'bg-green-400' : 'bg-gray-300'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Full timeline with labels and compact styling
  return (
    <div className={cn("space-y-2", className)}>
      {stages.map((stage, index) => {
        const status = getStageStatus(stage);
        const isLast = index === stages.length - 1;
        const stageDate = getStageDate(stage);
        
        return (
          <div key={stage} className="flex items-start space-x-3">
            <div className="flex flex-col items-center pt-0.5">
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-200 shadow-sm",
                  getStageColors(status)
                )}
              >
                {getStageIcon(stage, status)}
              </div>
              {!isLast && (
                <div 
                  className={cn(
                    "w-0.5 h-4 mt-1 transition-all duration-300",
                    status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            {showLabels && (
              <div className="flex-1 pb-1">
                <div className={cn(
                  "text-sm font-semibold transition-colors leading-tight",
                  status === 'current' ? 'text-blue-600' :
                  status === 'completed' ? 'text-green-600' :
                  status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                )}>
                  {CANDIDATE_STAGE_LABELS[stage]}
                </div>
                {showDates && (
                  <div className={cn(
                    "text-xs mt-0.5 font-medium",
                    status === 'current' ? 'text-blue-500' :
                    status === 'completed' ? 'text-green-500' :
                    status === 'rejected' ? 'text-red-500' : 'text-gray-400'
                  )}>
                    {stageDate ? formatDate(stageDate) : 
                     status === 'pending' ? 'Not reached' : 
                     status === 'current' ? 'In progress' : ''}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};