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

export const JobCard = ({
  job,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  candidateCount = 0,
  canReorder = false,
  viewMode = 'grid',
  isDragging = false,
  dragHandleProps
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const isArchived = job.status === 'archived';
  const isListView = viewMode === 'list';
  
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md relative',
        isDragging && 'opacity-70 transform rotate-2 scale-105 z-50 shadow-xl',
        isArchived && 'opacity-75',
        canReorder && 'cursor-move',
        isListView && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        isListView ? 'h-auto' : 'h-80 flex flex-col'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className={cn(
        isListView ? 'px-4 pt-3 pb-5' : 'px-6 pt-5 pb-8 flex-1 flex flex-col justify-between'
      )}>
        <div className={cn(
          'flex items-start justify-between',
          isListView ? 'flex-row' : 'flex-col sm:flex-row'
        )}>
          <div className={cn(
            'flex-1 min-w-0',
            isListView ? 'flex flex-col sm:flex-row sm:items-center sm:gap-6' : ''
          )}>
            {/* Header */}
            <div className={cn(
              'flex items-center space-x-2',
              isListView ? 'mb-0 sm:min-w-0 sm:flex-shrink-0' : 'mb-2'
            )}>
              {canReorder && (
                <div 
                  {...dragHandleProps}
                  className="drag-handle cursor-grab active:cursor-grabbing p-2 -ml-2 -mt-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                </div>
              )}
              
              <Link 
                to={`/jobs/${job.id}`}
                className={cn(
                  'font-semibold text-gray-900 hover:text-primary-600 transition-colors',
                  isListView ? 'text-base truncate' : 'text-lg'
                )}
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

            {/* Main content area - different layout for list vs grid */}
            {isListView ? (
              /* List View Layout - Horizontal */
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
                {/* Column 1: Basic Info */}
                <div className="space-y-1">
                  {job.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  )}
                  
                  {job.department && (
                    <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {job.department}
                    </span>
                  )}
                </div>

                {/* Column 2: Tags */}
                <div className="flex flex-wrap gap-1">
                  {job.tags && job.tags.length > 0 && (
                    <>
                      {job.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 2 && (
                        <Badge variant="secondary" size="sm">
                          +{job.tags.length - 2}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Column 3: Candidates & Salary */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{candidateCount} candidate{candidateCount !== 1 ? 's' : ''}</span>
                  </div>
                  
                  {job.salary && (job.salary.min || job.salary.max) && (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {job.salary.min && job.salary.max ? (
                        `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                      ) : job.salary.min ? (
                        `From $${job.salary.min.toLocaleString()}`
                      ) : (
                        `Up to $${job.salary.max.toLocaleString()}`
                      )}
                    </div>
                  )}
                </div>

                {/* Column 4: Date */}
                <div className="text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Created {formatRelativeTime(job.createdAt)}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Grid View Layout - Vertical */
              <div className="flex flex-col h-full">
                {/* Main content - grows to fill space */}
                <div className="flex-1">
                  {/* Description */}
                  {job.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                      {truncateText(job.description, 140)}
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
                  <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {job.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    
                    {job.department && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {job.department}
                      </span>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{candidateCount} candidate{candidateCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Footer content - always at bottom */}
                <div className="mt-auto space-y-2">
                  {/* Salary range */}
                  {job.salary && (job.salary.min || job.salary.max) && (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatRelativeTime(job.createdAt)}</span>
                    </div>
                    
                    {job.updatedAt && job.updatedAt !== job.createdAt && (
                      <span>Updated {formatRelativeTime(job.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            'relative',
            isListView ? 'ml-4 flex-shrink-0' : ''
          )}>
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
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                <button
                  onClick={() => onEdit(job)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </button>
                
                {isArchived ? (
                  <button
                    onClick={() => onUnarchive(job.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={() => onArchive(job.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </button>
                )}
                
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                
                <button
                  onClick={() => onDelete(job.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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