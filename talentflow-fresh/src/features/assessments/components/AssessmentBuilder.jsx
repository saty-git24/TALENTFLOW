import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Save, Settings, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { QuestionBuilder } from './QuestionBuilder.jsx';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../../utils/constants.js';

export const AssessmentBuilder = ({ 
  jobId, 
  onSave, 
  loading = false 
}) => {
  const {
    builderState,
    setBuilderState,
    initializeBuilder,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    validateAssessment,
    getAssessmentStats,
    scheduleAutoSave,
    saveAssessment
  } = useAssessmentsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [draggedSection, setDraggedSection] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  const stats = getAssessmentStats();

  // Initialize builder on mount
  useEffect(() => {
    if (jobId && !builderState.jobId) {
      initializeBuilder(jobId);
    }
  }, [jobId, builderState.jobId, initializeBuilder]);

  const handleTitleChange = useCallback((title) => {
    setBuilderState({ title });
  }, [setBuilderState]);

  const handleDescriptionChange = useCallback((description) => {
    setBuilderState({ description });
  }, [setBuilderState]);

  const handleSettingsChange = useCallback((settings) => {
    setBuilderState({ settings: { ...builderState.settings, ...settings } });
  }, [builderState.settings, setBuilderState]);

  const handleSave = useCallback(async () => {
    const validation = validateAssessment();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSaveStatus('error');
      return;
    }

    setValidationErrors([]);
    setSaveStatus('saving');
    
    try {
      // Save assessment to store (local storage) - this always works
      const savedAssessment = saveAssessment();
      
      // Try to call the external onSave handler if provided (for API calls, etc.)
      if (onSave) {
        try {
          await onSave(savedAssessment);
        } catch (apiError) {
          // If API fails, still consider the save successful since local storage worked
          console.warn('API save failed, but assessment saved locally:', apiError);
        }
      }
      
      // Show success status
      setSaveStatus('success');
      console.log('Assessment saved successfully');
      
      // Clear success status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
      
    } catch (error) {
      console.error('Failed to save assessment:', error);
      setValidationErrors(['Failed to save assessment. Please try again.']);
      setSaveStatus('error');
    }
  }, [validateAssessment, saveAssessment, onSave]);

  const handleAddSection = useCallback((title = 'New Section') => {
    const sectionId = addSection(title);
    setExpandedSections(prev => new Set([...prev, sectionId]));
    return sectionId;
  }, [addSection]);

  const handleDuplicateSection = useCallback((sectionId) => {
    const section = builderState.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newSectionId = addSection(`${section.title} (Copy)`);
    const newSection = builderState.sections.find(s => s.id === newSectionId);
    
    // Copy section properties
    updateSection(newSectionId, {
      description: section.description,
      questions: []
    });

    // Copy all questions
    section.questions.forEach(question => {
      const newQuestionId = addQuestion(newSectionId, question.type);
      updateQuestion(newQuestionId, {
        title: question.title,
        description: question.description,
        required: question.required,
        options: question.options ? [...question.options] : [],
        validation: { ...question.validation },
        conditionalLogic: question.conditionalLogic ? { ...question.conditionalLogic } : null,
        placeholder: question.placeholder
      });
    });

    setExpandedSections(prev => new Set([...prev, newSectionId]));
  }, [builderState.sections, addSection, updateSection, addQuestion, updateQuestion]);

  const handleMoveSectionUp = useCallback((sectionIndex) => {
    if (sectionIndex === 0) return;
    
    const newSections = [...builderState.sections];
    [newSections[sectionIndex - 1], newSections[sectionIndex]] = 
    [newSections[sectionIndex], newSections[sectionIndex - 1]];
    
    reorderSections(newSections);
  }, [builderState.sections, reorderSections]);

  const handleMoveSectionDown = useCallback((sectionIndex) => {
    if (sectionIndex === builderState.sections.length - 1) return;
    
    const newSections = [...builderState.sections];
    [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
    [newSections[sectionIndex + 1], newSections[sectionIndex]];
    
    reorderSections(newSections);
  }, [builderState.sections, reorderSections]);

  const toggleSectionExpanded = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handleDuplicateQuestion = useCallback((questionId) => {
    const section = builderState.sections.find(s => 
      s.questions.some(q => q.id === questionId)
    );
    if (!section) return;

    const question = section.questions.find(q => q.id === questionId);
    if (!question) return;

    const newQuestionId = addQuestion(section.id, question.type);
    updateQuestion(newQuestionId, {
      title: `${question.title} (Copy)`,
      description: question.description,
      required: question.required,
      options: question.options ? [...question.options] : [],
      validation: { ...question.validation },
      conditionalLogic: question.conditionalLogic ? { ...question.conditionalLogic } : null,
      placeholder: question.placeholder
    });
  }, [builderState.sections, addQuestion, updateQuestion]);

  const renderSectionControls = (section, sectionIndex) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMoveSectionUp(sectionIndex)}
          disabled={sectionIndex === 0}
          className="p-1"
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMoveSectionDown(sectionIndex)}
          disabled={sectionIndex === builderState.sections.length - 1}
          className="p-1"
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
      
      <Badge variant="outline" className="text-xs">
        {section.questions.length} questions
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDuplicateSection(section.id)}
        className="text-xs"
      >
        <Copy className="w-3 h-3 mr-1" />
        Duplicate
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeSection(section.id)}
        className="text-xs text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Delete
      </Button>
    </div>
  );

  const renderQuestionTypeSelector = (sectionId) => (
    <div className="flex flex-wrap gap-2 justify-center pt-4">
      {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          onClick={() => {
            const questionId = addQuestion(sectionId, type);
            // Auto-expand the section when adding a question
            setExpandedSections(prev => new Set([...prev, sectionId]));
          }}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Assessment Builder
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span>{stats.totalSections} sections</span>
            <span>{stats.totalQuestions} questions</span>
            <span>{stats.requiredQuestions} required</span>
            {builderState.updatedAt && (
              <span className="text-xs text-green-600">
                Auto-saved {new Date(builderState.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
            className={showSettings ? 'bg-blue-50 text-blue-700' : ''}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            onClick={handleSave} 
            loading={loading || saveStatus === 'saving'}
            className={saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Assessment'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="text-red-800 dark:text-red-200 font-medium mb-2">Please fix the following issues:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 text-sm">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Assessment Title"
            required
            value={builderState.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Software Engineer Technical Assessment"
          />
          
          <Textarea
            label="Description"
            value={builderState.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Brief description of what this assessment evaluates..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Time Limit (minutes)"
                type="number"
                value={builderState.settings.timeLimit || ''}
                onChange={(e) => handleSettingsChange({ 
                  timeLimit: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="No limit"
              />
              
              <Input
                label="Passing Score (%)"
                type="number"
                min="0"
                max="100"
                value={builderState.settings.passingScore || ''}
                onChange={(e) => handleSettingsChange({ 
                  passingScore: e.target.value ? parseInt(e.target.value) : 70 
                })}
              />
            </div>

            <Textarea
              label="Instructions for Candidates"
              value={builderState.settings.instructions || ''}
              onChange={(e) => handleSettingsChange({ instructions: e.target.value })}
              placeholder="Add any special instructions for candidates taking this assessment..."
              rows={3}
            />
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={builderState.settings.allowRetake}
                  onChange={(e) => handleSettingsChange({ allowRetake: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow candidates to retake the assessment
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={builderState.settings.randomizeQuestions}
                  onChange={(e) => handleSettingsChange({ randomizeQuestions: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Randomize question order
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={builderState.settings.showResults}
                  onChange={(e) => handleSettingsChange({ showResults: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show results to candidates after submission
                </span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {builderState.sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <Card key={section.id} className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="cursor-pointer" onClick={() => toggleSectionExpanded(section.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button className="text-gray-500 hover:text-gray-700">
                      {isExpanded ? '▼' : '▶'}
                    </button>
                    <div className="flex-1">
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateSection(section.id, { title: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-lg font-medium border-0 shadow-none p-0 h-auto"
                        placeholder="Section Title"
                      />
                    </div>
                  </div>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderSectionControls(section, sectionIndex)}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Textarea
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                      placeholder="Section description (optional)"
                      rows={2}
                      className="border-0 shadow-none p-0"
                    />
                  </div>
                )}
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  {/* Questions */}
                  <div className="space-y-4">
                    {section.questions.map((question) => (
                      <QuestionBuilder
                        key={question.id}
                        question={question}
                        sectionId={section.id}
                        onUpdate={(questionId, updates) => updateQuestion(questionId, updates)}
                        onRemove={() => removeQuestion(section.id, question.id)}
                        onDuplicate={() => handleDuplicateQuestion(question.id)}
                      />
                    ))}
                    
                    {/* Add Question Buttons */}
                    {renderQuestionTypeSelector(section.id)}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => handleAddSection()}
          className="min-w-40"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>
    </div>
  );
};