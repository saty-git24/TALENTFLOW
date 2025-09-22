import React from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '../../../utils/helpers.js';
import { DRAG_TYPES } from '../../../utils/constants.js';

export const JobDropZone = ({ 
  onDrop, 
  index, 
  isFirst = false, 
  isLast = false, 
  viewMode = 'grid',
  className 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DRAG_TYPES.JOB,
    drop: (item) => {
      onDrop?.(item, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [onDrop, index]);

  const isActive = isOver && canDrop;

  if (viewMode === 'list') {
    return (
      <div
        ref={drop}
        className={cn(
          'transition-all duration-200',
          isActive 
            ? 'h-8 bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-400 border-dashed rounded-lg' 
            : 'h-2',
          className
        )}
      />
    );
  }

  // Grid view - show drop zones between columns
  return (
    <div
      ref={drop}
      className={cn(
        'transition-all duration-200',
        isActive 
          ? 'w-4 bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-400 border-dashed rounded-lg' 
          : 'w-2',
        className
      )}
    />
  );
};