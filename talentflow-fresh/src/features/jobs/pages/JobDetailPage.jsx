import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Archive, 
  ArchiveRestore,
  MapPin, 
  DollarSign, 
  Calendar, 
  Users,
  FileCheck,
  Plus
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { LoadingPage } from '../../../components/common/LoadingSpinner.jsx';
import { JobModal } from '../components/JobModal.jsx';
import { useJobs } from '../hooks/useJobs.js';
import { useCandidateStats } from '../../../hooks/useCandidateStats.js';
import { jobsApi } from '../../../api/jobs.js';
import { formatDate, formatRelativeTime } from '../../../utils/helpers.js';
import { CANDIDATE_STAGE_LABELS } from '../../../utils/constants.js';

const JobDetailPage = () => {
  const [showToast, setShowToast] = useState(false);
  function handleShowToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [editingJob, setEditingJob] = React.useState(null);
  const [job, setJob] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const { updateJob, archiveJob, unarchiveJob } = useJobs();
  
  // Use optimized candidate stats hook instead of loading all candidates
  const { stats: candidateStats, loading: candidatesLoading } = useCandidateStats(jobId);

  // Load job details
  React.useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const data = await jobsApi.getJob(jobId);
        setJob(data.job || data);
      } catch (error) {
        console.error('Failed to load job:', error);
        // Could show error state here (store or local)
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  // Get total candidate count
  const totalCandidates = React.useMemo(() => {
    if (!candidateStats) return 0;
    return Object.values(candidateStats).reduce((total, count) => total + count, 0);
  }, [candidateStats]);

  const handleUpdateJob = async (jobData) => {
    if (editingJob) {
      await updateJob(editingJob.id, jobData);
      setJob({ ...job, ...jobData });
      setEditingJob(null);
    }
  };

  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to archive this job?')) {
      try {
        await archiveJob(job.id);
        setJob({ ...job, status: 'archived' });
      } catch (err) {
        console.error('Failed to archive job:', err);
        window.alert(err?.message || 'Failed to archive job');
      }
    }
  };

  const handleUnarchive = async () => {
    try {
      await unarchiveJob(job.id);
      setJob({ ...job, status: 'active' });
    } catch (err) {
      console.error('Failed to unarchive job:', err);
      window.alert(err?.message || 'Failed to unarchive job');
    }
  };

  if (loading) {
    return <LoadingPage message="Loading job details..." />;
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
        <Link to="/jobs">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const isArchived = job.status === 'archived';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <Badge variant={isArchived ? 'secondary' : 'success'}>
                {isArchived ? 'Archived' : 'Active'}
              </Badge>
            </div>
            <p className="text-gray-600">Job ID: {job.id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setEditingJob(job)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          {isArchived ? (
            <Button
              variant="outline"
              onClick={handleUnarchive}
            >
              <ArchiveRestore className="w-4 h-4 mr-2" />
              Unarchive
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleArchive}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}
          
          <Link to={`/assessments/${job.id}`}>
            <Button>
              <FileCheck className="w-4 h-4 mr-2" />
              Assessment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{job.department || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{job.type || 'Full-time'}</span>
                </div>
                
                {job.salary && (job.salary.min || job.salary.max) && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {job.salary.min && job.salary.max ? (
                        `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                      ) : job.salary.min ? (
                        `From ${job.salary.min.toLocaleString()}`
                      ) : (
                        `Up to ${job.salary.max.toLocaleString()}`
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills & Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {job.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
                  <div className="prose prose-sm max-w-none">
                    <div className="text-gray-600 whitespace-pre-wrap">
                      {job.requirements.split('\n').map((line, index) => (
                        <div key={index} className="mb-1">
                          {line.startsWith('•') ? line : `• ${line}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDate(job.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatRelativeTime(job.updatedAt)}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span>{' '}
                    <code className="bg-gray-100 px-1 rounded">{job.slug}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Stats */}
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Candidates ({totalCandidates})</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(CANDIDATE_STAGE_LABELS).map(([stage, label]) => {
                  let variant = 'secondary';
                  if (stage === 'applied') variant = 'info';
                  else if (stage === 'screen') variant = 'warning';
                  else if (stage === 'tech') variant = 'default';
                  else if (stage === 'offer') variant = 'secondary';
                  else if (stage === 'hired') variant = 'success';
                  else if (stage === 'rejected') variant = 'error';
                  return (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{label}</span>
                      <Badge variant={variant} size="sm">
                        {candidateStats[stage] || 0}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              {totalCandidates === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No candidates yet</p>
                </div>
              ) : (
                <div className="mt-4">
                  <Link to={`/kanban?jobId=${job.id}`}>
                    <Button size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      View Kanban Board
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/candidates?jobId=${job.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Candidates
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: job.title,
                        text: job.description,
                        url: window.location.href
                      });
                    } catch (e) {}
                  } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(window.location.href);
                    handleShowToast();
                  }
                }}
              >
                Share Job
              </Button>
      {/* Toast Notification */}
      {showToast && (
        <div style={{position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 1000}} className="bg-black text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          Link copied to clipboard!
        </div>
      )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <JobModal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        onSubmit={handleUpdateJob}
        job={editingJob}
      />
    </div>
  );
};

export default JobDetailPage;