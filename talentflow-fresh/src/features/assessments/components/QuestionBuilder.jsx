import React from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../../utils/constants.js';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';

export const QuestionBuilder = ({
  question,
  sectionId,
  onUpdate,
  onRemove
}) => {
  const { addQuestionOption, updateQuestionOption, removeQuestionOption } = useAssessmentsStore();

  const handleTypeChange = (newType) => {
    const updates = { type: newType };
    
    // Add default options for choice questions
    if ((newType === QUESTION_TYPES.SINGLE_CHOICE || newType === QUESTION_TYPES.MULTI_CHOICE) 
        && !question.options) {
      updates.options = [
        { id: 'opt1', label: 'Option 1', value: 'option1' },
        { id: 'opt2', label: 'Option 2', value: 'option2' }
      ];
    }
    
    // Clear options for non-choice questions
    if (newType !== QUESTION_TYPES.SINGLE_CHOICE && newType !== QUESTION_TYPES.MULTI_CHOICE) {
      updates.options = undefined;
    }
    
    onUpdate(updates);
  };

  const handleValidationChange = (field, value) => {
    const validation = { ...question.validation };
    if (value === '' || value === null || value === undefined) {
      delete validation[field];
    } else {
      validation[field] = value;
    }
    onUpdate({ validation });
  };

  const renderQuestionTypeFields = () => {
    switch (question.type) {
      case QUESTION_TYPES.SINGLE_CHOICE:
      case QUESTION_TYPES.MULTI_CHOICE:
        return (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Options</h5>
            {(question.options || []).map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateQuestionOption(sectionId, question.id, option.id, { 
                    label: e.target.value,
                    value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  })}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestionOption(sectionId, question.id, option.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestionOption(sectionId, question.id)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          </div>
        );

      case QUESTION_TYPES.SHORT_TEXT:
      case QUESTION_TYPES.LONG_TEXT:
        return (
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Min Length"
              value={question.validation?.minLength || ''}
              onChange={(e) => handleValidationChange('minLength', 
                e.target.value ? parseInt(e.target.value) : null)}
            />
            <Input
              type="number"
              label="Max Length"
              value={question.validation?.maxLength || ''}
              onChange={(e) => handleValidationChange('maxLength', 
                e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        );

      case QUESTION_TYPES.NUMERIC:
        return (
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Minimum Value"
              value={question.validation?.min || ''}
              onChange={(e) => handleValidationChange('min', 
                e.target.value ? parseFloat(e.target.value) : null)}
            />
            <Input
              type="number"
              label="Maximum Value"
              value={question.validation?.max || ''}
              onChange={(e) => handleValidationChange('max', 
                e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
        );

      case QUESTION_TYPES.FILE_UPLOAD:
        return (
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
            File upload questions allow candidates to upload documents, portfolios, or other files.
            File validation and storage would be handled by your backend system.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="assessment-question">
      <CardContent className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Question Type"
                value={question.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({
                  value,
                  label
                }))}
              />
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => onUpdate({ required: e.target.checked })}
                    className="mr-2"
                  />
                  Required
                </label>
              </div>
            </div>
            
            <Input
              label="Question Title"
              required
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter your question here..."
            />
            
            <Textarea
              label="Description (Optional)"
              value={question.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Additional context or instructions..."
              rows={2}
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 ml-4"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Question Type Specific Fields */}
        {renderQuestionTypeFields()}

        {/* Conditional Logic */}
        <div className="border-t pt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Conditional Logic (Advanced)
            </summary>
            <div className="mt-3 space-y-3">
              <p className="text-xs text-gray-500">
                Show this question only when certain conditions are met
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Depends on question ID"
                  value={question.conditionalLogic?.dependsOn || ''}
                  onChange={(e) => onUpdate({
                    conditionalLogic: {
                      ...question.conditionalLogic,
                      dependsOn: e.target.value
                    }
                  })}
                />
                
                <Select
                  value={question.conditionalLogic?.condition || ''}
                  onChange={(e) => onUpdate({
                    conditionalLogic: {
                      ...question.conditionalLogic,
                      condition: e.target.value
                    }
                  })}
                  options={[
                    { label: 'Select condition...', value: '' },
                    { label: 'Equals', value: 'equals' },
                    { label: 'Not equals', value: 'not_equals' },
                    { label: 'Contains', value: 'contains' },
                    { label: 'Not contains', value: 'not_contains' }
                  ]}
                />
                
                <Input
                  placeholder="Value"
                  value={question.conditionalLogic?.value || ''}
                  onChange={(e) => onUpdate({
                    conditionalLogic: {
                      ...question.conditionalLogic,
                      value: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};