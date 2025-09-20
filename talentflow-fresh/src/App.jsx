import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Lazy load pages for better performance
const JobsPage = React.lazy(() => import('./features/jobs/pages/JobsPage.jsx'));
const JobDetailPage = React.lazy(() => import('./features/jobs/pages/JobDetailPage.jsx'));
const CandidatesPage = React.lazy(() => import('./features/candidates/pages/CandidatesPage.jsx'));
const CandidateDetailPage = React.lazy(() => import('./features/candidates/pages/CandidateDetailPage.jsx'));
const KanbanPage = React.lazy(() => import('./features/candidates/pages/KanbanPage.jsx'));
const AssessmentPage = React.lazy(() => import('./features/assessments/pages/AssessmentPage.jsx'));
const AssessmentTakePage = React.lazy(() => import('./features/assessments/pages/AssessmentTakePage.jsx'));

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/jobs" replace />} />
          
          {/* Jobs routes */}
          <Route
            path="jobs"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <JobsPage />
              </React.Suspense>
            }
          />
          <Route
            path="jobs/:jobId"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <JobDetailPage />
              </React.Suspense>
            }
          />
          
          {/* Candidates routes */}
          <Route
            path="candidates"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <CandidatesPage />
              </React.Suspense>
            }
          />
          <Route
            path="candidates/:candidateId"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <CandidateDetailPage />
              </React.Suspense>
            }
          />
          
          {/* Kanban board */}
          <Route
            path="kanban"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <KanbanPage />
              </React.Suspense>
            }
          />
          
          {/* Assessment routes */}
          <Route
            path="assessments"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <AssessmentPage />
              </React.Suspense>
            }
          />
          <Route
            path="assessments/:jobId"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <AssessmentPage />
              </React.Suspense>
            }
          />
          <Route
            path="assessments/:jobId/take"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <AssessmentTakePage />
              </React.Suspense>
            }
          />
          
          {/* Settings placeholder */}
          <Route
            path="settings"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                <p className="text-gray-600">Settings page coming soon...</p>
              </div>
            }
          />
          
          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600">The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;