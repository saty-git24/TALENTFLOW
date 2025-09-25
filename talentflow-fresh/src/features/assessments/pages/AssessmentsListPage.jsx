import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileCheck, Eye, Edit, Play, Users, Clock, Trash2 } from 'lucide-react';
import { Wrench } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { JobSelectorModal } from '../components/JobSelectorModal.jsx';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.jsx';
import { useJobsStore } from '../../../store/jobsStore.js';
import { useAssessmentsStore } from '../../../store/assessmentsStore.js';
import { dbAPI } from '../../../db/index.js';
import { formatDate, formatRelativeTime } from '../../../utils/helpers.js';

const AssessmentsListPage = () => {
  const { jobs } = useJobsStore();
  const { getAllAssessments, deleteAssessment, setSavedAssessments, getDeletedAssessmentIds } = useAssessmentsStore();
  const [isJobSelectorOpen, setIsJobSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load assessments from database on component mount
  useEffect(() => {
    const loadAssessmentsFromDatabase = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get assessments from IndexedDB
        const dbAssessments = await dbAPI.getAssessments();
        // Get current assessments from Zustand store
        const storeAssessments = getAllAssessments();
        // Get list of deleted assessment IDs
        const deletedIds = getDeletedAssessmentIds();
        // Merge database assessments into store if they don't exist and weren't deleted
        if (dbAssessments && dbAssessments.length > 0) {
          const mergedAssessments = [...storeAssessments];
          dbAssessments.forEach(dbAssessment => {
            // Skip if this assessment was deleted by the user
            if (deletedIds.includes(dbAssessment.id)) {
              return;
            }
            // Check if this assessment already exists in the store
            const existsInStore = storeAssessments.some(
              storeAssessment => storeAssessment.id === dbAssessment.id
            );
            if (!existsInStore) {
              // Add database assessment to the merged list
              mergedAssessments.push(dbAssessment);
            }
          });
          // Update the store with the merged assessments
          if (mergedAssessments.length > storeAssessments.length) {
            setSavedAssessments(mergedAssessments);
          }
        }
      } catch (error) {
        setError('Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentsFromDatabase();
  }, [getAllAssessments, setSavedAssessments, getDeletedAssessmentIds]);
  
  // Get real assessments from store (now includes database assessments)
  const savedAssessments = getAllAssessments();
  
  // Calculate stats from real assessments
  const assessmentStats = savedAssessments.reduce((stats, assessment) => {
    stats.totalQuestions += assessment.sections.reduce((count, section) => count + section.questions.length, 0);
    stats.totalSections += assessment.sections.length;
    // Since we don't have responses yet, we'll set this to 0
    stats.totalResponses += 0;
    return stats;
  }, { totalQuestions: 0, totalSections: 0, totalResponses: 0 });

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Position';
  };

  const handleDeleteAssessment = async (assessmentId, assessmentTitle) => {
    if (window.confirm(`Are you sure you want to delete the assessment "${assessmentTitle}"? This action cannot be undone.`)) {
      try {
        // Delete from Zustand store (and mark as deleted)
        deleteAssessment(assessmentId);
        
        // Optionally, also try to delete from IndexedDB to prevent re-seeding
        try {
          await dbAPI.deleteAssessment(assessmentId);
        } catch (dbError) {
          // If DB deletion fails, it's okay because we track deleted IDs
        }
      } catch (error) {
      }
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">
            Create and manage job-specific assessments for candidates
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsJobSelectorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="flex items-center">
              <FileCheck className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{savedAssessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {assessmentStats.totalResponses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {savedAssessments.length > 0 
                    ? Math.round(savedAssessments.reduce((acc, a) => acc + (a.settings?.timeLimit || 60), 0) / savedAssessments.length)
                    : 0
                  } min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="flex items-center">
              <FileCheck className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {assessmentStats.totalQuestions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading assessments...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {savedAssessments
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by creation date to maintain job order
          .map((assessment) => {
          const totalQuestions = assessment.sections.reduce((count, section) => count + section.questions.length, 0);
          const totalSections = assessment.sections.length;
          
          return (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {assessment.title || 'Untitled Assessment'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {assessment.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="font-medium">{getJobTitle(assessment.jobId)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Assessment Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{totalSections}</div>
                    <div className="text-xs text-gray-600">Sections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{totalQuestions}</div>
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {assessment.settings?.timeLimit || 'No limit'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {assessment.settings?.timeLimit ? 'Minutes' : ''}
                    </div>
                  </div>
                </div>

                {/* Response Stats - Currently 0 since we don't track responses yet */}
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    0 responses
                  </Badge>
                  
                  <div className="text-xs text-gray-500">
                    {assessment.updatedAt 
                      ? formatRelativeTime(new Date(assessment.updatedAt))
                      : 'Just created'
                    }
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link to={`/assessments/${assessment.jobId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Link to={`/assessments/${assessment.jobId}?mode=preview`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </Link>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteAssessment(assessment.id, assessment.title)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Error message: only show if error and no assessments loaded */}
      {!loading && savedAssessments.length === 0 && error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && savedAssessments.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12 pt-16">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Assessments Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first assessment to evaluate candidates effectively.
            </p>
            <Button onClick={() => setIsJobSelectorOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Assessment
            </Button>
          </CardContent>
        </Card>
      )}
      
      <JobSelectorModal 
        isOpen={isJobSelectorOpen}
        onClose={() => setIsJobSelectorOpen(false)}
      />
    </div>
  );
};

export default AssessmentsListPage;