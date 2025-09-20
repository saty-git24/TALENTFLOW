import React from 'react';
import { Link } from 'react-router-dom';
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
import { useDrag } from 'react-dnd';
import { DRAG_TYPES } from '../../../utils/constants.js';

export const CandidateCard = ({
  candidate,
  job,
  onEdit,
  onDelete,
  onStageChange,
  compact = false,
  draggable = false,
  showJobTitle = true
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const cardRef = React.useRef(null);

  // Drag functionality for Kanban board
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPES.CANDIDATE,
    item: { ...candidate },
    canDrag: draggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [candidate, draggable]);

  React.useEffect(() => {
    if (draggable) {
      drag(cardRef);
    }
  }, [drag, draggable]);

  const handleStageChange = (newStage) => {
    if (newStage !== candidate.stage) {
      onStageChange?.(candidate.id, newStage);
    }
  };

  const stageColorClass = CANDIDATE_STAGE_COLORS[candidate.stage] || 'bg-gray-100 text-gray-800';

  return (
    <Card
      ref={cardRef}
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        isDragging && 'opacity-50 rotate-2',
        compact ? 'p-3' : 'p-4'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className={cn(compact ? 'p-0' : 'p-0')}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                to={`/candidates/${candidate.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate"
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

            {/* Contact Info */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a 
                  href={`mailto:${candidate.email}`}
                  className="hover:text-primary-600 truncate"
                >
                  {candidate.email}
                </a>
              </div>
              
              {candidate.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a 
                    href={`tel:${candidate.phone}`}
                    className="hover:text-primary-600"
                  >
                    {candidate.phone}
                  </a>
                </div>
              )}
              
              {candidate.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{candidate.location}</span>
                </div>
              )}
            </div>

            {/* Job Title */}
            {showJobTitle && job && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <Link 
                  to={`/jobs/${job.id}`}
                  className="hover:text-primary-600 truncate"
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
              <div className="text-sm text-gray-600 mb-2">
                {candidate.experience} years experience
              </div>
            )}

            {/* Resume */}
            {candidate.resume && (
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                <FileText className="w-4 h-4" />
                <span className="truncate">{candidate.resume}</span>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Applied {formatRelativeTime(candidate.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end space-y-2 ml-4">
            {/* Stage selector (always visible in compact mode) */}
            {(compact || showActions) && (
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
                onClick={() => setShowActions(!showActions)}
                className={cn(
                  'transition-opacity',
                  showActions || compact ? 'opacity-100' : 'opacity-0'
                )}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {/* Actions dropdown */}
              {showActions && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => onEdit(candidate)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Candidate
                  </button>
                  
                  <Link 
                    to={`/candidates/${candidate.id}`}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={() => onDelete(candidate.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};