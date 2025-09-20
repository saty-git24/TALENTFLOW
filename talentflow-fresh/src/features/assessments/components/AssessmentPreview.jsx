import React from 'react';
import { Clock, FileText, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { AssessmentForm } from './AssessmentForm.jsx';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';

export const AssessmentPreview = ({ assessment }) => {
  const { 
    assessmentResponses, 
    setAssessmentResponse,
    clearAssessmentResponses,
    getAssessmentStats 
  } = useAssessmentsStore();

  const [currentSection, setCurrentSection] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Use builder state if no assessment provided (live preview)
  const { builderState } = useAssessmentsStore();
  const previewAssessment = assessment || {
    title: builderState.title || 'Assessment Preview',
    description: builderState.description || 'This is a preview of your assessment.',
    sections: builderState.sections || [],
    settings: builderState.settings || {}
  };

  const stats = getAssessmentStats();

  React.useEffect(() => {
    // Clear responses when component mounts
    clearAssessmentResponses();
    setCurrentSection(0);
    setIsSubmitted(false);
  }, [assessment, clearAssessmentResponses]);

  const handleResponse = (questionId, value) => {
    setAssessmentResponse(questionId, value);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const totalQuestions = previewAssessment.sections.reduce(
    (acc, section) => acc + section.questions.length, 0
  );

  const answeredQuestions = Object.keys(assessmentResponses).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for completing the assessment. Your responses have been recorded.
          </p>
          <div className="text-sm text-gray-500">
            You answered {answeredQuestions} out of {totalQuestions} questions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{previewAssessment.title}</CardTitle>
              {previewAssessment.description && (
                <p className="text-gray-600 mt-2">{previewAssessment.description}</p>
              )}
            </div>
            
            <div className="text-right space-y-2">
              {previewAssessment.settings?.timeLimit && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {previewAssessment.settings.timeLimit} minutes
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                {stats.totalQuestions} questions • {stats.requiredQuestions} required
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Progress Bar */}
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Section Navigation */}
          {previewAssessment.sections.length > 1 && (
            <div className="flex space-x-2 mb-4">
              {previewAssessment.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSection === index
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Form */}
      {previewAssessment.sections.length > 0 ? (
        <AssessmentForm
          assessment={previewAssessment}
          responses={assessmentResponses}
          onResponse={handleResponse}
          onSubmit={handleSubmit}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          isPreview={true}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Added</h3>
            <p className="text-gray-600">
              Add sections and questions to see the assessment preview.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
          <p className="text-blue-800 text-sm">
            <strong>Preview Mode:</strong> This is how candidates will see the assessment. 
            Responses are not saved in preview mode.
          </p>
        </div>
      </div>
    </div>
  );
};