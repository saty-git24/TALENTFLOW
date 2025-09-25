import React from 'react';
import { Link } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { 
  Briefcase, 
  Calendar,
  MoreVertical,
  Trash2,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { formatRelativeTime, cn } from '../../../utils/helpers.js';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS, CANDIDATE_STAGE_COLORS } from '../../../utils/constants.js';
import { CandidateTimeline } from './CandidateTimeline.jsx';
import { candidatesApi } from '../../../api/candidates.js';
import { useApi } from '../../../hooks/useApi.js';

export const CandidateCard = ({
  candidate,
  job,
  onDelete,
  onStageChange,
  compact = false,
  draggable = false,
  showJobTitle = true,
  viewMode = 'grid',
  index = 0,
  isDragging = false
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [timeline, setTimeline] = React.useState([]);
  const [timelineLoading, setTimelineLoading] = React.useState(false);

  const stageColorClass = CANDIDATE_STAGE_COLORS[candidate.stage] || 'bg-gray-100 text-gray-800';
  const isListView = viewMode === 'list';
  const { makeRequest } = useApi();

  // Load timeline data for list view only
  React.useEffect(() => {
    if (isListView && !compact) {
      const loadTimeline = async () => {
        try {
          setTimelineLoading(true);
          const timelineResponse = await makeRequest(() => 
            candidatesApi.getCandidateTimeline(candidate.id)
          );
          
          if (timelineResponse.success) {
            setTimeline(timelineResponse.data || []);
          }
        } catch (error) {
        } finally {
          setTimelineLoading(false);
        }
      };

      loadTimeline();
    }
  }, [candidate.id, isListView, compact, makeRequest]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: candidate.id,
    data: {
      type: 'candidate',
      candidate,
    },
    disabled: !draggable || isListView,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleStageChange = (newStage) => {
    if (onStageChange) {
      onStageChange(candidate.id, newStage);
    }
  };

  return (
    <Card
      ref={draggable ? setNodeRef : null}
      style={style}
      className={cn(
        'relative transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        'hover:shadow-md',
        isDragging && 'opacity-50',
        compact && 'shadow-sm',
        isListView && 'w-full',
        !isListView && 'h-full'
      )}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
    >
      <CardContent className={cn(compact ? 'p-3 pt-6 pb-5' : 'p-4 pt-7 pb-6')}>
        {/* More actions button - Positioned at extreme top right */}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions((prev) => !prev);
            }}
            className={cn(
              "h-8 w-8 p-0 text-gray-700 dark:text-gray-200 transition-all duration-150 rounded-md flex items-center justify-center font-bold text-lg leading-none focus:outline-none focus:ring-2 focus:ring-blue-400",
              "hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-900 dark:hover:text-white",
              showActions ? "bg-blue-600 text-white border border-blue-600 shadow" : "bg-transparent"
            )}
          >
            ⋮
          </Button>

          {/* Actions dropdown */}
          {showActions && (
            <>
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowActions(false)}
                aria-label="Close actions menu"
              />
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                <Link 
                  to={`/candidates/${candidate.id}`}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setShowActions(false)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Profile
                </Link>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={() => { setShowActions(false); onDelete(candidate.id); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        {isListView ? (
          /* List View Layout */
          <div className="flex items-center justify-between">
            {/* Left Content */}
            <div className="flex-1 min-w-0 pr-6">
              {/* Header */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center space-x-2 flex-1 min-w-0 pr-8">
                  <Link 
                    to={`/candidates/${candidate.id}`}
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate text-lg"
                  >
                    {candidate.name}
                  </Link>
                  
                  <Badge 
                    className={cn('text-xs', stageColorClass)}
                    size="sm"
                  >
                    {CANDIDATE_STAGE_LABELS[candidate.stage]}
                  </Badge>
                </div>
              </div>

              {/* Job and Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  {showJobTitle && job && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400 truncate"
                      >
                        {job.title}
                      </Link>
                    </div>
                  )}

                  {candidate.experience && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {candidate.experience} experience
                    </div>
                  )}
                  
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="secondary" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="secondary" size="sm">
                          +{candidate.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Applied {formatRelativeTime(candidate.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Timeline */}
            <div className="flex-shrink-0 w-80 flex items-center">
              <div className="w-full">
                <div className="flex items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Progress Timeline
                  </h4>
                </div>
                
                {timelineLoading ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded flex-1 animate-pulse"></div>
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded flex-1 animate-pulse"></div>
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <CandidateTimeline 
                    currentStage={candidate.stage} 
                    timeline={timeline}
                    compact={true}
                    showLabels={true}
                    showDates={false}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid View Layout */
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0 pr-8">
                <Link 
                  to={`/candidates/${candidate.id}`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate text-lg"
                >
                  {candidate.name}
                </Link>
                
                <Badge 
                  className={cn('text-xs', stageColorClass)}
                  size="sm"
                >
                  {CANDIDATE_STAGE_LABELS[candidate.stage]}
                </Badge>
              </div>
            </div>

            {/* (Contact info removed; visible on candidate detail page) */}

            {/* Job Info */}
            {showJobTitle && job && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <Link 
                  to={`/jobs/${job.id}`}
                  className="hover:text-primary-600 dark:hover:text-primary-400 truncate"
                >
                  {job.title}
                </Link>
              </div>
            )}

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {candidate.skills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="secondary" size="sm">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{candidate.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Applied {formatRelativeTime(candidate.createdAt)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};