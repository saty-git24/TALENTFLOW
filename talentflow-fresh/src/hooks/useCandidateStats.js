import { useState, useEffect, useMemo } from 'react';
import { candidatesApi } from '../api/candidates.js';
import { CANDIDATE_STAGES } from '../utils/constants.js';

// Global cache for candidate stats
let globalStatsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCandidateStats = (jobId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      // Check if we have valid cached data
      const now = Date.now();
      if (globalStatsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        setStats(globalStatsCache[jobId] || getEmptyStats());
        return;
      }

      setLoading(true);
      try {
        // Load all candidates once and compute stats for all jobs
        const response = await candidatesApi.getCandidates({ pageSize: 1000 });
        const allCandidates = response.candidates || [];
        
        // Group candidates by job and stage
        const statsByJob = {};
        allCandidates.forEach(candidate => {
          const candidateJobId = String(candidate.jobId);
          if (!statsByJob[candidateJobId]) {
            statsByJob[candidateJobId] = getEmptyStats();
          }
          statsByJob[candidateJobId][candidate.stage] = 
            (statsByJob[candidateJobId][candidate.stage] || 0) + 1;
        });

        // Cache the results globally
        globalStatsCache = statsByJob;
        cacheTimestamp = now;
        
        // Set stats for the requested job
        setStats(statsByJob[String(jobId)] || getEmptyStats());
      } catch (error) {
        console.error('Failed to load candidate stats:', error);
        setStats(getEmptyStats());
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadStats();
    }
  }, [jobId]);

  return { stats, loading };
};

const getEmptyStats = () => {
  const empty = {};
  Object.values(CANDIDATE_STAGES).forEach(stage => {
    empty[stage] = 0;
  });
  return empty;
};

// Helper to invalidate cache when candidates change
export const invalidateCandidateStatsCache = () => {
  globalStatsCache = null;
  cacheTimestamp = null;
};