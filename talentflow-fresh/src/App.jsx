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
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
          <p className="text-gray-600">Create job-specific assessments with multiple question types</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Assessment
        </button>
      </div>

      {/* Assessment Builder Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Assessment Details</h3>
            <div className="space-y-4">
              <input 
                className="w-full p-3 border rounded-md" 
                placeholder="Assessment Title"
                defaultValue="Frontend Developer Assessment"
              />
              <textarea 
                className="w-full p-3 border rounded-md" 
                placeholder="Description"
                rows={3}
                defaultValue="Technical assessment for frontend developers"
              />
            </div>
          </div>

          {/* Question Builder */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Questions</h3>
            <div className="space-y-4">
              {/* Sample Questions */}
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Single Choice Question</h4>
                  <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 font-semibold bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all">
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">Single Choice</option>
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">Multi Choice</option>
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">Short Text</option>
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">Long Text</option>
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">Numeric</option>
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">File Upload</option>
                  </select>
                </div>
                <input className="w-full p-2 border rounded mb-2" placeholder="Question text..." />
                <div className="space-y-1">
                  <input className="w-full p-2 border rounded text-sm" placeholder="Option 1" />
                  <input className="w-full p-2 border rounded text-sm" placeholder="Option 2" />
                </div>
              </div>

              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Text Question</h4>
                  <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 font-semibold bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all">
                    <option className="bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100">Long Text</option>
                  </select>
                </div>
                <input className="w-full p-2 border rounded mb-2" placeholder="Describe your experience..." />
                <div className="text-xs text-gray-600">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-1" />
                    Required
                  </label>
                </div>
              </div>
            </div>
            
            <button className="mt-4 px-4 py-2 border border-dashed border-gray-300 rounded-md w-full text-gray-600 hover:bg-gray-50">
              + Add Question
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-2">Frontend Developer Assessment</h4>
              <p className="text-gray-600 mb-4">Technical assessment for frontend developers</p>
            </div>

            {/* Preview Questions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">1. What is your primary programming language?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="q1" className="mr-2" />
                    JavaScript
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="q1" className="mr-2" />
                    TypeScript
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">2. Describe your experience with React</label>
                <textarea className="w-full p-3 border rounded-md" rows={4} placeholder="Type your answer..."></textarea>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">
              Submit Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
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