import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, LayoutGrid } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { VirtualizedList } from '../components/VirtualizedList.jsx';
import { useCandidates } from '../hooks/useCandidates.js';
import { useJobsStore } from '../../../store/jobsStore.js';
import { jobsApi } from '../../../api/jobs.js';
import { isValidStageTransition } from '../../../utils/helpers.js';
import { CANDIDATE_STAGE_LABELS } from '../../../utils/constants.js';

const CandidatesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    clearError,
    moveCandidateToStage,
    deleteCandidate
  } = useCandidates(filters);

  const { jobs, setJobs } = useJobsStore();

  // Load jobs on mount if not already loaded
  React.useEffect(() => {
    if (!jobs || jobs.length === 0) {
      jobsApi.getJobs({ pageSize: 100 }).then(res => {
        setJobs(res.jobs || []);
      });
    }
  }, [jobs, setJobs]);
  
  // Create jobs lookup for faster access
  const jobsLookup = React.useMemo(() => {
    const lookup = {};
    jobs.forEach(job => {
      // Store with both string and numeric keys to handle type mismatches
      lookup[job.id] = job;
      lookup[String(job.id)] = job;
      if (!isNaN(job.id)) {
        lookup[Number(job.id)] = job;
      }
    });
    return lookup;
  }, [jobs]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    updateFilters({ ...filters, ...newFilters });
  };

  const handleStageChange = async (candidateId, newStage) => {
    try {
      // Find the current candidate to get their current stage
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) {
        alert('Candidate not found');
        return;
      }

      // Validate the stage transition
      if (!isValidStageTransition(candidate.stage, newStage)) {
        alert(`Invalid transition from ${CANDIDATE_STAGE_LABELS[candidate.stage]} to ${CANDIDATE_STAGE_LABELS[newStage]}`);
        return;
      }

      // Move candidate to new stage
      await moveCandidateToStage(candidateId, newStage, 'user');
      
      // Success feedback could be added here if needed
      console.log(`Successfully moved candidate ${candidateId} to ${newStage}`);
    } catch (error) {
      console.error('Failed to change candidate stage:', error);
      alert('Failed to update candidate stage. Please try again.');
    }
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await deleteCandidate(candidateId);
        console.log('Candidate deleted successfully');
      } catch (error) {
        console.error('Failed to delete candidate:', error);
        alert('Failed to delete candidate. Please try again.');
      }
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">
            Manage candidate applications and track their progress
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/kanban')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Kanban View
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
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-300 placeholder:font-medium placeholder:px-1 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:bg-white dark:focus:bg-gray-600 hover:bg-white dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 min-h-[48px]"
          />
          
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange({ stage: e.target.value })}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-medium min-h-[48px]"
          >
            <option value="" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">All stages</option>
            <option value="applied" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">Applied</option>
            <option value="screen" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">Screening</option>
            <option value="tech" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">Technical</option>
            <option value="offer" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">Offer</option>
            <option value="hired" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">Hired</option>
            <option value="rejected" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">Rejected</option>
          </select>
          
          <select
            value={filters.jobId}
            onChange={(e) => handleFilterChange({ jobId: e.target.value })}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-medium min-h-[48px]"
          >
            <option value="" className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">All jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">
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
          onDelete={handleDelete}
          onStageChange={handleStageChange}
          jobs={jobsLookup}
          loading={loading}
          viewMode="list"
        />
      </div>
    </div>
  );
};

export default CandidatesPage;