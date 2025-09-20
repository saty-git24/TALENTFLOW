import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { AssessmentForm } from '../components/AssessmentForm.jsx';
import { LoadingPage } from '../../../components/common/LoadingSpinner.jsx';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';
import { assessmentsApi } from '../../../api/assessments.js';
import { useApi } from '../../../hooks/useApi.js';

const AssessmentTakePage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [startTime] = React.useState(new Date());
  const [timeRemaining, setTimeRemaining] = React.useState(null);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    assessmentResponses,
    setAssessmentResponse,
    clearAssessmentResponses
  } = useAssessmentsStore();

  const { makeRequest } = useApi();

  // Load assessment
  React.useEffect(() => {
    const loadAssessment = async () => {
      if (jobId) {
        try {
          const response = await makeRequest(() => assessmentsApi.getAssessment(jobId));
          if (response.assessment) {
            setAssessment(response.assessment);
            if (response.assessment.settings?.timeLimit) {
              setTimeRemaining(response.assessment.settings.timeLimit * 60); // Convert to seconds
            }
          } else {
            // No assessment found, redirect back
            navigate(`/assessments/${jobId}`);
          }
        } catch (error) {
          console.error('Failed to load assessment:', error);
          navigate(`/assessments/${jobId}`);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAssessment();
    clearAssessmentResponses();
  }, [jobId, makeRequest, navigate, clearAssessmentResponses]);

  // Timer countdown
  React.useEffect(() => {
    if (!hasStarted || !timeRemaining || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeRemaining, isSubmitted]);

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleTimeUp = () => {
    // Auto-submit when time runs out
    handleSubmit();
  };

  const handleSubmit = async () => {
    const endTime = new Date();
    const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds

    const submissionData = {
      candidateId: 'demo-candidate', // In real app, this would come from auth
      responses: Object.values(assessmentResponses),
      startedAt: startTime,
      submittedAt: endTime,
      timeSpent
    };

    try {
      await makeRequest(() => 
        assessmentsApi.submitAssessmentResponse(assessment.id, submissionData)
      );
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingPage message="Loading assessment..." />;
  }

  if (!assessment) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
        <p className="text-gray-600 mb-6">No assessment is available for this job.</p>
        <Link to={`/assessments/${jobId}`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment Builder
          </Button>
        </Link>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Completed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for completing the assessment. Your responses have been submitted and will be reviewed by the hiring team.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Questions Answered:</span>
                  <div className="text-lg font-bold text-gray-900">
                    {Object.keys(assessmentResponses).length}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Time Taken:</span>
                  <div className="text-lg font-bold text-gray-900">
                    {formatTime(Math.floor((new Date() - startTime) / 1000))}
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate('/jobs')}>
              View Other Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    const totalQuestions = assessment.sections.reduce(
      (acc, section) => acc + section.questions.length, 0
    );

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{assessment.title}</CardTitle>
            {assessment.description && (
              <p className="text-gray-600 mt-2">{assessment.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Assessment Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Total Questions</div>
                <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
              </div>
              {assessment.settings?.timeLimit && (
                <div>
                  <div className="text-sm text-gray-600">Time Limit</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {assessment.settings.timeLimit} min
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Read each question carefully before answering</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You can navigate between sections, but make sure to complete all required questions</span>
                </li>
                {assessment.settings?.timeLimit && (
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>The assessment will auto-submit when time runs out</span>
                  </li>
                )}
                {!assessment.settings?.allowRetake && (
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>You can only take this assessment once</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Warning */}
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-yellow-800 text-sm">
                Once you start the assessment, make sure you have a stable internet connection and won't be interrupted.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Link to={`/assessments/${jobId}`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              
              <Button onClick={handleStart} size="lg">
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Timer */}
      {timeRemaining !== null && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Form */}
      <AssessmentForm
        assessment={assessment}
        responses={assessmentResponses}
        onResponse={setAssessmentResponse}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AssessmentTakePage;