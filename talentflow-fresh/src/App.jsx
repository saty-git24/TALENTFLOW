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
const AssessmentsListPage = React.lazy(() => import('./features/assessments/pages/AssessmentsListPage.jsx'));
const AssessmentPage = React.lazy(() => import('./features/assessments/pages/AssessmentPage.jsx'));
const AssessmentTakePage = React.lazy(() => import('./features/assessments/pages/AssessmentTakePage.jsx'));
const JobAssessmentView = React.lazy(() => import('./features/assessments/pages/JobAssessmentView.jsx'));
const DatabaseReset = React.lazy(() => import('./components/DatabaseReset.jsx'));

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/jobs" replace />} />
          
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
          
          <Route
            path="kanban"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <KanbanPage />
              </React.Suspense>
            }
          />
          
          <Route
            path="assessments"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <AssessmentsListPage />
              </React.Suspense>
            }
          />
          <Route
            path="jobs/:jobId/assessment"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <JobAssessmentView />
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
            path="assessments/:jobId/builder"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <AssessmentPage />
              </React.Suspense>
            }
          />
          <Route
            path="assessments/:jobId/preview"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <AssessmentTakePage />
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
          
          <Route
            path="reset-database"
            element={
              <React.Suspense fallback={<div className="p-6">Loading...</div>}>
                <DatabaseReset />
              </React.Suspense>
            }
          />
          
          <Route
  path="settings"
  element={
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your TalentFlow configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-1">
          {['Profile', 'Notifications', 'Data Management', 'Appearance'].map((item, idx) => (
            <button key={item} className={`w-full text-left px-3 py-2 rounded-md ${idx === 0 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}>
              {item}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 border rounded-md" placeholder="First Name" defaultValue="John" />
              <input className="p-3 border rounded-md" placeholder="Last Name" defaultValue="Doe" />
              <input className="p-3 border rounded-md col-span-2" placeholder="Email" defaultValue="john@company.com" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="p-3 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                onClick={async () => {
                  try {
                    const { exportData } = await import('./db/index.js');
                    const data = await exportData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `talentflow-export-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    alert('Export failed: ' + error.message);
                  }
                }}
              >
                Export Data
              </button>
              <button 
                className="p-3 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                onClick={async () => {
                  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    try {
                      const { clearDatabase } = await import('./db/index.js');
                      await clearDatabase();
                      alert('Database cleared and reseeded successfully!');
                      window.location.reload();
                    } catch (error) {
                      alert('Clear failed: ' + error.message);
                    }
                  }
                }}
              >
                Clear Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
/>
          
          <Route
            path="*"
            element={
              <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
              </div>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;