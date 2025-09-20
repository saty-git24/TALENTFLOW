import React from 'react';
import { Plus, Save, Eye, Settings } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { QuestionBuilder } from './QuestionBuilder.jsx';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';

export const AssessmentBuilder = ({ 
  jobId, 
  onSave, 
  onPreview,
  loading = false 
}) => {
  const {
    builderState,
    setBuilderState,
    addSection,
    updateSection,
    removeSection,
    addQuestion,
    updateQuestion,
    removeQuestion,
    validateAssessment,
    getAssessmentStats
  } = useAssessmentsStore();

  const [showSettings, setShowSettings] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState([]);

  const stats = getAssessmentStats();

  const handleTitleChange = (title) => {
    setBuilderState({ title });
  };

  const handleDescriptionChange = (description) => {
    setBuilderState({ description });
  };

  const handleSettingsChange = (settings) => {
    setBuilderState({ settings: { ...builderState.settings, ...settings } });
  };

  const handleSave = async () => {
    const validation = validateAssessment();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    
    const assessmentData = {
      jobId,
      title: builderState.title,
      description: builderState.description,
      sections: builderState.sections,
      settings: builderState.settings
    };

    await onSave(assessmentData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assessment Builder</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span>{stats.totalSections} sections</span>
            <span>{stats.totalQuestions} questions</span>
            <span>{stats.requiredQuestions} required</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button variant="outline" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button onClick={handleSave} loading={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Assessment
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following issues:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
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
            <div className="grid grid-cols-2 gap-4">
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
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={builderState.settings.allowRetake}
                  onChange={(e) => handleSettingsChange({ allowRetake: e.target.checked })}
                  className="mr-2"
                />
                Allow candidates to retake the assessment
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={builderState.settings.randomizeQuestions}
                  onChange={(e) => handleSettingsChange({ randomizeQuestions: e.target.checked })}
                  className="mr-2"
                />
                Randomize question order
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={builderState.settings.showResults}
                  onChange={(e) => handleSettingsChange({ showResults: e.target.checked })}
                  className="mr-2"
                />
                Show results to candidates after submission
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {builderState.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  className="text-lg font-medium"
                  placeholder="Section Title"
                />
                <Textarea
                  value={section.description}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                  placeholder="Section description (optional)"
                  rows={2}
                  className="mt-2"
                />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(section.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove Section
              </Button>
            </CardHeader>
            
            <CardContent>
              {/* Questions */}
              <div className="space-y-4">
                {section.questions.map((question) => (
                  <QuestionBuilder
                    key={question.id}
                    question={question}
                    sectionId={section.id}
                    onUpdate={(updates) => updateQuestion(section.id, question.id, updates)}
                    onRemove={() => removeQuestion(section.id, question.id)}
                  />
                ))}
                
                {/* Add Question Button */}
                <div className="flex justify-center pt-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(section.id, 'short_text')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Text Question
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(section.id, 'single_choice')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Choice Question
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(section.id, 'numeric')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Numeric Question
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Section Button */}
      <div className="text-center">
        <Button variant="outline" onClick={addSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>
    </div>
  );
};