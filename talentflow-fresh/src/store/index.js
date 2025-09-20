import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Global store for shared UI state
export const useAppStore = create(
  devtools(
    (set, get) => ({
      // UI state
      sidebarOpen: true,
      loading: false,
      error: null,
      
      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Toast notifications
      toasts: [],
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { id: Date.now(), ...toast }]
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      }))
    }),
    { name: 'app-store' }
  )
);