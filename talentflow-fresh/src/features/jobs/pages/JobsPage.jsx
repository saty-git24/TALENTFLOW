import React from 'react';
import { Plus, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
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
    clearError
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
      await archiveJob(jobId);
    }
  };

  const handleUnarchiveJob = async (jobId) => {
    await unarchiveJob(jobId);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      await deleteJob(jobId);
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Reorder toggle */}
          <Button
            variant={enableReorder ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEnableReorder(!enableReorder)}
            disabled={filters.search || filters.status || filters.tags.length > 0}
            title={canReorder ? 'Disable reordering' : 'Enable drag & drop reordering'}
          >
            <ArrowUpDown className="w-4 h-4" />
            {enableReorder ? 'Reorder On' : 'Reorder'}
          </Button>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <ArrowUpDown className="w-4 h-4 inline mr-1" />
            Drag and drop reordering is enabled. Clear all filters to reorder jobs.
          </p>
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