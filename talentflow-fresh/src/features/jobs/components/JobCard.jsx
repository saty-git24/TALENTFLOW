import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MoreVertical, 
  MapPin, 
  Calendar, 
  Users, 
  Archive, 
  ArchiveRestore,
  Edit,
  Trash2,
  GripVertical
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { formatDate, formatRelativeTime, truncateText, cn } from '../../../utils/helpers.js';
import { useDrag, useDrop } from 'react-dnd';
import { DRAG_TYPES } from '../../../utils/constants.js';

export const JobCard = ({
  job,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  candidateCount = 0,
  isDragging,
  onDragStart,
  onDrop,
  canReorder = false
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const cardRef = React.useRef(null);

  // Drag and drop functionality
  const [{ isDragged }, drag, dragPreview] = useDrag(() => ({
    type: DRAG_TYPES.JOB,
    item: { ...job },
    canDrag: canReorder,
    collect: (monitor) => ({
      isDragged: monitor.isDragging(),
    }),
  }), [job, canReorder]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: DRAG_TYPES.JOB,
    drop: (item) => {
      if (onDrop && item.id !== job.id) {
        onDrop(job);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [job, onDrop]);

  // Combine drag and drop refs
  React.useEffect(() => {
    if (canReorder) {
      drag(drop(cardRef));
      dragPreview(cardRef);
    }
  }, [drag, drop, dragPreview, canReorder]);

  const isArchived = job.status === 'archived';
  
  return (
    <Card
      ref={cardRef}
      className={cn(
        'transition-all duration-200 hover:shadow-md relative',
        isDragged && 'opacity-50 rotate-2',
        isOver && 'ring-2 ring-primary-300 ring-offset-2',
        isArchived && 'opacity-75'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              {canReorder && (
                <div className="drag-handle cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
              )}
              
              <Link 
                to={`/jobs/${job.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                {job.title}
              </Link>
              
              <Badge 
                variant={isArchived ? 'secondary' : 'success'}
                size="sm"
              >
                {isArchived ? 'Archived' : 'Active'}
              </Badge>
            </div>

            {/* Description */}
            {job.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {truncateText(job.description, 120)}
              </p>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {job.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{job.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Meta information */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {job.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              )}
              
              {job.department && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {job.department}
                </span>
              )}
              
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{candidateCount} candidate{candidateCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Salary range */}
            {job.salary && (job.salary.min || job.salary.max) && (
              <div className="mt-2 text-sm font-medium text-gray-900">
                {job.salary.min && job.salary.max ? (
                  `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                ) : job.salary.min ? (
                  `From $${job.salary.min.toLocaleString()}`
                ) : (
                  `Up to $${job.salary.max.toLocaleString()}`
                )}
                {job.salary.currency !== 'USD' && ` ${job.salary.currency}`}
              </div>
            )}

            {/* Dates */}
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Created {formatRelativeTime(job.createdAt)}</span>
              </div>
              
              {job.updatedAt && job.updatedAt !== job.createdAt && (
                <span>Updated {formatRelativeTime(job.updatedAt)}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className={cn(
                'transition-opacity',
                showActions ? 'opacity-100' : 'opacity-0'
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {/* Actions dropdown */}
            {showActions && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => onEdit(job)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </button>
                
                {isArchived ? (
                  <button
                    onClick={() => onUnarchive(job.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={() => onArchive(job.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </button>
                )}
                
                <hr className="my-1" />
                
                <button
                  onClick={() => onDelete(job.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};