import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, X, ArrowLeft, List } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';
import { useCandidatesStore } from '../../../store/candidatesStore.js';
import { useJobsStore } from '../../../store/jobsStore.js';
import { jobsApi } from '../../../api/jobs.js';
import { useCandidates } from '../hooks/useCandidates.js';
import { isValidStageTransition } from '../../../utils/helpers.js';
import { CANDIDATE_STAGE_LABELS } from '../../../utils/constants.js';

const KanbanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || '';
  
  const [filters, setFilters] = React.useState({
    search: '',
    jobId: initialJobId
  });

  const { getCandidatesByStage, moveCandidateStage } = useCandidatesStore();
  const { jobs, setJobs } = useJobsStore();

  // Load jobs on mount if not already loaded
  React.useEffect(() => {
    if (!jobs || jobs.length === 0) {
      jobsApi.getJobs({ pageSize: 100 }).then(res => {
        setJobs(res.jobs || []);
      });
    }
  }, [jobs, setJobs]);
  const { loading, error, clearError, moveCandidateToStage, deleteCandidate } = useCandidates(filters);

  // Create jobs lookup
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

  // Get candidates grouped by stage
  const candidatesByStage = getCandidatesByStage();

  const handleJobFilter = (jobId) => {
    setFilters(prev => ({ ...prev, jobId }));
    if (jobId) {
      setSearchParams({ jobId });
    } else {
      setSearchParams({});
    }
  };

  const handleStageChange = async (candidateId, newStage) => {
    try {
      // Find the current candidate to get their current stage
      const allCandidates = Object.values(candidatesByStage).flat();
      const candidate = allCandidates.find(c => c.id === candidateId);
      if (!candidate) {
        alert('Candidate not found');
        return;
      }

      // Validate the stage transition
      if (!isValidStageTransition(candidate.stage, newStage)) {
        alert(`Invalid transition from ${CANDIDATE_STAGE_LABELS[candidate.stage]} to ${CANDIDATE_STAGE_LABELS[newStage]}`);
        return;
      }

      await moveCandidateToStage(candidateId, newStage);
      console.log(`Successfully moved candidate ${candidateId} to ${newStage}`);
    } catch (error) {
      console.error('Failed to move candidate:', error);
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

  const selectedJob = filters.jobId ? jobs.find(job => job.id === filters.jobId) : null;
  const totalCandidates = Object.values(candidatesByStage).flat().length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-1">
            {selectedJob 
              ? `Candidates for ${selectedJob.title} (${totalCandidates})` 
              : `All candidates across jobs (${totalCandidates})`
            }
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/candidates')}
          >
            <List className="w-4 h-4 mr-2" />
            List View
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by job:</span>
            </div>
            
            <Select
              value={filters.jobId}
              onChange={(e) => handleJobFilter(e.target.value)}
              className="w-64"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </Select>
            
            {filters.jobId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleJobFilter('')}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Drag candidates between stages to update their status
          </div>
        </div>
      </div>

      {/* Stage Statistics */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {Object.entries(candidatesByStage).map(([stage, candidates]) => {
          const stageLabels = {
            applied: 'Applied',
            screen: 'Screening', 
            tech: 'Technical',
            offer: 'Offer',
            hired: 'Hired',
            rejected: 'Rejected'
          };
          
          const stageColors = {
            applied: 'bg-blue-100 text-blue-800',
            screen: 'bg-yellow-100 text-yellow-800',
            tech: 'bg-purple-100 text-purple-800', 
            offer: 'bg-orange-100 text-orange-800',
            hired: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
          };

          return (
            <div key={stage} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[stage]}`}>
                  {stageLabels[stage]}
                </div>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {candidates.length}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-hidden">
        {totalCandidates > 0 ? (
          <KanbanBoard
            candidatesByStage={candidatesByStage}
            jobs={jobsLookup}
            onStageChange={handleStageChange}
            onDelete={handleDelete}
            loading={loading}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No candidates found</div>
            <p className="text-gray-500">
              {filters.jobId 
                ? 'No candidates have applied for this job yet.' 
                : 'No candidates in the system.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanPage;