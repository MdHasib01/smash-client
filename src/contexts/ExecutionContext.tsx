import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Job, ExecutionSession, JobStatus, Attempt } from '../types/execution';
import { useAccounts, SmashConnection, Capability } from './AccountsContext';
import { useToast } from './ToastContext';

interface ExecutionContextState {
  currentSession: ExecutionSession | null;
  startSession: (mode: Capability, prompt: string, selectedConnections: SmashConnection[]) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  handleJobAction: (action: string, jobId: string) => void;
  stopSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  clearSession: () => void;
}

const ExecutionContext = createContext<ExecutionContextState | undefined>(undefined);

export const ExecutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ExecutionSession | null>(null);
  const { connections, updateConnection } = useAccounts();
  const { addToast } = useToast();
  
  // Keep track of timeouts for cleanup
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? { ...j, ...updates } : j)
      };
    });
  };

  const simulateJobExecution = (job: Job, sessionPrompt: string, attemptNumber: number = 1) => {
    // Clear any existing timeout for this job
    if (timeoutsRef.current[job.id]) {
      clearTimeout(timeoutsRef.current[job.id]);
    }

    const { status: connStatus } = job.connection;
    
    if (connStatus === 'LIMIT_REACHED') {
      updateJob(job.id, { 
        status: 'WAITING_FOR_LIMIT',
        limitResetTime: Date.now() + 1000 * 5 // 5 seconds for fast mock testing
      });
      return;
    }
    
    if (connStatus === 'SESSION_EXPIRED') {
      updateJob(job.id, { status: 'SESSION_EXPIRED' });
      return;
    }

    if (connStatus === 'API_ERROR' || connStatus === 'OFFLINE') {
      updateJob(job.id, { 
        status: 'FAILED',
        attempts: [...job.attempts.filter(a => a.number !== attemptNumber), { number: attemptNumber, startTime: Date.now(), prompt: attemptNumber > 1 ? 'Auto Fixed' : sessionPrompt, status: 'ERROR' }]
      });
      return;
    }

    // Normal execution mock
    updateJob(job.id, { status: 'GENERATING' });
    
    // Simulate some logic based on the provider/connection for demonstration
    // If it's a specific mock one, let's trigger a violation
    const isViolationCase = (job.connection.model.includes('Pro') || job.connection.name.includes('Pro')) && attemptNumber === 1;

    timeoutsRef.current[job.id] = setTimeout(() => {
      if (isViolationCase) {
        // Trigger Violation Behavior
        const failedAttempt: Attempt = { 
          number: attemptNumber, 
          startTime: job.attempts[job.attempts.length - 1].startTime, 
          prompt: sessionPrompt, 
          status: 'VIOLATION' 
        };
        const newAttempt: Attempt = { 
          number: attemptNumber + 1, 
          startTime: Date.now(), 
          prompt: 'যে part-টা violation আসছে ওইটা বাদ দিয়ে generate করো।', 
          status: 'RUNNING' 
        };
        
        updateJob(job.id, { 
          status: 'RETRYING', 
          attempts: [...job.attempts.filter(a => a.number !== attemptNumber), failedAttempt, newAttempt] 
        });
        
        addToast(`Violation detected on ${job.connection.name}. Auto-recovering...`, 'WARNING');

        // Schedule the retry success
        timeoutsRef.current[job.id] = setTimeout(() => {
          updateJob(job.id, { status: 'GENERATING' });
          timeoutsRef.current[job.id] = setTimeout(() => {
            const completedAttempt: Attempt = { ...newAttempt, status: 'COMPLETE', duration: 4.5 };
            updateJob(job.id, { 
              status: 'COMPLETE', 
              duration: 8.2, 
              attempts: [...job.attempts.filter(a => a.number !== attemptNumber), failedAttempt, completedAttempt] 
            });
          }, 4500);
        }, 2000);
        
      } else {
        // Success
        const successAttempt: Attempt = { 
          number: attemptNumber, 
          startTime: job.attempts[job.attempts.length - 1].startTime, 
          prompt: attemptNumber > 1 ? 'Auto Fixed' : sessionPrompt, 
          status: 'COMPLETE',
          duration: 3.5
        };
        updateJob(job.id, { 
          status: 'COMPLETE', 
          duration: 3.5,
          attempts: [...job.attempts.filter(a => a.number !== attemptNumber), successAttempt]
        });
      }
    }, 3000);
  };

  const startSession = (mode: Capability, prompt: string, selectedConnections: SmashConnection[]) => {
    const initialJobs: Job[] = selectedConnections.map((conn, idx) => {
      return {
        id: `job_${Date.now()}_${idx}`,
        connection: conn,
        status: 'QUEUED',
        attempts: [{ number: 1, startTime: Date.now(), prompt, status: 'RUNNING' }],
      };
    });

    const newSession: ExecutionSession = {
      id: `SM-${mode.substring(0,3)}-${Date.now()}`,
      mode,
      prompt,
      startTime: Date.now(),
      status: 'RUNNING',
      jobs: initialJobs,
      events: []
    };

    setCurrentSession(newSession);

    // Start jobs slightly staggered
    initialJobs.forEach((job, index) => {
      timeoutsRef.current[job.id] = setTimeout(() => {
        simulateJobExecution(job, prompt, 1);
      }, index * 500);
    });
  };

  const handleJobAction = (action: string, jobId: string) => {
    if (!currentSession) return;
    const job = currentSession.jobs.find(j => j.id === jobId);
    if (!job) return;

    if (action === 'STOP' || action === 'STOP_RETRY') {
      if (timeoutsRef.current[jobId]) clearTimeout(timeoutsRef.current[jobId]);
      updateJob(jobId, { status: 'STOPPED' });
    }
    
    if (action === 'RETRY' || action === 'RESUME') {
      const nextAttemptNum = job.attempts.length + 1;
      updateJob(jobId, { 
        status: 'QUEUED',
        attempts: [...job.attempts, { number: nextAttemptNum, startTime: Date.now(), prompt: currentSession.prompt, status: 'RUNNING' }]
      });
      simulateJobExecution(job, currentSession.prompt, nextAttemptNum);
    }

    if (action === 'USE_FALLBACK') {
      const fallbackId = job.connection.fallbackId;
      if (fallbackId) {
        const fallbackConn = connections.find(c => c.id === fallbackId);
        if (fallbackConn) {
          updateJob(jobId, {
            connection: fallbackConn,
            status: 'QUEUED',
            attempts: [...job.attempts, { number: job.attempts.length + 1, startTime: Date.now(), prompt: currentSession.prompt, status: 'RUNNING' }]
          });
          simulateJobExecution({ ...job, connection: fallbackConn }, currentSession.prompt, job.attempts.length + 1);
          addToast(`Switched to fallback connection: ${fallbackConn.name}`, 'INFO');
        } else {
           addToast('Fallback connection not found.', 'ERROR');
        }
      } else {
        addToast('No fallback configured for this connection.', 'WARNING');
      }
    }

    if (action === 'OPEN_SESSION') {
       addToast(`Opening secure session for ${job.connection.name}...`, 'INFO');
       setTimeout(() => {
         // Simulate successful re-login
         updateJob(jobId, { status: 'QUEUED' });
         // Create a mock active connection so we can bypass SESSION_EXPIRED
         const activeConn = { ...job.connection, status: 'ACTIVE' as any };
         simulateJobExecution({ ...job, connection: activeConn }, currentSession.prompt, job.attempts.length + 1);
         addToast(`Session restored. Resuming...`, 'SUCCESS');
       }, 2000);
    }
    
    if (action === 'NOTIFY_ACTIVE') {
      addToast(`Limit reset for ${job.connection.name}. Auto-resuming...`, 'SUCCESS');
      const nextAttemptNum = job.attempts.length + 1;
      updateJob(jobId, { 
        status: 'QUEUED',
        limitResetTime: undefined,
        attempts: [...job.attempts, { number: nextAttemptNum, startTime: Date.now(), prompt: currentSession.prompt, status: 'RUNNING' }]
      });
      // Mock an active connection to bypass the LIMIT check
      const activeConn = { ...job.connection, status: 'ACTIVE' as any };
      simulateJobExecution({ ...job, connection: activeConn }, currentSession.prompt, nextAttemptNum);
    }
  };

  const stopSession = () => {
    if (!currentSession) return;
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    setCurrentSession(prev => prev ? { ...prev, status: 'STOPPED' } : null);
    currentSession.jobs.forEach(j => {
      if (['QUEUED', 'STARTING', 'GENERATING', 'PROCESSING', 'RETRYING'].includes(j.status)) {
        updateJob(j.id, { status: 'STOPPED' });
      }
    });
  };

  const pauseSession = () => {
    if (!currentSession) return;
    setCurrentSession(prev => prev ? { ...prev, status: 'PAUSED' } : null);
    currentSession.jobs.forEach(j => {
      if (['QUEUED', 'STARTING', 'GENERATING', 'PROCESSING', 'RETRYING'].includes(j.status)) {
         if (timeoutsRef.current[j.id]) clearTimeout(timeoutsRef.current[j.id]);
         updateJob(j.id, { status: 'PAUSED' });
      }
    });
  };

  const resumeSession = () => {
    if (!currentSession) return;
    setCurrentSession(prev => prev ? { ...prev, status: 'RUNNING' } : null);
    currentSession.jobs.forEach(j => {
      if (j.status === 'PAUSED') {
         updateJob(j.id, { status: 'QUEUED' });
         simulateJobExecution(j, currentSession.prompt, j.attempts.length);
      }
    });
  };

  const clearSession = () => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    setCurrentSession(null);
  };

  return (
    <ExecutionContext.Provider value={{
      currentSession,
      startSession,
      updateJob,
      handleJobAction,
      stopSession,
      pauseSession,
      resumeSession,
      clearSession
    }}>
      {children}
    </ExecutionContext.Provider>
  );
};

export const useExecution = () => {
  const context = useContext(ExecutionContext);
  if (!context) throw new Error('useExecution must be used within ExecutionProvider');
  return context;
};
