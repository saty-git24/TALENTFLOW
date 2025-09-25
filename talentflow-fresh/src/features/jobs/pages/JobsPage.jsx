import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { ViewToggle } from '../../../components/ui/ViewToggle.jsx';
import { JobFilters } from '../components/JobFilters.jsx';
import { JobsList } from '../components/JobsList.jsx';
import { JobModal } from '../components/JobModal.jsx';
import { Pagination } from '../../../components/common/Pagination.jsx';
import { useJobs } from '../hooks/useJobs.js';
import { useCandidatesStore } from '../../../store/candidatesStore.js';

const JobsPage = () => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'list'
  const [enableReorder, setEnableReorder] = React.useState(false);

  const {
    jobs,
    filters,
    pagination,
    loading,
    error,
    createJob,
    updateJob,
    archiveJob,
    unarchiveJob,
    deleteJob,
    updateFilters,
    updatePagination,
    clearFilters,
    clearError,
    reorderJobs
  } = useJobs();

  const { candidates } = useCandidatesStore();

  // Calculate candidate counts per job
  const candidateCounts = React.useMemo(() => {
    const counts = {};
    candidates.forEach(candidate => {
      counts[candidate.jobId] = (counts[candidate.jobId] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  const handleCreateJob = async (jobData) => {
    await createJob(jobData);
  };

  const handleUpdateJob = async (jobData) => {
    if (editingJob) {
      await updateJob(editingJob.id, jobData);
      setEditingJob(null);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
  };

  const handleArchiveJob = async (jobId) => {
    if (window.confirm('Are you sure you want to archive this job?')) {
      try {
        await archiveJob(jobId);
      } catch (err) {
        // archive error already normalized in the hook; surface to user if needed
        console.error('Failed to archive job:', err);
        // optional: show a quick alert so users notice immediately
        window.alert(err?.message || 'Failed to archive job');
      }
    }
  };

  const handleUnarchiveJob = async (jobId) => {
    try {
      await unarchiveJob(jobId);
    } catch (err) {
      console.error('Failed to unarchive job:', err);
      window.alert(err?.message || 'Failed to unarchive job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await deleteJob(jobId);
      } catch (err) {
        console.error('Failed to delete job:', err);
        window.alert(err?.message || 'Failed to delete job');
      }
    }
  };

  const handlePageChange = (page) => {
    updatePagination({ currentPage: page });
  };

  const handlePageSizeChange = (pageSize) => {
    updatePagination({ currentPage: 1, pageSize });
  };

  const canReorder = enableReorder && !filters.search && !filters.status && filters.tags.length === 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View Toggle Component */}
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            enableReorder={enableReorder}
            onReorderToggle={() => setEnableReorder(!enableReorder)}
            canReorder={!filters.search && !filters.status && filters.tags.length === 0}
          />
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Error message: only show if error and no jobs loaded */}
      {error && jobs.length === 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <JobFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Reorder notice */}
      {enableReorder && canReorder && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Drag & Drop Mode Active:</strong> Click and drag the grip handle (⋮⋮) on any job card to reorder. 
              {viewMode === 'grid' && ' In grid view, drop cards anywhere to reorder.'}
              {viewMode === 'list' && ' In list view, drop cards above or below other cards.'}
            </p>
          </div>
        </div>
      )}

      {/* Jobs list */}
      <div className="mb-6">
        <JobsList
          jobs={jobs}
          loading={loading}
          onEdit={handleEditJob}
          onArchive={handleArchiveJob}
          onUnarchive={handleUnarchiveJob}
          onDelete={handleDeleteJob}
          candidateCounts={candidateCounts}
          enableReorder={canReorder}
          viewMode={viewMode}
          onReorder={reorderJobs}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Create/Edit Modal */}
      <JobModal
        isOpen={showCreateModal || !!editingJob}
        onClose={() => {
          setShowCreateModal(false);
          setEditingJob(null);
        }}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
        job={editingJob}
        loading={loading}
      />
    </div>
  );
};

export default JobsPage;