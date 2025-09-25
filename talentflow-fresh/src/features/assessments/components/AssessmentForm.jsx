import React from 'react';
import { ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { QUESTION_TYPES } from '../../../utils/constants.js';
import { validateAssessmentResponse, checkConditionalLogic } from '../../../utils/validation.js';

export const AssessmentForm = ({
  assessment,
  responses = {},
  onResponse,
  onSubmit,
  currentSection = 0,
  onSectionChange,
  isPreview = false
}) => {
  const [validationErrors, setValidationErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentSectionData = assessment.sections[currentSection];
  const isLastSection = currentSection === assessment.sections.length - 1;
  const isFirstSection = currentSection === 0;

  const handleQuestionResponse = (questionId, value) => {
    onResponse(questionId, value);
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateSection = (section) => {
    const errors = {};
    
    section.questions.forEach(question => {
      // Check if question should be shown based on conditional logic
      if (!checkConditionalLogic(question, responses)) {
        return;
      }

      const response = responses[question.id];
      const questionErrors = validateAssessmentResponse(
        question.type,
        response?.value,
        { ...question.validation, required: question.required }
      );

      if (questionErrors.length > 0) {
        errors[question.id] = questionErrors[0]; // Show first error
      }
    });

    return errors;
  };

  const handleNext = () => {
    // Validate current section
    const errors = validateSection(currentSectionData);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (isLastSection) {
        handleSubmit();
      } else {
        onSectionChange(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      onSectionChange(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all sections
    let allErrors = {};
    assessment.sections.forEach(section => {
      const sectionErrors = validateSection(section);
      allErrors = { ...allErrors, ...sectionErrors };
    });

    setValidationErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } catch (error) {
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderQuestion = (question) => {
    // Check conditional logic
    if (!checkConditionalLogic(question, responses)) {
      return null;
    }

    const response = responses[question.id];
    const error = validationErrors[question.id];

    const questionContent = (
      <div className="space-y-4">
        {/* Question Header */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-base font-medium text-gray-900">
              {question.title}
            </h4>
            {question.required && (
              <Badge variant="secondary" size="sm">Required</Badge>
            )}
          </div>
          
          {question.description && (
            <p className="text-sm text-gray-600 mb-3">{question.description}</p>
          )}
        </div>

        {/* Question Input */}
        {renderQuestionInput(question, response?.value, (value) => 
          handleQuestionResponse(question.id, value)
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );

    return (
      <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
        {questionContent}
      </div>
    );
  };

  const renderQuestionInput = (question, value, onChange) => {
    switch (question.type) {
      case QUESTION_TYPES.SHORT_TEXT:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
            maxLength={question.validation?.maxLength}
          />
        );

      case QUESTION_TYPES.LONG_TEXT:
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
            rows={4}
            maxLength={question.validation?.maxLength}
          />
        );

      case QUESTION_TYPES.NUMERIC:
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || '')}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case QUESTION_TYPES.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label
                key={option.id}
                className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case QUESTION_TYPES.MULTI_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label
                key={option.id}
                className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    onChange(newValues);
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case QUESTION_TYPES.FILE_UPLOAD:
        return (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="space-y-2">
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">
                {isPreview ? 'File upload is disabled in preview mode' : 'PDF, DOC, DOCX up to 10MB'}
              </p>
              {!isPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChange('sample-file.pdf')}
                >
                  Choose File
                </Button>
              )}
              {value && (
                <div className="text-sm text-green-600 mt-2">
                  Selected: {value}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Question type not supported: {question.type}
          </div>
        );
    }
  };

  if (!currentSectionData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-600">No section found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentSectionData.title}</CardTitle>
        {currentSectionData.description && (
          <p className="text-gray-600">{currentSectionData.description}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {currentSectionData.questions.map(renderQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstSection}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            Section {currentSection + 1} of {assessment.sections.length}
          </div>

          <Button
            onClick={handleNext}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isLastSection ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};