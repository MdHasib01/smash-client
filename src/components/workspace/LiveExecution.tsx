import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Job } from '../../types/execution';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { SplitSquareHorizontal, History, StopCircle, PlayCircle, Coins, PauseCircle } from 'lucide-react';
import { ResultCard } from './ResultCard';
import { JobCard } from './JobCard';
import { CompareWorkspace } from './CompareWorkspace';
import { PromptRevisionBar } from './PromptRevisionBar';
import { useExecution } from '../../contexts/ExecutionContext';

interface LiveExecutionProps {
  jobs: Job[];
  mode: string;
  onCancel: () => void;
  onAction?: (action: string, jobId: string) => void;
  onJobClick?: (jobId: string) => void;
}

export const LiveExecution: React.FC<LiveExecutionProps> = ({ jobs, mode, onCancel, onAction, onJobClick }) => {
  const { stopSession, pauseSession, resumeSession, currentSession } = useExecution();
  
  const isAllComplete = jobs.every(j => ['COMPLETE', 'FAILED', 'STOPPED', 'SESSION_EXPIRED', 'OFFLINE'].includes(j.status));
  const hasCompleted = jobs.some(j => j.status === 'COMPLETE');
  const isPaused = currentSession?.status === 'PAUSED';
  
  const activeCount = jobs.filter(j => ['QUEUED', 'STARTING', 'GENERATING', 'PROCESSING', 'RETRYING'].includes(j.status)).length;
  const completeCount = jobs.filter(j => j.status === 'COMPLETE').length;
  const limitedCount = jobs.filter(j => j.status === 'WAITING_FOR_LIMIT').length;
  const errorCount = jobs.filter(j => ['FAILED', 'STOPPED', 'SESSION_EXPIRED', 'OFFLINE', 'CONNECTION_LOST'].includes(j.status)).length;
  const retryingCount = jobs.filter(j => j.status === 'RETRYING').length;

  const [isComparing, setIsComparing] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareWorkspace, setShowCompareWorkspace] = useState(false);

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleOpenCompare = () => {
    if (compareIds.length >= 2) {
      setShowCompareWorkspace(true);
    }
  };

  const handleRevise = (revision: string) => {
    console.log("Revising with prompt:", revision);
  };

  // Mock cost calculation based on completed API jobs
  const estimatedCost = completeCount * 0.04;

  return (
    <div className="flex flex-col h-full gap-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.02] p-6 rounded-[24px] border border-white/5 shrink-0 z-10 gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            {isAllComplete ? 'Execution Session Complete' : 'Live Execution'}
            {!isAllComplete && <span className="w-2 h-2 rounded-full bg-[#D946EF] animate-pulse" />}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-smash-text-secondary">{jobs.length} Total</span>
            {activeCount > 0 && <span className="text-[#D946EF]">{activeCount} Running</span>}
            {completeCount > 0 && <span className="text-violet-400">{completeCount} Complete</span>}
            {retryingCount > 0 && <span className="text-rose-400">{retryingCount} Retrying</span>}
            {limitedCount > 0 && <span className="text-rose-500">{limitedCount} Limited</span>}
            {errorCount > 0 && <span className="text-red-400">{errorCount} Failed</span>}
            <div className="w-px h-3 bg-white/10 hidden sm:block" />
            <span className="text-violet-400 flex items-center gap-1">
              <Coins size={10} /> ${estimatedCost.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasCompleted && (
            <div className="flex items-center gap-2 mr-4">
              {isComparing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { setIsComparing(false); setCompareIds([]); }}>CANCEL</Button>
                  <Button variant="primary" size="sm" disabled={compareIds.length < 2} onClick={handleOpenCompare}>
                    <SplitSquareHorizontal size={14} className="mr-2" /> COMPARE ({compareIds.length})
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setIsComparing(true)}>
                  <SplitSquareHorizontal size={14} className="mr-2" /> COMPARE
                </Button>
              )}
            </div>
          )}

          {!isAllComplete ? (
            <>
              {isPaused ? (
                <Button variant="secondary" size="sm" className="hidden md:flex" onClick={resumeSession}>
                  <PlayCircle size={14} className="mr-1.5" /> RESUME ALL
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="hidden md:flex" onClick={pauseSession}>
                  <PauseCircle size={14} className="mr-1.5" /> PAUSE
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={stopSession}>
                <StopCircle size={14} className="mr-1.5" /> STOP ALL
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onCancel}>NEW SESSION</Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className={cn(
          "grid gap-6",
          mode === 'IMAGE' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
        )}>
          <AnimatePresence>
            {jobs.map(job => {
              if (job.status === 'COMPLETE') {
                return (
                  <ResultCard 
                    key={job.id} 
                    job={job as any} 
                    mode={mode} 
                    isComparing={isComparing}
                    isSelectedForCompare={compareIds.includes(job.id)}
                    onToggleCompare={handleToggleCompare}
                    onAction={onAction}
                    prompt={currentSession?.prompt}
                  />
                );
              }

              return (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onAction={onAction || (() => {})} 
                  onClick={onJobClick || (() => {})} 
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {hasCompleted && <PromptRevisionBar onRevise={handleRevise} />}

      <AnimatePresence>
        {showCompareWorkspace && (
          <CompareWorkspace 
            jobs={jobs.filter(j => compareIds.includes(j.id))} 
            mode={mode}
            onClose={() => setShowCompareWorkspace(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
