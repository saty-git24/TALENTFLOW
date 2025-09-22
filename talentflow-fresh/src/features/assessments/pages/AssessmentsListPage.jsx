import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileCheck, Eye, Edit, Play, Users, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useJobsStore } from '../../../store/jobsStore.js';
import { formatDate, formatRelativeTime } from '../../../utils/helpers.js';

const AssessmentsListPage = () => {
  const { jobs } = useJobsStore();
  
  // Mock assessments data - in real app, this would come from assessments store
  const mockAssessments = [
    {
      id: 'assessment-1',
      jobId: jobs[0]?.id,
      title: 'Senior Frontend Developer Assessment',
      description: 'Technical assessment covering React, JavaScript, and problem-solving skills',
      sections: 3,
      questions: 12,
      timeLimit: 60,
      responses: 8,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assessment-2', 
      jobId: jobs[1]?.id,
      title: 'Backend Engineer Assessment',
      description: 'Assessment focusing on system design, databases, and API development',
      sections: 4,
      questions: 15,
      timeLimit: 90,
      responses: 12,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assessment-3',
      jobId: jobs[2]?.id,
      title: 'Product Manager Assessment',
      description: 'Evaluation of product strategy, user experience, and analytical thinking',
      sections: 5,
      questions: 18,
      timeLimit: 45,
      responses: 5,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Position';
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileCheck className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{mockAssessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAssessments.reduce((acc, a) => acc + a.responses, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(mockAssessments.reduce((acc, a) => acc + a.timeLimit, 0) / mockAssessments.length)} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileCheck className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAssessments.reduce((acc, a) => acc + a.questions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockAssessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{assessment.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {assessment.description}
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
                  <div className="text-lg font-bold text-gray-900">{assessment.sections}</div>
                  <div className="text-xs text-gray-600">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{assessment.questions}</div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{assessment.timeLimit}</div>
                  <div className="text-xs text-gray-600">Minutes</div>
                </div>
              </div>

              {/* Response Stats */}
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {assessment.responses} responses
                </Badge>
                
                <div className="text-xs text-gray-500">
                  Updated {formatRelativeTime(assessment.updatedAt)}
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
                
                <Link to={`/assessments/${assessment.jobId}/take`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockAssessments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first assessment to evaluate candidates effectively.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentsListPage;