import React from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS } from '../../../utils/constants.js';
import { formatRelativeTime } from '../../../utils/helpers.js';

export const TimelineStats = ({ candidate, timeline = [] }) => {
  // Calculate time in current stage
  const getCurrentStageEntry = () => {
    return timeline
      .filter(entry => entry.stage === candidate.stage)
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))[0];
  };

  // Calculate total time in process
  const getProcessDuration = () => {
    const firstEntry = timeline
      .filter(entry => entry.stage === CANDIDATE_STAGES.APPLIED)
      .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))[0];
    
    if (!firstEntry) return null;
    
    const startDate = new Date(firstEntry.changedAt);
    const endDate = new Date();
    const diffDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get stage counts
  const getStageStats = () => {
    const stages = timeline.reduce((acc, entry) => {
      acc[entry.stage] = (acc[entry.stage] || 0) + 1;
      return acc;
    }, {});

    return stages;
  };

  const currentStageEntry = getCurrentStageEntry();
  const processDuration = getProcessDuration();
  const stageStats = getStageStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Stage Duration */}
      {currentStageEntry && (
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Stage</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {formatRelativeTime(currentStageEntry.changedAt)}
            </p>
          </div>
        </div>
      )}

      {/* Total Process Duration */}
      {processDuration !== null && (
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Duration</p>
            <p className="text-sm font-semibold text-gray-900">
              {processDuration === 0 
                ? 'Applied today' 
                : `${processDuration} day${processDuration !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
      )}

      {/* Stage Progress Indicator */}
      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
        {candidate.stage === CANDIDATE_STAGES.HIRED && (
          <>
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <p className="text-sm font-semibold text-green-600">Successfully hired</p>
            </div>
          </>
        )}
        {candidate.stage === CANDIDATE_STAGES.REJECTED && (
          <>
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <p className="text-sm font-semibold text-red-600">Process ended</p>
            </div>
          </>
        )}
        {![CANDIDATE_STAGES.HIRED, CANDIDATE_STAGES.REJECTED].includes(candidate.stage) && (
          <>
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <p className="text-sm font-semibold text-blue-600">In progress</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};