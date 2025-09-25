import React, { useState, useCallback } from 'react';
import { Trash2, Plus, X, Settings, Copy } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../../utils/constants.js';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';

export const QuestionBuilder = ({
  question,
  sectionId,
  onUpdate,
  onRemove,
  onDuplicate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showConditional, setShowConditional] = useState(false);
  
  const {
    updateQuestion,
    addQuestionOption,
    updateQuestionOption,
    removeQuestionOption
  } = useAssessmentsStore();
  const handleQuestionUpdate = useCallback((field, value) => {
    updateQuestion(question.id, { [field]: value });
    onUpdate?.(question.id, { [field]: value });
  }, [question.id, updateQuestion, onUpdate]);

  const handleTypeChange = useCallback((newType) => {
    const updates = { type: newType };
    
    // Initialize options for choice-based questions
    if (newType === QUESTION_TYPES.SINGLE_CHOICE || newType === QUESTION_TYPES.MULTI_CHOICE) {
      if (!question.options || question.options.length === 0) {
        updates.options = [
          { id: `opt_${Date.now()}_1`, text: 'Option 1', value: 'option1' },
          { id: `opt_${Date.now()}_2`, text: 'Option 2', value: 'option2' }
        ];
      }
    } else {
      updates.options = [];
    }

    // Set default validation based on type
    const getDefaultValidation = (type) => {
      switch (type) {
        case QUESTION_TYPES.SHORT_TEXT:
          return { maxLength: 255, minLength: null };
        case QUESTION_TYPES.LONG_TEXT:
          return { maxLength: 1000, minLength: null };
        case QUESTION_TYPES.NUMERIC:
          return { min: null, max: null };
        case QUESTION_TYPES.SINGLE_CHOICE:
        case QUESTION_TYPES.MULTI_CHOICE:
          return { minSelections: null, maxSelections: null };
        case QUESTION_TYPES.FILE_UPLOAD:
          return {
            maxFileSize: 10485760,
            allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'png']
          };
        default:
          return {};
      }
    };

    updates.validation = getDefaultValidation(newType);
    
    Object.entries(updates).forEach(([field, value]) => {
      handleQuestionUpdate(field, value);
    });
  }, [question.options, handleQuestionUpdate]);

  const handleAddOption = useCallback(() => {
    const newOptionText = `Option ${(question.options || []).length + 1}`;
    addQuestionOption(question.id, newOptionText);
  }, [question.id, question.options, addQuestionOption]);

  const handleUpdateOption = useCallback((optionId, updates) => {
    updateQuestionOption(question.id, optionId, updates);
  }, [question.id, updateQuestionOption]);

  const handleRemoveOption = useCallback((optionId) => {
    removeQuestionOption(question.id, optionId);
  }, [question.id, removeQuestionOption]);

  const handleValidationUpdate = useCallback((field, value) => {
    const currentValidation = question.validation || {};
    const newValidation = { ...currentValidation, [field]: value };
    handleQuestionUpdate('validation', newValidation);
  }, [question.validation, handleQuestionUpdate]);

  const renderChoiceOptions = () => {
    if (question.type !== QUESTION_TYPES.SINGLE_CHOICE && question.type !== QUESTION_TYPES.MULTI_CHOICE) {
      return null;
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Answer Options ({question.type === QUESTION_TYPES.SINGLE_CHOICE ? 'Single Choice' : 'Multiple Choice'})
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Option
          </Button>
        </div>
        
        <div className="border border-blue-300 rounded p-3 bg-blue-50 dark:bg-blue-900/20 space-y-2">
          {(question.options || []).length === 0 && (
            <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-300 rounded text-center">
              No options yet. Click "Add Option" to create answer choices.
            </div>
          )}
          {(question.options || []).map((option, index) => (
            <div key={option.id || index} className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-white dark:bg-gray-800">
              <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                <Input
                  value={option.text || option.value || ''}
                  onChange={(e) => handleUpdateOption(option.id, { text: e.target.value, value: e.target.value })}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
              {(question.options || []).length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(option.id)}
                  className="text-red-600 hover:text-red-700 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionTypeSpecificInputs = () => {
    switch (question.type) {
      case QUESTION_TYPES.SINGLE_CHOICE:
      case QUESTION_TYPES.MULTI_CHOICE:
        return renderChoiceOptions();

      case QUESTION_TYPES.SHORT_TEXT:
      case QUESTION_TYPES.LONG_TEXT:
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Placeholder Text
              </label>
              <Input
                value={question.placeholder || ''}
                onChange={(e) => handleQuestionUpdate('placeholder', e.target.value)}
                placeholder="Enter placeholder text..."
              />
            </div>
          </div>
        );

      case QUESTION_TYPES.NUMERIC:
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Placeholder Text
              </label>
              <Input
                value={question.placeholder || ''}
                onChange={(e) => handleQuestionUpdate('placeholder', e.target.value)}
                placeholder="Enter placeholder text..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Value
                </label>
                <Input
                  type="number"
                  value={question.validation?.min || ''}
                  onChange={(e) => handleValidationUpdate('min', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Value
                </label>
                <Input
                  type="number"
                  value={question.validation?.max || ''}
                  onChange={(e) => handleValidationUpdate('max', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        );

      case QUESTION_TYPES.FILE_UPLOAD:
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                File upload functionality will be implemented when connected to a backend service.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderValidationSettings = () => {
    if (!showValidation) return null;

    return (
      <Card className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Validation Rules
        </h4>
        
        {question.type === QUESTION_TYPES.SHORT_TEXT && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Length
              </label>
              <Input
                type="number"
                value={question.validation?.minLength || ''}
                onChange={(e) => handleValidationUpdate('minLength', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Length
              </label>
              <Input
                type="number"
                value={question.validation?.maxLength || ''}
                onChange={(e) => handleValidationUpdate('maxLength', e.target.value ? Number(e.target.value) : null)}
                placeholder="255"
              />
            </div>
          </div>
        )}

        {question.type === QUESTION_TYPES.MULTI_CHOICE && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Selections
              </label>
              <Input
                type="number"
                value={question.validation?.minSelections || ''}
                onChange={(e) => handleValidationUpdate('minSelections', e.target.value ? Number(e.target.value) : null)}
                placeholder="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Selections
              </label>
              <Input
                type="number"
                value={question.validation?.maxSelections || ''}
                onChange={(e) => handleValidationUpdate('maxSelections', e.target.value ? Number(e.target.value) : null)}
                placeholder="No limit"
              />
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderConditionalLogic = () => {
    if (!showConditional) return null;

    return (
      <Card className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Conditional Logic
        </h4>
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Conditional logic functionality will be available in a future update.
          </p>
        </div>
      </Card>
    );
  };

  return (
    <Card className="assessment-question border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4 space-y-4">
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <Badge variant={question.required ? 'default' : 'secondary'}>
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
            {question.required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
            {question.conditionalLogic && (
              <Badge variant="outline" className="text-xs">Conditional</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate?.(question.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove?.(question.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Question Preview */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {question.title || 'Untitled Question'}
          {question.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {question.description}
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Basic Question Settings */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question Type
                </label>
                <Select
                  value={question.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({
                    value,
                    label
                  }))}
                />
              </div>
              <div className="col-span-4 flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => handleQuestionUpdate('required', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required
                  </span>
                </label>
              </div>
            </div>

            {/* Question Content */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question Title *
                </label>
                <Input
                  value={question.title}
                  onChange={(e) => handleQuestionUpdate('title', e.target.value)}
                  placeholder="Enter your question..."
                  className="font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description (optional)
                </label>
                <Textarea
                  value={question.description}
                  onChange={(e) => handleQuestionUpdate('description', e.target.value)}
                  placeholder="Add additional context or instructions..."
                  rows={2}
                />
              </div>
            </div>

            {/* Type-specific inputs */}
            <div className="space-y-4">
              {renderQuestionTypeSpecificInputs()}
            </div>

            {/* Advanced Options removed */}

            {/* Validation Settings */}
            {renderValidationSettings()}

            {/* Conditional Logic Settings */}
            {renderConditionalLogic()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};