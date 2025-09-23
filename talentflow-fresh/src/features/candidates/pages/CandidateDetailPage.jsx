import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  FileText,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { LoadingPage } from '../../../components/common/LoadingSpinner.jsx';
import { useCandidatesStore } from '../../../store/candidatesStore.js';
import { useJobsStore } from '../../../store/jobsStore.js';
import { candidatesApi } from '../../../api/candidates.js';
import { formatDate, formatRelativeTime, createMention, extractMentions, sortTimelineByHiringProcess, isValidStageTransition, getNextPossibleStages } from '../../../utils/helpers.js';
import { CANDIDATE_STAGES, CANDIDATE_STAGE_LABELS, CANDIDATE_STAGE_COLORS, MOCK_USERS } from '../../../utils/constants.js';
import { useApi } from '../../../hooks/useApi.js';
import { MentionInput } from '../../../components/ui/MentionInput.jsx';
import { MentionText } from '../../../components/ui/MentionText.jsx';
import { CandidateTimeline } from '../components/CandidateTimeline.jsx';
import { TimelineStats } from '../components/TimelineStats.jsx';

const CandidateDetailPage = () => {
  const { candidateId } = useParams();
  
  const [candidate, setCandidate] = React.useState(null);
  const [timeline, setTimeline] = React.useState([]);
  const [notes, setNotes] = React.useState([]);
  const [newNote, setNewNote] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [addingNote, setAddingNote] = React.useState(false);

  const { updateCandidate, moveCandidateStage } = useCandidatesStore();
  const { jobs, getJobById } = useJobsStore();
  const { makeRequest } = useApi();

  // Load candidate details
  React.useEffect(() => {
    const loadCandidateData = async () => {
      if (candidateId) {
        setLoading(true);
        try {
          const [candidateResponse, timelineResponse, notesResponse] = await Promise.all([
            makeRequest(() => candidatesApi.getCandidate(candidateId)),
            makeRequest(() => candidatesApi.getCandidateTimeline(candidateId)),
            makeRequest(() => candidatesApi.getCandidateNotes(candidateId))
          ]);

          setCandidate(candidateResponse.candidate);
          setTimeline(timelineResponse.timeline);
          setNotes(notesResponse.notes);
        } catch (error) {
          console.error('Failed to load candidate data:', error);
          setError(error.message || 'Failed to load candidate data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCandidateData();
  }, [candidateId, makeRequest]);

  const handleStageChange = async (newStage) => {
    if (candidate && newStage !== candidate.stage) {
      // Validate the stage transition
      if (!isValidStageTransition(candidate.stage, newStage)) {
        alert(`Invalid stage transition from ${CANDIDATE_STAGE_LABELS[candidate.stage]} to ${CANDIDATE_STAGE_LABELS[newStage]}`);
        return;
      }
      
      try {
        await makeRequest(() => 
          candidatesApi.moveCandidateStage(candidateId, newStage, 'user')
        );
        
        setCandidate(prev => ({ ...prev, stage: newStage }));
        moveCandidateStage(candidateId, newStage, 'user');
        
        // Reload timeline to show the change
        const timelineResponse = await makeRequest(() => 
          candidatesApi.getCandidateTimeline(candidateId)
        );
        setTimeline(timelineResponse.timeline);
      } catch (error) {
        console.error('Failed to update candidate stage:', error);
        alert('Failed to update candidate stage. Please try again.');
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const mentions = extractMentions(newNote);
      const noteData = {
        content: newNote,
        authorId: 'current-user', // In real app, get from auth
        mentions: mentions
      };

      const response = await makeRequest(() =>
        candidatesApi.addCandidateNote(candidateId, noteData)
      );

      setNotes(prev => [response.note, ...prev]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading candidate details..." />;
  }

  if (!candidate) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error ? 'Error Loading Candidate' : 'Candidate Not Found'}
        </h1>
        <p className="text-gray-600 mb-6">
          {error || "The candidate you're looking for doesn't exist."}
        </p>
        {error && (
          <p className="text-red-600 text-sm mb-4">
            ID: {candidateId}
          </p>
        )}
        <Link to="/candidates">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </Link>
      </div>
    );
  }

  const job = getJobById(candidate.jobId);
  const stageColorClass = CANDIDATE_STAGE_COLORS[candidate.stage] || 'bg-gray-100 text-gray-800';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/candidates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <Badge className={stageColorClass}>
                {CANDIDATE_STAGE_LABELS[candidate.stage]}
              </Badge>
            </div>
            <p className="text-gray-600">
              Applied for {job?.title || 'Unknown Position'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={candidate.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="w-40"
          >
            {getNextPossibleStages(candidate?.stage || '').length > 0 ? (
              // Show current stage + next possible stages
              <>
                <option value={candidate?.stage}>
                  {CANDIDATE_STAGE_LABELS[candidate?.stage]} (Current)
                </option>
                {getNextPossibleStages(candidate?.stage || '').map(stage => (
                  <option key={stage} value={stage}>
                    {CANDIDATE_STAGE_LABELS[stage]}
                  </option>
                ))}
              </>
            ) : (
              // Terminal stage - no changes allowed
              <option value={candidate?.stage}>
                {CANDIDATE_STAGE_LABELS[candidate?.stage]} (Final)
              </option>
            )}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Details */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a 
                    href={`mailto:${candidate.email}`}
                    className="hover:text-primary-600"
                  >
                    {candidate.email}
                  </a>
                </div>
                
                {candidate.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a 
                      href={`tel:${candidate.phone}`}
                      className="hover:text-primary-600"
                    >
                      {candidate.phone}
                    </a>
                  </div>
                )}
                
                {candidate.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {formatRelativeTime(candidate.createdAt)}</span>
                </div>
              </div>

              {/* Experience */}
              {candidate.experience && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Experience</h4>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{candidate.experience} years</span>
                  </div>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              {candidate.resume && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Resume</h4>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <button className="hover:text-primary-600 underline">
                      {candidate.resume}
                    </button>
                  </div>
                </div>
              )}

              {/* Job Applied For */}
              {job && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Applied Position</h4>
                  <Link 
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{job.title}</span>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Note */}
              <div className="mb-6">
                <MentionInput
                  placeholder="Add a note about this candidate... Use @name to mention team members"
                  value={newNote}
                  onChange={setNewNote}
                  rows={3}
                  onSubmit={handleAddNote}
                />
                <div className="flex items-center justify-between mt-2">
                  <Button 
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    loading={addingNote}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.length > 0 ? (
                  notes.map(note => (
                    <div key={note.id} className="border-l-2 border-primary-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {MOCK_USERS.find(u => u.id.toString() === note.authorId)?.name || 'User'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(note.createdAt)}
                        </span>
                      </div>
                      <MentionText className="text-gray-700 text-sm">
                        {note.content}
                      </MentionText>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No notes yet. Add the first note about this candidate.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Visual Timeline Progress */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-1 h-4 bg-blue-500 rounded-full mr-2"></div>
              Progress Timeline
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <CandidateTimeline 
                currentStage={candidate.stage} 
                timeline={timeline}
                compact={false}
                showLabels={true}
                showDates={true}
                className="px-1"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
              
              {job && (
                <Link to={`/assessments/${job.id}/take`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View Assessment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;