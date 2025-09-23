import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, X, Users, MapPin, DollarSign } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useJobsStore } from '../../../store/jobsStore.js';
import { formatDate } from '../../../utils/helpers.js';

export const JobSelectorModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { jobs } = useJobsStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    
    const term = searchTerm.toLowerCase();
    return jobs.filter(job =>
      job.title.toLowerCase().includes(term) ||
      job.department.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term) ||
      job.type.toLowerCase().includes(term)
    );
  }, [jobs, searchTerm]);

  const handleJobSelect = (jobId) => {
    onClose();
    navigate(`/assessments/${jobId}`);
  };

  const getJobStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Job Role">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, department, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Job List */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                onClick={() => handleJobSelect(job.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {job.title}
                        </h3>
                        <Badge className={getJobStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{job.department}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{job.type}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {job.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Posted {formatDate(job.createdAt)}</span>
                        <span>{job.applications || 0} applications</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No jobs found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'No job positions available'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
          
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};