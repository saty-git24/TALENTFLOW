import React from 'react';
import { useDragLayer } from 'react-dnd';
import { JobCard } from './JobCard.jsx';
import { DRAG_TYPES } from '../../../utils/constants.js';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  
  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px) rotate(3deg) scale(1.05)`;
  
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const JobDragPreview = ({ viewMode }) => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || itemType !== DRAG_TYPES.JOB || !item) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <div className="opacity-90 shadow-2xl max-w-sm">
          <JobCard
            job={item}
            viewMode={viewMode}
            onEdit={() => {}}
            onArchive={() => {}}
            onUnarchive={() => {}}
            onDelete={() => {}}
            candidateCount={0}
            isDragging={false}
            canReorder={false}
          />
        </div>
      </div>
    </div>
  );
};