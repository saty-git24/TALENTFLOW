import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, X, Users, MapPin, DollarSign } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { dbAPI } from '../../../db/index.js';
import { assessmentsApi } from '../../../api/assessments.js';
import { formatDate } from '../../../utils/helpers.js';
import { useJobsStore } from '../../../store/jobsStore.js';

export const JobSelectorModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const setCurrentJob = useJobsStore((state) => state.setCurrentJob);
  const addJob = useJobsStore((state) => state.addJob);
  const [allJobs, setAllJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch ALL jobs directly from database, bypassing any store filters
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchAllJobs = async () => {
        try {
          // Get all jobs directly from the database
          const jobs = await dbAPI.getJobs();
          setAllJobs(jobs || []);
        } catch (error) {
          setAllJobs([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAllJobs();
    }
  }, [isOpen]);

  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return allJobs;
    
    const term = searchTerm.toLowerCase();
    return allJobs.filter(job =>
      job.title.toLowerCase().includes(term) ||
      job.department.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term) ||
      job.type.toLowerCase().includes(term)
    );
  }, [allJobs, searchTerm]);

  const handleJobSelect = async (job) => {
    setCurrentJob(job); // Sync selected job with store
    addJob(job); // Ensure job is in the store
    onClose();
    try {
      const result = await assessmentsApi.getAssessment(job.id);
      if (result && result.assessment) {
        // Assessment exists, go to preview or edit
        navigate(`/assessments/${job.id}/preview`);
      } else {
        // No assessment, go to builder to create
        navigate(`/assessments/${job.id}/builder`);
      }
    } catch (e) {
      // On error, assume no assessment exists
      navigate(`/assessments/${job.id}/builder`);
    }
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
      <div className="space-y-6 py-4">
        {/* Search */}
        <div className="relative px-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, department, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* Job List */}
        <div className="max-h-96 overflow-y-auto space-y-3 pt-4 px-1">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p>Loading all jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                onClick={() => handleJobSelect(job)}
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
        <div className="flex items-center justify-between pt-4 px-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading 
              ? 'Loading...' 
              : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} available`
            }
          </p>
          
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};