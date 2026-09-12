import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, AlertTriangle, RefreshCcw, Database, ExternalLink, Terminal } from 'lucide-react';
import { Job } from '../../types/execution';
import { Button } from '../ui/Button';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Badge } from '../ui/Badge';

interface JobInspectorProps {
  job: Job | null;
  onClose: () => void;
  onAction: (action: string, jobId: string) => void;
}

export const JobInspector: React.FC<JobInspectorProps> = ({ job, onClose, onAction }) => {
  if (!job) return null;

  const isFailed = ['FAILED', 'STOPPED', 'SESSION_EXPIRED', 'OFFLINE'].includes(job.status);
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] glass-1 border-l border-white/10 z-[100] flex flex-col shadow-2xl backdrop-blur-2xl bg-black/80 md:bg-black/40"
      >
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/20">
          <h2 className="text-sm font-black text-white tracking-tight uppercase">Job Details</h2>
          <Button variant="icon" onClick={onClose} className="w-8 h-8 glass-3 text-smash-text-secondary hover:text-white">
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-32">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-white">{job.connection.name}</span>
                <span className="text-[10px] text-smash-text-secondary flex items-center gap-2">
                  <Badge variant="connection">{job.connection.type}</Badge>
                  {job.connection.provider}
                </span>
              </div>
              <StatusIndicator state={job.status as any} />
            </div>
            
            {/* Action Bar */}
            <div className="flex gap-2 p-3 glass-2 rounded-xl border border-white/5">
              {job.status === 'PAUSED' && (
                <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => onAction('RESUME', job.id)}><RefreshCcw size={12} className="mr-1"/> RESUME JOB</Button>
              )}
              {job.status === 'WAITING_FOR_LIMIT' && (
                <div className="flex w-full items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1"><Clock size={12}/> Auto-Resume is ON</span>
                  <input type="checkbox" checked className="accent-[#D946EF]" readOnly />
                </div>
              )}
              {job.status === 'RETRYING' && (
                <Button variant="danger" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => onAction('STOP_RETRY', job.id)}>STOP RETRY</Button>
              )}
              {isFailed && (
                <>
                  <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => onAction('RETRY', job.id)}><RefreshCcw size={12} className="mr-1"/> RETRY</Button>
                  <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => onAction('USE_FALLBACK', job.id)}>FALLBACK</Button>
                </>
              )}
              {job.status === 'SESSION_EXPIRED' && (
                <Button variant="primary" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => onAction('OPEN_SESSION', job.id)}><ExternalLink size={12} className="mr-1"/> OPEN SESSION</Button>
              )}
            </div>
          </div>

          {/* Retry History */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase text-smash-text-tertiary tracking-widest">Retry History</h3>
            <div className="flex flex-col gap-2 relative">
              <div className="absolute top-2 bottom-2 left-[7px] w-[2px] bg-white/5" />
              {job.attempts.map((attempt, idx) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-black border-2 border-white/20 flex shrink-0 mt-1">
                    {attempt.status === 'VIOLATION' && <div className="w-full h-full bg-rose-500 rounded-full" />}
                    {attempt.status === 'COMPLETE' && <div className="w-full h-full bg-violet-500 rounded-full" />}
                    {attempt.status === 'ERROR' && <div className="w-full h-full bg-red-500 rounded-full" />}
                    {attempt.status === 'RUNNING' && <div className="w-full h-full bg-[#D946EF] rounded-full animate-pulse" />}
                  </div>
                  <div className="flex flex-col gap-1 pb-4">
                    <span className="text-xs font-bold text-white">Attempt {attempt.number}</span>
                    <span className="text-[10px] text-smash-text-secondary">
                      {attempt.status === 'VIOLATION' && 'Provider Refusal / Violation Detected'}
                      {attempt.status === 'ERROR' && 'Technical Failure'}
                      {attempt.status === 'RUNNING' && 'Currently Executing'}
                      {attempt.status === 'COMPLETE' && 'Generation Completed'}
                    </span>
                    {attempt.status === 'VIOLATION' && (
                      <div className="mt-2 p-2 glass-3 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 font-medium">
                        Auto Retry Triggered: "যে part-টা violation আসছে ওইটা বাদ দিয়ে generate করো।"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Log Access */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase text-smash-text-tertiary tracking-widest flex items-center gap-1.5"><Terminal size={12}/> Raw Logs</h3>
            <div className="glass-3 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-smash-text-secondary leading-relaxed h-48 overflow-y-auto">
              [17:04:02] Task queued<br/>
              [17:04:03] Browser session assigned<br/>
              [17:04:05] Prompt submitted payload<br/>
              {job.attempts.length > 1 && (
                <>
                  <span className="text-rose-400">[17:04:19] WARN: Safety violation reported by model</span><br/>
                  [17:04:19] Applying SMASH auto-recovery rule<br/>
                  [17:04:20] Retrying with modified instructions<br/>
                </>
              )}
              {job.status === 'WAITING_FOR_LIMIT' && (
                <>
                  <span className="text-red-400">[17:05:00] ERR: HTTP 429 Too Many Requests</span><br/>
                  <span className="text-rose-400">[17:05:00] Account limit reached. Reset detected.</span><br/>
                  [17:05:00] Moved to WAITING_FOR_LIMIT queue.<br/>
                </>
              )}
              {job.status === 'COMPLETE' && (
                <span className="text-violet-400">[17:06:01] Generation complete. Result parsed.</span>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
