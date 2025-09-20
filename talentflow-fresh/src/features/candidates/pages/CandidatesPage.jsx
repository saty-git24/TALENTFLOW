import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Users, LayoutGrid } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { VirtualizedList } from '../components/VirtualizedList.jsx';
import { useCandidates } from '../hooks/useCandidates.js';
import { useJobsStore } from '../../../store/jobsStore.js';

const CandidatesPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';
  
  const [filters, setFilters] = React.useState({
    search: '',
    stage: '',
    jobId: initialJobId
  });

  const {
    candidates,
    loading,
    error,
    updateFilters,
    clearError
  } = useCandidates(filters);

  const { jobs } = useJobsStore();
  
  // Create jobs lookup for faster access
  const jobsLookup = React.useMemo(() => {
    const lookup = {};
    jobs.forEach(job => {
      lookup[job.id] = job;
    });
    return lookup;
  }, [jobs]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    updateFilters({ ...filters, ...newFilters });
  };

  const handleStageChange = async (candidateId, newStage) => {
    // Implementation would call the API to update candidate stage
    console.log('Moving candidate', candidateId, 'to stage', newStage);
  };

  const handleEdit = (candidate) => {
    console.log('Edit candidate', candidate);
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      console.log('Delete candidate', candidateId);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">
            Manage candidate applications and track their progress
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button variant="outline">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Kanban View
          </Button>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
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
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange({ stage: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screening</option>
            <option value="tech">Technical</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={filters.jobId}
            onChange={(e) => handleFilterChange({ jobId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{candidates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
            <div>
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-2xl font-semibold text-gray-900">
                {candidates.filter(c => c.stage === 'applied').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {candidates.filter(c => ['screen', 'tech'].includes(c.stage)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <div>
              <p className="text-sm text-gray-600">Hired</p>
              <p className="text-2xl font-semibold text-gray-900">
                {candidates.filter(c => c.stage === 'hired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Candidates ({candidates.length})
          </h3>
        </div>
        
        <VirtualizedList
          candidates={candidates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStageChange={handleStageChange}
          jobs={jobsLookup}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CandidatesPage;