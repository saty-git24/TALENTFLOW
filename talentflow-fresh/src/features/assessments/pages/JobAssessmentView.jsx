import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileCheck, 
  Users, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Plus,
  Edit,
  Eye,
  Wrench,
  Play,
  Calendar
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { LoadingPage } from '../../../components/common/LoadingSpinner.jsx';
import { useJobsStore } from '../../../store/jobsStore.js';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';
import { formatDate, formatRelativeTime } from '../../../utils/helpers.js';

const JobAssessmentView = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { getJobById, currentJob } = useJobsStore();
  const { initializeBuilder } = useAssessmentsStore();
  
  const [loading, setLoading] = useState(true);
  const [assessmentStats, setAssessmentStats] = useState(null);

  // Ensure jobId is properly converted for lookup
  let job = getJobById(jobId);
  // Fallback: if not found by ID, use currentJob if it matches
  if (!job && currentJob && (currentJob.id === jobId || String(currentJob.id) === String(jobId))) {
    job = currentJob;
  }

  useEffect(() => {
    if (job) {
      // Simulate loading assessment stats
      setTimeout(() => {
        setAssessmentStats({
          hasAssessment: Math.random() > 0.5, // Random for demo
          totalResponses: Math.floor(Math.random() * 50),
          averageScore: Math.floor(Math.random() * 100),
          averageTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
          sections: Math.floor(Math.random() * 5) + 1,
          questions: Math.floor(Math.random() * 20) + 5,
          passRate: Math.floor(Math.random() * 100),
          lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
        setLoading(false);
      }, 500);
    } else {
      // If no job found, stop loading
      setLoading(false);
    }
  }, [job]);

  const handleCreateAssessment = () => {
    // Initialize builder and navigate to assessment page
    if (currentJob) {
      initializeBuilder(String(currentJob.id));
      navigate(`/assessments/${currentJob.id}`);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading assessment data..." />;
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Job Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/jobs">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/jobs/${jobId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Assessment for {job?.title || 'Loading...'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {job?.department || ''} {job?.department && job?.location ? '•' : ''} {job?.location || ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {assessmentStats?.hasAssessment ? (
            <>
              <Link to={`/assessments/${jobId}/preview`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
              
              <Link to={`/assessments/${jobId}/builder`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Assessment
                </Button>
              </Link>
            </>
          ) : (
            <Button onClick={handleCreateAssessment}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          )}
        </div>
      </div>

      {assessmentStats?.hasAssessment ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {assessmentStats.totalResponses}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Responses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {assessmentStats.averageScore}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {assessmentStats.averageTime}m
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {assessmentStats.passRate}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assessment Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sections</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{assessmentStats.sections}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{assessmentStats.questions}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Updated
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatRelativeTime(assessmentStats.lastUpdated)}
                    </p>
                  </div>


                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          Assessment completed by John Doe
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          Assessment started by Jane Smith
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          Assessment updated
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(assessmentStats.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        // No Assessment State
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Assessment Created
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create an assessment for this job position to evaluate candidates effectively 
              and streamline your hiring process.
            </p>
            
            <Button onClick={handleCreateAssessment}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobAssessmentView;