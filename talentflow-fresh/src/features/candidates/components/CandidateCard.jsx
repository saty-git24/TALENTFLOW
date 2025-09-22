import React from 'react';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { formatRelativeTime, cn } from '../../../utils/helpers.js';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS, CANDIDATE_STAGE_COLORS } from '../../../utils/constants.js';

export const CandidateCard = ({
  candidate,
  job,
  onEdit,
  onDelete,
  onStageChange,
  compact = false,
  draggable = false,
  showJobTitle = true,
  viewMode = 'grid',
  index = 0
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const handleStageChange = (newStage) => {
    if (newStage !== candidate.stage) {
      onStageChange?.(candidate.id, newStage);
    }
  };

  const stageColorClass = CANDIDATE_STAGE_COLORS[candidate.stage] || 'bg-gray-100 text-gray-800';
  const isListView = viewMode === 'list';

  const CardComponent = ({ isDragging = false, dragHandleProps = {}, innerRef = null }) => (
    <Card
      ref={innerRef}
      {...dragHandleProps}
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        isDragging && 'opacity-70 transform rotate-2 scale-105 z-50 shadow-xl',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <CardContent className={cn(compact ? 'p-4' : 'p-6')}>
        <div className={cn(
          'flex items-start justify-between',
          isListView && compact ? 'flex-row' : 'flex-col sm:flex-row'
        )}>
          <div className={cn(
            'flex-1 min-w-0',
            isListView && compact ? 'flex flex-row items-center gap-4' : 'flex-col'
          )}>
            {/* Header */}
            <div className={cn(
              'flex items-center space-x-2',
              isListView && compact ? 'mb-0 min-w-0 flex-shrink-0' : 'mb-2'
            )}>
              <Link 
                to={`/candidates/${candidate.id}`}
                className={cn(
                  'font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate',
                  isListView && compact ? 'text-sm' : 'text-lg'
                )}
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

            {isListView && compact ? (
              /* List View Layout - Horizontal */
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                {/* Column 1: Contact Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <a 
                      href={`mailto:${candidate.email}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400 truncate"
                    >
                      {candidate.email}
                    </a>
                  </div>
                  
                  {candidate.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{candidate.location}</span>
                    </div>
                  )}
                </div>

                {/* Column 2: Job and Skills */}
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
                  
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 2).map(skill => (
                        <Badge key={skill} variant="secondary" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 2 && (
                        <Badge variant="secondary" size="sm">
                          +{candidate.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Column 3: Date */}
                <div className="text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Applied {formatRelativeTime(candidate.createdAt)}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Grid View Layout - Vertical */
              <>
                {/* Contact Info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <a 
                      href={`mailto:${candidate.email}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400 truncate"
                    >
                      {candidate.email}
                    </a>
                  </div>
                  
                  {candidate.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <a 
                        href={`tel:${candidate.phone}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {candidate.phone}
                      </a>
                    </div>
                  )}
                  
                  {candidate.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{candidate.location}</span>
                    </div>
                  )}
                </div>

                {/* Job Title */}
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
                {candidate.skills && candidate.skills.length > 0 && !compact && (
                  <div className="flex flex-wrap gap-1 mb-2">
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

                {/* Experience */}
                {candidate.experience && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {candidate.experience} years experience
                  </div>
                )}

                {/* Resume */}
                {candidate.resume && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{candidate.resume}</span>
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Applied {formatRelativeTime(candidate.createdAt)}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            'flex flex-col items-end space-y-2',
            isListView && compact ? 'ml-4 flex-shrink-0' : 'ml-4'
          )}>
            {/* Stage selector (always visible in compact mode) */}
            {compact && (
              <Select
                value={candidate.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="text-xs min-w-0"
                size="sm"
              >
                {Object.entries(CANDIDATE_STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}

            {/* More actions */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions((prev) => !prev);
                }}
                className={cn(
                  'transition-opacity',
                  'opacity-100'
                )}
              >
                <MoreVertical className="w-4 h-4" />
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
                    <button
                      onClick={() => { setShowActions(false); onEdit(candidate); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Candidate
                    </button>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // If draggable, wrap in Draggable component
  if (draggable) {
    return (
      <Draggable
        draggableId={candidate.id.toString()}
        index={index}
        isDragDisabled={!draggable}
      >
        {(provided, snapshot) => (
          <CardComponent
            isDragging={snapshot.isDragging}
            dragHandleProps={provided.dragHandleProps}
            innerRef={provided.innerRef}
            {...provided.draggableProps}
          />
        )}
      </Draggable>
    );
  }

  // Otherwise, render card directly
  return <CardComponent />;
};