import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
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
        isListView ? 'h-auto' : 'h-44 flex flex-col'
      )}
    >
      <CardContent className={cn(
        isListView ? 'px-4 pt-3 pb-5' : 'px-6 py-4 flex-1 flex flex-col justify-center'
      )}>
        <div className={cn(
          'flex items-center justify-between',
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
              /* List View Layout - Horizontal (simplified) */
              <div className="flex-1 flex items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  {job.department && (
                    <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {job.department}
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {job.salary && (job.salary.min || job.salary.max) ? (
                    job.salary.min && job.salary.max ?
                      `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` :
                      job.salary.min ? `From $${job.salary.min.toLocaleString()}` : `Up to $${job.salary.max.toLocaleString()}`
                  ) : null}
                </div>

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
                  {/* Job description/tags/location/candidate-count removed from grid view */}
                </div>

                {/* Footer content - compact */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {job.salary && (job.salary.min || job.salary.max) ? (
                        job.salary.min && job.salary.max ?
                          `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` :
                          job.salary.min ? `From $${job.salary.min.toLocaleString()}` : `Up to $${job.salary.max.toLocaleString()}`
                      ) : null}
                    </div>

                    <div className="mt-1 text-xs text-gray-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatRelativeTime(job.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {job.updatedAt && job.updatedAt !== job.createdAt && (
                      <span>Updated {formatRelativeTime(job.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions - inline in list view to avoid overlap, absolute in grid view */}
          {isListView ? (
            <div className="ml-4 flex-shrink-0 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowActions((prev) => !prev); }}
                aria-pressed={showActions}
                style={showActions ? { backgroundColor: '#2563eb', color: '#fff' } : undefined}
                className={cn(
                  'h-8 w-8 p-0 text-gray-700 dark:text-gray-200 transition-all duration-150 rounded-md flex items-center justify-center font-bold text-lg leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 z-50',
                  'hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-900 dark:hover:text-white',
                  'active:bg-blue-600 active:text-white',
                  showActions ? 'bg-blue-600 text-white border border-blue-600 shadow' : 'bg-transparent'
                )}
                aria-label="Job actions"
              >
                ⋮
              </Button>

              {showActions && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setShowActions(false)} aria-hidden />
                  <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                    <button
                      onClick={() => { setShowActions(false); onEdit(job); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Job
                    </button>

                    {isArchived ? (
                      <button
                        onClick={() => { setShowActions(false); onUnarchive(job.id); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ArchiveRestore className="w-4 h-4 mr-2" />
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShowActions(false); onArchive(job.id); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </button>
                    )}

                    <hr className="my-1 border-gray-200 dark:border-gray-600" />

                    <button
                      onClick={() => { setShowActions(false); onDelete(job.id); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="absolute top-2 right-2 z-40">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowActions((prev) => !prev); }}
                  aria-pressed={showActions}
                  style={showActions ? { backgroundColor: '#2563eb', color: '#fff' } : undefined}
                  className={cn(
                    'h-8 w-8 p-0 text-gray-700 dark:text-gray-200 transition-all duration-150 rounded-md flex items-center justify-center font-bold text-lg leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 z-50',
                    'hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-900 dark:hover:text-white',
                    'active:bg-blue-600 active:text-white',
                    showActions ? 'bg-blue-600 text-white border border-blue-600 shadow' : 'bg-transparent'
                  )}
                aria-label="Job actions"
              >
                ⋮
              </Button>

              {showActions && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                  <button
                    onClick={() => { setShowActions(false); onEdit(job); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </button>

                  {isArchived ? (
                    <button
                      onClick={() => { setShowActions(false); onUnarchive(job.id); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Unarchive
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowActions(false); onArchive(job.id); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </button>
                  )}

                  <hr className="my-1 border-gray-200 dark:border-gray-600" />

                  <button
                    onClick={() => { setShowActions(false); onDelete(job.id); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};