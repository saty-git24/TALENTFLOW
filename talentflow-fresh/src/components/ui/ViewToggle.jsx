import React from 'react';
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../utils/helpers.js';

export const ViewToggle = ({
  viewMode = 'grid',
  onViewModeChange,
  enableReorder = false,
  onReorderToggle,
  canReorder = true,
  className,
  size = 'md'
}) => {
  const toggleSize = size === 'sm' ? 'sm' : 'md';
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* View Mode Toggle */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
        <button
          onClick={() => onViewModeChange?.('grid')}
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center transition-all duration-200",
            viewMode === 'grid' 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
          )}
          title="Grid view"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange?.('list')}
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center transition-all duration-200",
            viewMode === 'list' 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
          )}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Reorder Toggle */}
      {onReorderToggle && (
        <Button
          variant={enableReorder ? 'default' : 'outline'}
          size={toggleSize}
          onClick={onReorderToggle}
          disabled={!canReorder}
          title={enableReorder ? 'Disable reordering' : 'Enable drag & drop reordering'}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          {size !== 'sm' && (
            <span className="hidden sm:inline">
              {enableReorder ? 'Reorder' : 'Reorder'}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};