import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateId } from '../utils/helpers.js';
import { QUESTION_TYPES } from '../utils/constants.js';

export const useAssessmentsStore = create(
  devtools(
    (set, get) => ({
      // State
      currentAssessment: null,
      assessmentResponses: {},
      builderState: {
        sections: [],
        title: '',
        description: '',
        settings: {
          allowRetake: false,
          randomizeQuestions: false,
          showResults: false,
          passingScore: 70,
          timeLimit: null
        }
      },
      previewMode: false,
      loading: false,
      error: null,
      
      // Actions
      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
      
      setBuilderState: (state) => set((prevState) => ({
        builderState: { ...prevState.builderState, ...state }
      })),
      
      resetBuilder: () => set({
        builderState: {
          sections: [],
          title: '',
          description: '',
          settings: {
            allowRetake: false,
            randomizeQuestions: false,
            showResults: false,
            passingScore: 70,
            timeLimit: null
          }
        }
      }),
      
      loadAssessmentToBuilder: (assessment) => set({
        builderState: {
          sections: assessment.sections || [],
          title: assessment.title || '',
          description: assessment.description || '',
          settings: assessment.settings || {
            allowRetake: false,
            randomizeQuestions: false,
            showResults: false,
            passingScore: 70,
            timeLimit: null
          }
        }
      }),
      
      // Section management
      addSection: () => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: [
            ...state.builderState.sections,
            {
              id: generateId(),
              title: 'New Section',
              description: '',
              questions: []
            }
          ]
        }
      })),
      
      updateSection: (sectionId, updates) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId ? { ...section, ...updates } : section
          )
        }
      })),
      
      removeSection: (sectionId) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.filter(section => section.id !== sectionId)
        }
      })),
      
      reorderSections: (newSections) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: newSections
        }
      })),
      
      // Question management
      addQuestion: (sectionId, questionType = QUESTION_TYPES.SHORT_TEXT) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: [
                    ...section.questions,
                    {
                      id: generateId(),
                      type: questionType,
                      title: 'New Question',
                      description: '',
                      required: false,
                      options: questionType === QUESTION_TYPES.SINGLE_CHOICE || questionType === QUESTION_TYPES.MULTI_CHOICE 
                        ? [
                            { id: generateId(), label: 'Option 1', value: 'option1' },
                            { id: generateId(), label: 'Option 2', value: 'option2' }
                          ] 
                        : undefined,
                      validation: {},
                      conditionalLogic: {}
                    }
                  ]
                }
              : section
          )
        }
      })),
      
      updateQuestion: (sectionId, questionId, updates) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map(question =>
                    question.id === questionId ? { ...question, ...updates } : question
                  )
                }
              : section
          )
        }
      })),
      
      removeQuestion: (sectionId, questionId) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.filter(question => question.id !== questionId)
                }
              : section
          )
        }
      })),
      
      reorderQuestions: (sectionId, newQuestions) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? { ...section, questions: newQuestions }
              : section
          )
        }
      })),
      
      // Question option management
      addQuestionOption: (sectionId, questionId) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map(question =>
                    question.id === questionId
                      ? {
                          ...question,
                          options: [
                            ...(question.options || []),
                            {
                              id: generateId(),
                              label: `Option ${(question.options?.length || 0) + 1}`,
                              value: `option${(question.options?.length || 0) + 1}`
                            }
                          ]
                        }
                      : question
                  )
                }
              : section
          )
        }
      })),
      
      updateQuestionOption: (sectionId, questionId, optionId, updates) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map(question =>
                    question.id === questionId
                      ? {
                          ...question,
                          options: question.options?.map(option =>
                            option.id === optionId ? { ...option, ...updates } : option
                          )
                        }
                      : question
                  )
                }
              : section
          )
        }
      })),
      
      removeQuestionOption: (sectionId, questionId, optionId) => set((state) => ({
        builderState: {
          ...state.builderState,
          sections: state.builderState.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map(question =>
                    question.id === questionId
                      ? {
                          ...question,
                          options: question.options?.filter(option => option.id !== optionId)
                        }
                      : question
                  )
                }
              : section
          )
        }
      })),
      
      // Assessment response management
      setAssessmentResponse: (questionId, value) => set((state) => ({
        assessmentResponses: {
          ...state.assessmentResponses,
          [questionId]: {
            questionId,
            value,
            timestamp: new Date()
          }
        }
      })),
      
      clearAssessmentResponses: () => set({ assessmentResponses: {} }),
      
      getAssessmentResponses: () => {
        const state = get();
        return state.assessmentResponses;
      },
      
      // Preview mode
      setPreviewMode: (preview) => set({ previewMode: preview }),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Selectors
      getQuestionById: (questionId) => {
        const state = get();
        for (const section of state.builderState.sections) {
          const question = section.questions.find(q => q.id === questionId);
          if (question) return question;
        }
        return null;
      },
      
      getSectionById: (sectionId) => {
        const state = get();
        return state.builderState.sections.find(section => section.id === sectionId);
      },
      
      getAssessmentStats: () => {
        const state = get();
        const totalSections = state.builderState.sections.length;
        const totalQuestions = state.builderState.sections.reduce(
          (acc, section) => acc + section.questions.length,
          0
        );
        const requiredQuestions = state.builderState.sections.reduce(
          (acc, section) => acc + section.questions.filter(q => q.required).length,
          0
        );
        
        return {
          totalSections,
          totalQuestions,
          requiredQuestions,
          optionalQuestions: totalQuestions - requiredQuestions
        };
      },
      
      validateAssessment: () => {
        const state = get();
        const errors = [];
        
        if (!state.builderState.title?.trim()) {
          errors.push('Assessment title is required');
        }
        
        if (state.builderState.sections.length === 0) {
          errors.push('At least one section is required');
        }
        
        state.builderState.sections.forEach((section, sectionIndex) => {
          if (!section.title?.trim()) {
            errors.push(`Section ${sectionIndex + 1} title is required`);
          }
          
          if (section.questions.length === 0) {
            errors.push(`Section "${section.title}" must have at least one question`);
          }
          
          section.questions.forEach((question, questionIndex) => {
            if (!question.title?.trim()) {
              errors.push(`Question ${questionIndex + 1} in section "${section.title}" must have a title`);
            }
            
            if (
              (question.type === QUESTION_TYPES.SINGLE_CHOICE || question.type === QUESTION_TYPES.MULTI_CHOICE) &&
              (!question.options || question.options.length < 2)
            ) {
              errors.push(`Question "${question.title}" must have at least 2 options`);
            }
          });
        });
        
        return {
          isValid: errors.length === 0,
          errors
        };
      }
    }),
    { name: 'assessments-store' }
  )
);