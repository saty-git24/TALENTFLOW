import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers.js';
import { QUESTION_TYPES } from '../utils/constants.js';

// Helper functions for local storage operations
const AUTO_SAVE_DELAY = 1000; // 1 second

export const useAssessmentsStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        currentAssessment: null,
        savedAssessments: [],
        deletedAssessmentIds: [], // Track deleted assessment IDs to prevent reloading from DB
        assessmentResponses: {},
        builderState: {
          id: null,
          jobId: null,
          title: '',
          description: '',
          sections: [],
          settings: {
            allowRetake: false,
            randomizeQuestions: false,
            showResults: false,
            passingScore: 70,
            timeLimit: null,
            instructions: ''
          },
          createdAt: null,
          updatedAt: null
        },
        previewMode: false,
        loading: false,
        error: null,
        autoSaveTimeout: null,
        
        // Enhanced Actions
        setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
        
        setBuilderState: (updates) => {
          set((state) => {
            const newState = {
              builderState: {
                ...state.builderState,
                ...updates,
                updatedAt: new Date().toISOString()
              }
            };
            
            // Auto-save after changes
            get().scheduleAutoSave();
            return newState;
          });
        },

        initializeBuilder: (jobId, existingAssessment = null) => {
          const baseState = {
            id: existingAssessment?.id || generateId(),
            jobId: jobId,
            title: existingAssessment?.title || '',
            description: existingAssessment?.description || '',
            sections: existingAssessment?.sections || [],
            settings: {
              allowRetake: false,
              randomizeQuestions: false,
              showResults: false,
              passingScore: 70,
              timeLimit: null,
              instructions: '',
              ...existingAssessment?.settings
            },
            createdAt: existingAssessment?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set({ builderState: baseState });
        },

        // Auto-save functionality
        scheduleAutoSave: () => {
          const { autoSaveTimeout } = get();
          if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          
          const newTimeout = setTimeout(() => {
            get().saveAssessmentLocally();
          }, AUTO_SAVE_DELAY);
          
          set({ autoSaveTimeout: newTimeout });
        },

        saveAssessmentLocally: () => {
          const { builderState } = get();
          const assessmentKey = `assessment_${builderState.jobId}_${builderState.id}`;
          localStorage.setItem(assessmentKey, JSON.stringify(builderState));
        },

        loadAssessmentLocally: (jobId, assessmentId) => {
          const assessmentKey = `assessment_${jobId}_${assessmentId}`;
          const saved = localStorage.getItem(assessmentKey);
          if (saved) {
            try {
              const assessment = JSON.parse(saved);
              // Patch: Ensure all options have both text and value fields
              if (assessment.sections) {
                assessment.sections.forEach(section => {
                  section.questions?.forEach(question => {
                    if (Array.isArray(question.options)) {
                      question.options = question.options.map(opt => ({
                        text: opt.text,
                        value: opt.value ?? opt.text,
                        id: opt.id ?? undefined
                      }));
                    }
                  });
                });
              }
              set({ builderState: assessment });
              return assessment;
            } catch (error) {
              console.error('Failed to load assessment from localStorage:', error);
            }
          }
          return null;
        },

        // Section Management
        addSection: (title = 'New Section') => {
          const newSection = {
            id: generateId(),
            title,
            description: '',
            questions: [],
            order: get().builderState.sections.length,
            createdAt: new Date().toISOString()
          };
          
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: [...state.builderState.sections, newSection],
              updatedAt: new Date().toISOString()
            }
          }));
          
          get().scheduleAutoSave();
          return newSection.id;
        },

        updateSection: (sectionId, updates) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section =>
                section.id === sectionId 
                  ? { ...section, ...updates, updatedAt: new Date().toISOString() }
                  : section
              ),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        removeSection: (sectionId) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.filter(section => section.id !== sectionId),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        reorderSections: (sections) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: sections.map((section, index) => ({ ...section, order: index })),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        // Question Management
        addQuestion: (sectionId, questionType = QUESTION_TYPES.SHORT_TEXT) => {
          const getDefaultValidation = (type) => {
            switch (type) {
              case QUESTION_TYPES.SHORT_TEXT:
                return { maxLength: 255 };
              case QUESTION_TYPES.LONG_TEXT:
                return { maxLength: 1000 };
              case QUESTION_TYPES.NUMERIC:
                return { min: null, max: null };
              case QUESTION_TYPES.FILE_UPLOAD:
                return { maxFileSize: 10485760, allowedTypes: ['pdf', 'doc', 'docx'] };
              default:
                return {};
            }
          };

          const newQuestion = {
            id: generateId(),
            type: questionType,
            title: '',
            description: '',
            required: false,
            options: questionType === QUESTION_TYPES.SINGLE_CHOICE || questionType === QUESTION_TYPES.MULTI_CHOICE 
              ? [
                  { id: generateId(), text: 'Option 1', value: 'option1' },
                  { id: generateId(), text: 'Option 2', value: 'option2' }
                ]
              : [],
            validation: getDefaultValidation(questionType),
            conditionalLogic: null,
            placeholder: '',
            order: 0,
            createdAt: new Date().toISOString()
          };

          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => {
                if (section.id === sectionId) {
                  const questions = [...section.questions, newQuestion];
                  newQuestion.order = questions.length - 1;
                  return { ...section, questions };
                }
                return section;
              }),
              updatedAt: new Date().toISOString()
            }
          }));
          
          get().scheduleAutoSave();
          return newQuestion.id;
        },

        updateQuestion: (questionId, updates) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => ({
                ...section,
                questions: section.questions.map(question =>
                  question.id === questionId 
                    ? { ...question, ...updates, updatedAt: new Date().toISOString() }
                    : question
                )
              })),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        removeQuestion: (sectionId, questionId) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => {
                if (section.id === sectionId) {
                  return {
                    ...section,
                    questions: section.questions.filter(q => q.id !== questionId)
                  };
                }
                return section;
              }),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        reorderQuestions: (sectionId, questions) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => {
                if (section.id === sectionId) {
                  return {
                    ...section,
                    questions: questions.map((question, index) => ({ ...question, order: index }))
                  };
                }
                return section;
              }),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        // Question Options Management (for choice questions)
        addQuestionOption: (questionId, text = 'New Option') => {
          const newOption = {
            id: generateId(),
            text,
            value: text.toLowerCase().replace(/\s+/g, '_')
          };

          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => ({
                ...section,
                questions: section.questions.map(question => {
                  if (question.id === questionId) {
                    return {
                      ...question,
                      options: [...(question.options || []), newOption]
                    };
                  }
                  return question;
                })
              })),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        updateQuestionOption: (questionId, optionId, updates) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => ({
                ...section,
                questions: section.questions.map(question => {
                  if (question.id === questionId) {
                    return {
                      ...question,
                      options: question.options?.map(option =>
                        option.id === optionId ? { ...option, ...updates } : option
                      ) || []
                    };
                  }
                  return question;
                })
              })),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },

        removeQuestionOption: (questionId, optionId) => {
          set((state) => ({
            builderState: {
              ...state.builderState,
              sections: state.builderState.sections.map(section => ({
                ...section,
                questions: section.questions.map(question => {
                  if (question.id === questionId) {
                    return {
                      ...question,
                      options: question.options?.filter(option => option.id !== optionId) || []
                    };
                  }
                  return question;
                })
              })),
              updatedAt: new Date().toISOString()
            }
          }));
          get().scheduleAutoSave();
        },
        // Validation and Conditional Logic
        setConditionalLogic: (questionId, condition) => {
          get().updateQuestion(questionId, { conditionalLogic: condition });
        },

        evaluateConditionalLogic: (questionId, responses) => {
          const question = get().getQuestionById(questionId);
          if (!question?.conditionalLogic) return true;

          const { dependsOnQuestion, condition, value } = question.conditionalLogic;
          const dependentResponse = responses[dependsOnQuestion];

          if (!dependentResponse) return false;

          switch (condition) {
            case 'equals':
              return dependentResponse.value === value;
            case 'not_equals':
              return dependentResponse.value !== value;
            case 'contains':
              return dependentResponse.value?.includes?.(value);
            case 'greater_than':
              return Number(dependentResponse.value) > Number(value);
            case 'less_than':
              return Number(dependentResponse.value) < Number(value);
            default:
              return true;
          }
        },

        // Assessment Response Management
        setAssessmentResponse: (questionId, value) => {
          set((state) => ({
            assessmentResponses: {
              ...state.assessmentResponses,
              [questionId]: {
                questionId,
                value,
                timestamp: new Date().toISOString()
              }
            }
          }));

          // Save responses to localStorage
          const { assessmentResponses } = get();
          const responseKey = `responses_${get().builderState.id}`;
          localStorage.setItem(responseKey, JSON.stringify(assessmentResponses));
        },

        clearAssessmentResponses: () => {
          set({ assessmentResponses: {} });
          const responseKey = `responses_${get().builderState.id}`;
          localStorage.removeItem(responseKey);
        },

        loadAssessmentResponses: (assessmentId) => {
          const responseKey = `responses_${assessmentId}`;
          const saved = localStorage.getItem(responseKey);
          if (saved) {
            try {
              const responses = JSON.parse(saved);
              set({ assessmentResponses: responses });
              return responses;
            } catch (error) {
              console.error('Failed to load responses from localStorage:', error);
            }
          }
          return {};
        },

        validateResponse: (questionId, value) => {
          const question = get().getQuestionById(questionId);
          if (!question) return { isValid: false, error: 'Question not found' };

          const errors = [];

          // Required validation
          if (question.required && (!value || value.toString().trim() === '')) {
            errors.push('This field is required');
          }

          // Type-specific validation
          if (value && question.validation) {
            const { validation } = question;

            switch (question.type) {
              case QUESTION_TYPES.SHORT_TEXT:
              case QUESTION_TYPES.LONG_TEXT:
                if (validation.maxLength && value.length > validation.maxLength) {
                  errors.push(`Maximum ${validation.maxLength} characters allowed`);
                }
                if (validation.minLength && value.length < validation.minLength) {
                  errors.push(`Minimum ${validation.minLength} characters required`);
                }
                break;

              case QUESTION_TYPES.NUMERIC:
                const numValue = Number(value);
                if (isNaN(numValue)) {
                  errors.push('Must be a valid number');
                } else {
                  if (validation.min !== null && numValue < validation.min) {
                    errors.push(`Must be at least ${validation.min}`);
                  }
                  if (validation.max !== null && numValue > validation.max) {
                    errors.push(`Must be at most ${validation.max}`);
                  }
                }
                break;

              case QUESTION_TYPES.MULTI_CHOICE:
                if (validation.minSelections && value.length < validation.minSelections) {
                  errors.push(`Select at least ${validation.minSelections} options`);
                }
                if (validation.maxSelections && value.length > validation.maxSelections) {
                  errors.push(`Select at most ${validation.maxSelections} options`);
                }
                break;
            }
          }

          return {
            isValid: errors.length === 0,
            errors
          };
        },

        // Utility Actions
        setPreviewMode: (preview) => set({ previewMode: preview }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        resetBuilder: () => {
          set({
            builderState: {
              id: null,
              jobId: null,
              title: '',
              description: '',
              sections: [],
              settings: {
                allowRetake: false,
                randomizeQuestions: false,
                showResults: false,
                passingScore: 70,
                timeLimit: null,
                instructions: ''
              },
              createdAt: null,
              updatedAt: null
            }
          });
        },

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

        // Save assessment to the saved assessments list
        saveAssessment: () => {
          const { builderState, savedAssessments } = get();
          
          // Create a copy of the current builder state
          const assessmentToSave = {
            ...builderState,
            id: builderState.id || generateId(),
            updatedAt: new Date().toISOString()
          };

          // Check if assessment already exists (update) or is new (create)
          const existingIndex = savedAssessments.findIndex(
            assessment => assessment.id === assessmentToSave.id
          );

          let newSavedAssessments;
          if (existingIndex >= 0) {
            // Update existing assessment
            newSavedAssessments = [...savedAssessments];
            newSavedAssessments[existingIndex] = assessmentToSave;
          } else {
            // Add new assessment
            if (!assessmentToSave.createdAt) {
              assessmentToSave.createdAt = new Date().toISOString();
            }
            newSavedAssessments = [...savedAssessments, assessmentToSave];
          }

          set({ 
            savedAssessments: newSavedAssessments,
            currentAssessment: assessmentToSave
          });

          return assessmentToSave;
        },

        // Load assessment from saved assessments to builder
        loadAssessmentToBuilder: (assessment) => {
          set({
            builderState: {
              ...assessment,
              updatedAt: new Date().toISOString()
            },
            currentAssessment: assessment
          });
        },

        // Get all saved assessments
        getAllAssessments: () => {
          return get().savedAssessments;
        },

        // Set saved assessments (useful for loading from external sources)
        setSavedAssessments: (assessments) => {
          set({ savedAssessments: assessments });
        },

        // Get deleted assessment IDs
        getDeletedAssessmentIds: () => {
          return get().deletedAssessmentIds;
        },

        // Get assessment by ID
        getAssessmentById: (assessmentId) => {
          return get().savedAssessments.find(assessment => assessment.id === assessmentId);
        },

        // Get assessments by job ID
        getAssessmentsByJobId: (jobId) => {
          return get().savedAssessments.filter(assessment => assessment.jobId === jobId);
        },

        // Delete assessment
        deleteAssessment: (assessmentId) => {
          set((state) => ({
            savedAssessments: state.savedAssessments.filter(assessment => assessment.id !== assessmentId),
            deletedAssessmentIds: [...state.deletedAssessmentIds, assessmentId]
          }));
        },

        // Reset builder to empty state
        resetBuilder: (jobId = null) => {
          set({
            builderState: {
              id: generateId(),
              jobId: jobId,
              title: '',
              description: '',
              sections: [],
              settings: {
                allowRetake: false,
                randomizeQuestions: false,
                showResults: false,
                passingScore: 70,
                timeLimit: null,
                instructions: ''
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            currentAssessment: null
          });
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
        },

        getVisibleQuestions: (sectionId, responses = null) => {
          const section = get().getSectionById(sectionId);
          if (!section) return [];

          const currentResponses = responses || get().assessmentResponses;
          
          return section.questions.filter(question => {
            return get().evaluateConditionalLogic(question.id, currentResponses);
          });
        }
      }),
      {
        name: 'assessments-store',
        partialize: (state) => ({
          builderState: state.builderState,
          savedAssessments: state.savedAssessments,
          deletedAssessmentIds: state.deletedAssessmentIds,
          assessmentResponses: state.assessmentResponses
        })
      }
    ),
    { name: 'assessments-store' }
  )
);