import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { CandidateCard } from './CandidateCard.jsx';

const ITEM_HEIGHT = 184; // Height adjusted for increased top padding
const CONTAINER_HEIGHT = 600; // Height of the virtualized container

export const VirtualizedList = ({
  candidates = [],
  onDelete,
  onStageChange,
  jobs = {},
  loading = false,
  viewMode = 'list'
}) => {
  const listRef = React.useRef(null);

  // Item renderer for react-window
  const ItemRenderer = React.memo(({ index, style }) => {
    const candidate = candidates[index];
    
    // Handle potential type mismatches between job IDs
    const candidateJob = jobs[candidate.jobId] || 
                        jobs[String(candidate.jobId)] || 
                        jobs[Number(candidate.jobId)] ||
                        Object.values(jobs).find(job => 
                          job.id === candidate.jobId || 
                          String(job.id) === String(candidate.jobId)
                        );
    
    return (
      <div style={style}>
        <div className="px-4 py-1 pb-4">
          <CandidateCard
            candidate={candidate}
            job={candidateJob}
            onDelete={onDelete}
            onStageChange={onStageChange}
            compact={false} // Keep false but reduce card height through styling
            viewMode={viewMode}
          />
        </div>
      </div>
    );
  });

  ItemRenderer.displayName = 'ItemRenderer';

  // Scroll to top when candidates change
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [candidates]);

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {loading ? 'Loading candidates...' : 'No candidates found'}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <List
        ref={listRef}
        height={Math.min(CONTAINER_HEIGHT, candidates.length * ITEM_HEIGHT)}
        itemCount={candidates.length}
        itemSize={ITEM_HEIGHT}
        overscanCount={5}
        className="scrollbar-hide"
      >
        {ItemRenderer}
      </List>
      
      {loading && (
        <div className="flex justify-center py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading more candidates...</div>
        </div>
      )}
    </div>
  );
};