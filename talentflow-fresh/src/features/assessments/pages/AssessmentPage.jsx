import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Save, Play } from 'lucide-react';
import { Wrench } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { AssessmentBuilder } from '../components/AssessmentBuilder.jsx';
import { AssessmentPreview } from '../components/AssessmentPreview.jsx';
import { LoadingPage } from '../../../components/common/LoadingSpinner.jsx';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';
import { useJobsStore } from '../../../store/jobsStore.js';
import { assessmentsApi } from '../../../api/assessments.js';
import { useApi } from '../../../hooks/useApi.js';

const AssessmentPage = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // Check for 'preview' parameter
  const [activeTab, setActiveTab] = React.useState(mode === 'preview' ? 'preview' : 'builder');
  const [loading, setLoading] = React.useState(false);

  const {
    currentAssessment,
    setCurrentAssessment,
    loadAssessmentToBuilder,
    resetBuilder,
    setPreviewMode,
    getAssessmentsByJobId
  } = useAssessmentsStore();

  const { jobs, getJobById } = useJobsStore();
  const { makeRequest } = useApi();

  const job = getJobById(jobId);

  // Load existing assessment
  React.useEffect(() => {
    const loadAssessment = async () => {
      if (jobId) {
        setLoading(true);
        try {
          // First check if we have assessments in the store for this job
          const localAssessments = getAssessmentsByJobId(jobId);
          
          if (localAssessments.length > 0) {
            // Use the most recent assessment for this job
            const latestAssessment = localAssessments.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            )[0];
            
            setCurrentAssessment(latestAssessment);
            loadAssessmentToBuilder(latestAssessment);
          } else {
            // Try to load from API as fallback
            try {
              const response = await makeRequest(() => assessmentsApi.getAssessment(jobId));
              if (response.assessment) {
                setCurrentAssessment(response.assessment);
                loadAssessmentToBuilder(response.assessment);
              } else {
                resetBuilder(jobId);
              }
            } catch (error) {
              console.log('No existing assessment found, starting fresh');
              resetBuilder(jobId);
            }
          }
        } catch (error) {
          console.error('Failed to load assessment:', error);
          resetBuilder(jobId);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAssessment();
  }, [jobId, makeRequest, setCurrentAssessment, loadAssessmentToBuilder, resetBuilder, getAssessmentsByJobId]);

  const handleSave = async (assessmentData) => {
    return makeRequest(
      () => assessmentsApi.saveAssessment(jobId, assessmentData),
      {
        onSuccess: (response) => {
          setCurrentAssessment(response.assessment);
          // Show success message
          console.log('Assessment saved successfully');
        }
      }
    );
  };

  const handlePreview = () => {
    setActiveTab('preview');
    setPreviewMode(true);
  };

  const handleBackToBuilder = () => {
    setActiveTab('builder');
    setPreviewMode(false);
  };

  if (loading) {
    return <LoadingPage message="Loading assessment..." />;
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/assessments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment</h1>
            <p className="text-gray-600">
              {job.title} • {currentAssessment ? 'Edit' : 'Create'} Assessment
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Navigation */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleBackToBuilder}
            >
              <Wrench className="w-4 h-4 mr-1" />
              Builder
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'builder' ? (
        <AssessmentBuilder
          jobId={jobId}
          onSave={handleSave}
          loading={loading}
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Assessment Preview</h2>
          <AssessmentPreview assessment={currentAssessment} />
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;