import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CANDIDATE_STAGES } from '../utils/constants.js';
import { isValidStageTransition, validateCandidateState } from '../utils/helpers.js';

export const useCandidatesStore = create(
  devtools(
    (set, get) => ({
      // State
      candidates: [],
      currentCandidate: null,
      candidateTimeline: [],
      candidateNotes: [],
      filters: {
        search: '',
        stage: '',
        jobId: ''
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 50
      },
      kanbanView: false,
      loading: false,
      error: null,
      
      // Actions
      setCandidates: (candidates) => set({ candidates }),
      
      setCurrentCandidate: (candidate) => set({ currentCandidate: candidate }),
      
      addCandidate: (candidate) => set((state) => ({
        candidates: [candidate, ...state.candidates]
      })),
      
      updateCandidate: (id, updates) => set((state) => ({
        candidates: state.candidates.map(candidate => 
          candidate.id === id ? { ...candidate, ...updates } : candidate
        ),
        currentCandidate: state.currentCandidate?.id === id 
          ? { ...state.currentCandidate, ...updates }
          : state.currentCandidate
      })),
      
      removeCandidate: (id) => set((state) => ({
        candidates: state.candidates.filter(candidate => candidate.id !== id),
        currentCandidate: state.currentCandidate?.id === id ? null : state.currentCandidate
      })),
      
      moveCandidateStage: (candidateId, newStage, changedBy = 'user') => set((state) => {
        const candidate = state.candidates.find(c => c.id === candidateId);
        if (!candidate) return state;
        
        // Validate the stage transition
        if (!isValidStageTransition(candidate.stage, newStage)) {
          console.warn(`Invalid stage transition from ${candidate.stage} to ${newStage}`);
          return state;
        }
        
        const updatedCandidate = { ...candidate, stage: newStage, updatedAt: new Date() };
        
        // Validate overall candidate state
        const validation = validateCandidateState(updatedCandidate);
        if (!validation.isValid) {
          console.warn('Candidate state validation failed:', validation.errors);
          return state;
        }
        
        return {
          candidates: state.candidates.map(c => 
            c.id === candidateId ? updatedCandidate : c
          ),
          currentCandidate: state.currentCandidate?.id === candidateId 
            ? updatedCandidate
            : state.currentCandidate
        };
      }),
      
      setCandidateTimeline: (timeline) => set({ candidateTimeline: timeline }),
      
      addTimelineEntry: (entry) => set((state) => ({
        candidateTimeline: [...state.candidateTimeline, entry]
      })),
      
      setCandidateNotes: (notes) => set({ candidateNotes: notes }),
      
      addCandidateNote: (note) => set((state) => ({
        candidateNotes: [note, ...state.candidateNotes]
      })),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearFilters: () => set({
        filters: {
          search: '',
          stage: '',
          jobId: ''
        }
      }),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      setKanbanView: (kanbanView) => set({ kanbanView }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // Selectors
      getCandidateById: (id) => {
        const state = get();
        return state.candidates.find(candidate => candidate.id === id);
      },
      
      getCandidatesByStage: () => {
        const state = get();
        const stages = {};
        
        Object.values(CANDIDATE_STAGES).forEach(stage => {
          stages[stage] = state.candidates.filter(candidate => {
            const candidateJobId = candidate.jobId != null ? String(candidate.jobId) : '';
            const filterJobId = state.filters.jobId != null ? String(state.filters.jobId) : '';
            return (
              candidate.stage === stage &&
              (!filterJobId || candidateJobId === filterJobId) &&
              (!state.filters.search || 
                candidate.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                candidate.email.toLowerCase().includes(state.filters.search.toLowerCase()))
            );
          });
        });
        
        return stages;
      },
      
      getFilteredCandidates: () => {
        const state = get();
        const { candidates, filters } = state;
        
        return candidates.filter(candidate => {
          const matchesSearch = !filters.search || 
            candidate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            candidate.email.toLowerCase().includes(filters.search.toLowerCase());
          const matchesStage = !filters.stage || candidate.stage === filters.stage;
          const candidateJobId = candidate.jobId != null ? String(candidate.jobId) : '';
          const filterJobId = filters.jobId != null ? String(filters.jobId) : '';
          const matchesJob = !filterJobId || candidateJobId === filterJobId;
          return matchesSearch && matchesStage && matchesJob;
        });
      },
      
      getCandidateStats: () => {
        const state = get();
        const stats = {};
        
        Object.values(CANDIDATE_STAGES).forEach(stage => {
          stats[stage] = state.candidates.filter(c => c.stage === stage).length;
        });
        
        stats.total = state.candidates.length;
        return stats;
      }
    }),
    { name: 'candidates-store' }
  )
);