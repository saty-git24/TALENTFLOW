import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useJobsStore = create(
  devtools(
    (set, get) => ({
      // State
      jobs: [],
      currentJob: null,
      filters: {
        search: '',
        status: '',
        tags: []
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 10
      },
      loading: false,
      error: null,
      
      // Actions
      setJobs: (jobs) => set({ jobs }),
      
      setCurrentJob: (job) => set({ currentJob: job }),
      
      addJob: (job) => set((state) => ({
        jobs: [job, ...state.jobs]
      })),
      
      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map(job => 
          job.id === id ? { ...job, ...updates } : job
        ),
        currentJob: state.currentJob?.id === id 
          ? { ...state.currentJob, ...updates }
          : state.currentJob
      })),
      
      removeJob: (id) => set((state) => ({
        jobs: state.jobs.filter(job => job.id !== id),
        currentJob: state.currentJob?.id === id ? null : state.currentJob
      })),
      
      reorderJobs: (jobs) => set({ jobs }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearFilters: () => set({
        filters: {
          search: '',
          status: '',
          tags: []
        }
      }),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // Selectors
      getJobById: (id) => {
        const state = get();
        return state.jobs.find(job => job.id === id);
      },
      
      getFilteredJobs: () => {
        const state = get();
        const { jobs, filters } = state;
        
        return jobs.filter(job => {
          const matchesSearch = !filters.search || 
            job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.description?.toLowerCase().includes(filters.search.toLowerCase());
          
          const matchesStatus = !filters.status || job.status === filters.status;
          
          const matchesTags = filters.tags.length === 0 ||
            filters.tags.some(tag => job.tags.includes(tag));
          
          return matchesSearch && matchesStatus && matchesTags;
        });
      }
    }),
    { name: 'jobs-store' }
  )
);