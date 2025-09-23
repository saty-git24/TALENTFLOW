import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';
import { QUESTION_TYPES } from '../../../utils/constants.js';

export const AssessmentPreview = ({ assessment, isLivePreview = true }) => {
  const { 
    builderState,
    assessmentResponses, 
    setAssessmentResponse,
    clearAssessmentResponses,
    getAssessmentStats,
    validateResponse,
    getVisibleQuestions
  } = useAssessmentsStore();

  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  // Use builder state if no assessment provided (live preview)
  const previewAssessment = useMemo(() => {
    return assessment || {
      id: builderState.id,
      title: builderState.title || 'Assessment Preview',
      description: builderState.description || 'This is a preview of your assessment.',
      sections: builderState.sections || [],
      settings: builderState.settings || {}
    };
  }, [assessment, builderState]);

  const stats = getAssessmentStats();

  // Calculate visible questions based on conditional logic
  const visibleQuestions = useMemo(() => {
    const visible = {};
    previewAssessment.sections.forEach(section => {
      visible[section.id] = getVisibleQuestions(section.id, assessmentResponses);
    });
    return visible;
  }, [previewAssessment.sections, assessmentResponses, getVisibleQuestions]);

  const totalVisibleQuestions = useMemo(() => {
    return Object.values(visibleQuestions).reduce((total, questions) => total + questions.length, 0);
  }, [visibleQuestions]);

  const answeredQuestions = useMemo(() => {
    return Object.keys(assessmentResponses).filter(questionId => {
      // Only count visible questions
      return Object.values(visibleQuestions).some(questions => 
        questions.some(q => q.id === questionId)
      );
    }).length;
  }, [assessmentResponses, visibleQuestions]);

  const progressPercentage = totalVisibleQuestions > 0 ? (answeredQuestions / totalVisibleQuestions) * 100 : 0;

  // Timer functionality
  useEffect(() => {
    if (previewAssessment.settings?.timeLimit && !isSubmitted && !isLivePreview) {
      const endTime = Date.now() + (previewAssessment.settings.timeLimit * 60 * 1000);
      
      const timer = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          setTimeRemaining(0);
          setIsSubmitted(true);
          clearInterval(timer);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [previewAssessment.settings?.timeLimit, isSubmitted, isLivePreview]);

  // Clear responses when component mounts in live preview mode
  useEffect(() => {
    if (isLivePreview) {
      setCurrentSection(0);
      setIsSubmitted(false);
      setValidationErrors({});
    }
  }, [isLivePreview]);

  const handleResponse = useCallback((questionId, value) => {
    setAssessmentResponse(questionId, value);
    
    // Clear validation error for this question
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  }, [setAssessmentResponse]);

  const validateCurrentSection = useCallback(() => {
    const currentSectionData = previewAssessment.sections[currentSection];
    if (!currentSectionData) return true;

    const sectionQuestions = visibleQuestions[currentSectionData.id] || [];
    const errors = {};
    let hasErrors = false;

    sectionQuestions.forEach(question => {
      const response = assessmentResponses[question.id];
      const validation = validateResponse(question.id, response?.value);
      
      if (!validation.isValid) {
        errors[question.id] = validation.errors;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  }, [previewAssessment.sections, currentSection, visibleQuestions, assessmentResponses, validateResponse]);

  const handleNext = useCallback(() => {
    if (validateCurrentSection()) {
      if (currentSection < previewAssessment.sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  }, [currentSection, previewAssessment.sections.length, validateCurrentSection]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  }, [currentSection]);

  const handleSubmit = useCallback(() => {
    // Validate all sections
    let allValid = true;
    const allErrors = {};

    previewAssessment.sections.forEach((section, index) => {
      const sectionQuestions = visibleQuestions[section.id] || [];
      
      sectionQuestions.forEach(question => {
        const response = assessmentResponses[question.id];
        const validation = validateResponse(question.id, response?.value);
        
        if (!validation.isValid) {
          allErrors[question.id] = validation.errors;
          allValid = false;
        }
      });
    });

    setValidationErrors(allErrors);

    if (allValid) {
      setIsSubmitted(true);
    } else {
      // Focus on first section with errors
      const firstErrorSection = previewAssessment.sections.findIndex(section => {
        const sectionQuestions = visibleQuestions[section.id] || [];
        return sectionQuestions.some(q => allErrors[q.id]);
      });
      
      if (firstErrorSection !== -1) {
        setCurrentSection(firstErrorSection);
      }
    }
  }, [previewAssessment.sections, visibleQuestions, assessmentResponses, validateResponse]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question) => {
    const response = assessmentResponses[question.id];
    const errors = validationErrors[question.id];
    const hasError = errors && errors.length > 0;

    const commonProps = {
      className: `w-full ${hasError ? 'border-red-300 focus:border-red-500' : ''}`,
      value: response?.value || '',
      onChange: (e) => handleResponse(question.id, e.target.value)
    };

    let input;

    switch (question.type) {
      case QUESTION_TYPES.SHORT_TEXT:
        input = (
          <Input
            {...commonProps}
            placeholder={question.placeholder || 'Enter your answer...'}
          />
        );
        break;

      case QUESTION_TYPES.LONG_TEXT:
        input = (
          <Textarea
            {...commonProps}
            placeholder={question.placeholder || 'Enter your detailed answer...'}
            rows={4}
          />
        );
        break;

      case QUESTION_TYPES.NUMERIC:
        input = (
          <Input
            {...commonProps}
            type="number"
            placeholder={question.placeholder || 'Enter a number...'}
          />
        );
        break;

      case QUESTION_TYPES.SINGLE_CHOICE:
        input = (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={response?.value === option.value}
                  onChange={() => handleResponse(question.id, option.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
              </label>
            ))}
          </div>
        );
        break;

      case QUESTION_TYPES.MULTI_CHOICE:
        input = (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const selectedValues = Array.isArray(response?.value) ? response.value : [];
              return (
                <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleResponse(question.id, newValues);
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
                </label>
              );
            })}
          </div>
        );
        break;

      case QUESTION_TYPES.FILE_UPLOAD:
        input = (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">File upload would be available in the actual assessment</p>
            <p className="text-xs text-gray-500 mt-1">
              Allowed types: {question.validation?.allowedTypes?.join(', ') || 'Any'}
            </p>
          </div>
        );
        break;

      default:
        input = <div className="text-gray-500 italic">Unknown question type</div>;
    }

    return (
      <Card key={question.id} className={`${hasError ? 'border-red-200' : ''}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {question.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {question.description}
                  </p>
                )}
              </div>
              <Badge variant={question.required ? 'default' : 'secondary'} className="text-xs">
                {question.required ? 'Required' : 'Optional'}
              </Badge>
            </div>

            {input}

            {hasError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <div>
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Show validation info for numeric questions */}
            {question.type === QUESTION_TYPES.NUMERIC && question.validation && (
              <div className="text-xs text-gray-500">
                {question.validation.min !== null && question.validation.max !== null && (
                  <span>Range: {question.validation.min} - {question.validation.max}</span>
                )}
                {question.validation.min !== null && question.validation.max === null && (
                  <span>Minimum: {question.validation.min}</span>
                )}
                {question.validation.min === null && question.validation.max !== null && (
                  <span>Maximum: {question.validation.max}</span>
                )}
              </div>
            )}

            {/* Show character limits for text questions */}
            {(question.type === QUESTION_TYPES.SHORT_TEXT || question.type === QUESTION_TYPES.LONG_TEXT) && question.validation && (
              <div className="text-xs text-gray-500">
                {response?.value && question.validation.maxLength && (
                  <span>{response.value.length}/{question.validation.maxLength} characters</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Assessment {isLivePreview ? 'Preview' : 'Submitted'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isLivePreview 
              ? 'This completes the assessment preview. Responses are not saved in preview mode.'
              : 'Thank you for completing the assessment. Your responses have been recorded.'
            }
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div>You answered {answeredQuestions} out of {totalVisibleQuestions} questions</div>
            <div>Progress: {Math.round(progressPercentage)}% complete</div>
          </div>
          
          {isLivePreview && (
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentSection(0);
                clearAssessmentResponses();
                setValidationErrors({});
              }}
              className="mt-4"
              variant="outline"
            >
              Reset Preview
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentSectionData = previewAssessment.sections[currentSection];
  const currentSectionQuestions = currentSectionData ? visibleQuestions[currentSectionData.id] || [] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{previewAssessment.title}</CardTitle>
              {previewAssessment.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{previewAssessment.description}</p>
              )}
              {previewAssessment.settings?.instructions && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Instructions:</strong> {previewAssessment.settings.instructions}
                  </p>
                </div>
              )}
            </div>
            
            <div className="text-right space-y-2">
              {timeRemaining !== null && (
                <div className={`flex items-center text-sm ${timeRemaining < 300000 ? 'text-red-600' : 'text-gray-600'}`}>
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
              )}
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalVisibleQuestions} questions • {stats.requiredQuestions} required
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Progress Bar */}
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Section Navigation */}
          {previewAssessment.sections.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {previewAssessment.sections.map((section, index) => {
                const sectionQuestions = visibleQuestions[section.id] || [];
                const sectionErrors = sectionQuestions.some(q => validationErrors[q.id]);
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentSection === index
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : sectionErrors
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {section.title}
                    {sectionErrors && <span className="ml-1">!</span>}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Section */}
      {currentSectionData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentSectionData.title}</span>
              <Badge variant="outline">
                Section {currentSection + 1} of {previewAssessment.sections.length}
              </Badge>
            </CardTitle>
            {currentSectionData.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {currentSectionData.description}
              </p>
            )}
          </CardHeader>
        </Card>
      ) : null}

      {/* Questions */}
      <div className="space-y-4">
        {currentSectionQuestions.length > 0 ? (
          currentSectionQuestions.map(question => renderQuestion(question))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Questions in This Section
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add questions to this section to see them here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      {previewAssessment.sections.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {answeredQuestions} of {totalVisibleQuestions} answered
            </div>

            {currentSection < previewAssessment.sections.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Submit Assessment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Notice */}
      {isLivePreview && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Live Preview Mode:</strong> This updates in real-time as you edit the assessment. 
                Responses are not permanently saved.
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
              className="text-blue-700 dark:text-blue-200"
            >
              {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          
          {showAnswers && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">Current Responses:</p>
              <pre className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(assessmentResponses, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};