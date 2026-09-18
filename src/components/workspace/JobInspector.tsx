import React from 'react';
import { X, Clock, AlertTriangle, RefreshCcw, Database, ExternalLink, Terminal } from 'lucide-react';
import { Job } from '../../types/execution';
import { Button } from '../ui/Button';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/switch';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '../ui/sheet';

interface JobInspectorProps {
  job: Job | null;
  onClose: () => void;
  onAction: (action: string, jobId: string) => void;
}

export const JobInspector: React.FC<JobInspectorProps> = ({ job, onClose, onAction }) => {
  if (!job) return null;

  const isFailed = ['FAILED', 'STOPPED', 'SESSION_EXPIRED', 'OFFLINE'].includes(job.status);

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-none md:w-[400px] gap-0 p-0"
      >
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/20">
          <SheetTitle className="text-sm font-bold text-white tracking-wide uppercase">Job Details</SheetTitle>
          <SheetDescription className="sr-only">Status, retry history and logs for this job</SheetDescription>
          <SheetClose asChild>
            <Button variant="icon" size="icon-sm" aria-label="Close">
              <X size={16} />
            </Button>
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-32">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-white">{job.connection.name}</span>
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
                <Button variant="secondary" size="sm" className="flex-1 text-[10px] tracking-wider" onClick={() => onAction('RESUME', job.id)}><RefreshCcw size={12} /> RESUME JOB</Button>
              )}
              {job.status === 'WAITING_FOR_LIMIT' && (
                <div className="flex w-full items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1"><Clock size={12}/> Auto-Resume is ON</span>
                  <Switch checked tabIndex={-1} aria-readonly className="pointer-events-none" aria-label="Auto-Resume" />
                </div>
              )}
              {job.status === 'RETRYING' && (
                <Button variant="danger" size="sm" className="flex-1 text-[10px] tracking-wider" onClick={() => onAction('STOP_RETRY', job.id)}>STOP RETRY</Button>
              )}
              {isFailed && (
                <>
                  <Button variant="secondary" size="sm" className="flex-1 text-[10px] tracking-wider" onClick={() => onAction('RETRY', job.id)}><RefreshCcw size={12} /> RETRY</Button>
                  <Button variant="secondary" size="sm" className="flex-1 text-[10px] tracking-wider" onClick={() => onAction('USE_FALLBACK', job.id)}>FALLBACK</Button>
                </>
              )}
              {job.status === 'SESSION_EXPIRED' && (
                <Button variant="primary" size="sm" className="flex-1 text-[10px] tracking-wider" onClick={() => onAction('OPEN_SESSION', job.id)}><ExternalLink size={12} /> OPEN SESSION</Button>
              )}
            </div>
          </div>

          {/* Retry History */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold uppercase text-smash-text-tertiary tracking-widest">Retry History</h3>
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
            <h3 className="text-[10px] font-bold uppercase text-smash-text-tertiary tracking-widest flex items-center gap-1.5"><Terminal size={12}/> Raw Logs</h3>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-smash-text-secondary leading-relaxed h-48 overflow-y-auto">
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
      </SheetContent>
    </Sheet>
  );
};
