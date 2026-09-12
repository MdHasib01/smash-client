import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Job } from '../../types/execution';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { ExternalLink, RefreshCcw, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onAction: (action: string, jobId: string) => void;
  onClick: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onAction, onClick }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [elapsed, setElapsed] = useState<string>('0s');
  const [hasNotifiedActive, setHasNotifiedActive] = useState<boolean>(false);

  // Limit Countdown Logic
  useEffect(() => {
    if (job.status === 'WAITING_FOR_LIMIT' && job.limitResetTime) {
      setHasNotifiedActive(false);
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = job.limitResetTime! - now;
        if (diff <= 0) {
          setTimeLeft('Active Now');
          if (!hasNotifiedActive) {
            onAction('NOTIFY_ACTIVE', job.id);
            setHasNotifiedActive(true);
          }
          clearInterval(interval);
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${h}h ${m}m ${s}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [job.status, job.limitResetTime, hasNotifiedActive, onAction, job.id]);

  // Elapsed Timer Logic
  const isActive = ['QUEUED', 'STARTING', 'GENERATING', 'PROCESSING', 'RETRYING'].includes(job.status);
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const currentAttempt = job.attempts[job.attempts.length - 1];
        if (currentAttempt) {
          const diff = Date.now() - currentAttempt.startTime;
          setElapsed(`${(diff / 1000).toFixed(1)}s`);
        }
      }, 100);
      return () => clearInterval(interval);
    } else if (job.duration) {
      setElapsed(`${job.duration.toFixed(1)}s`);
    }
  }, [isActive, job.attempts, job.duration]);

  const renderActiveState = () => (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <div className="flex justify-between w-full px-2 text-[10px] font-bold text-smash-text-secondary uppercase tracking-widest">
        <span>Attempt {job.attempts.length}</span>
        <span className="text-white">{elapsed}</span>
      </div>
      <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className={cn("absolute top-0 left-0 bottom-0", job.status === 'RETRYING' ? "bg-rose-500" : "bg-[#D946EF]")}
          animate={{ left: ['-20%', '100%'], width: ['20%', '20%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>
      {job.status === 'RETRYING' && (
        <div className="flex flex-col gap-2 w-full mt-2">
          <div className="text-[10px] font-black uppercase text-rose-400 text-center tracking-widest bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
            Violation Detected.<br/>
            <span className="text-white normal-case font-bold opacity-80 mt-1 block">
              Auto Command: "যে part-টা violation আসছে ওইটা বাদ দিয়ে generate করো।"
            </span>
          </div>
          <Button variant="danger" size="sm" className="w-full text-[9px] h-7" onClick={(e) => { e.stopPropagation(); onAction('STOP_RETRY', job.id) }}>STOP RETRY</Button>
        </div>
      )}
      {job.progress !== undefined && (
        <span className="text-[10px] font-black tracking-widest uppercase text-[#D946EF]">{job.progress}%</span>
      )}
    </div>
  );

  const renderLimitState = () => (
    <div className="flex flex-col items-center justify-center gap-3 h-full p-2">
      <div className="flex items-center gap-2 text-rose-400">
        <Clock size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Limit Reached</span>
      </div>
      <div className="text-center">
        <div className="text-lg font-black text-white">{timeLeft || 'Checking...'}</div>
        <div className="text-[10px] text-smash-text-secondary uppercase tracking-widest mt-1">Available Again In</div>
      </div>
      <div className="flex gap-2 w-full mt-2">
        <Button variant="primary" size="sm" className="flex-1 text-[9px] h-7" onClick={(e) => { e.stopPropagation(); }}>WAIT</Button>
        <Button variant="secondary" size="sm" className="flex-1 text-[9px] h-7" onClick={(e) => { e.stopPropagation(); onAction('USE_FALLBACK', job.id) }}>FALLBACK</Button>
        <Button variant="ghost" size="sm" className="flex-1 text-[9px] h-7 hover:text-red-400" onClick={(e) => { e.stopPropagation(); onAction('STOP', job.id) }}>STOP</Button>
      </div>
    </div>
  );

  const renderExpiredState = () => (
    <div className="flex flex-col items-center justify-center gap-3 h-full p-2">
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Session Expired</span>
      </div>
      <p className="text-[10px] text-center text-smash-text-secondary px-4">Browser automation requires re-authentication.</p>
      <div className="flex gap-2 w-full mt-2">
        <Button variant="primary" size="sm" className="flex-1 text-[9px] h-7" onClick={(e) => { e.stopPropagation(); onAction('OPEN_SESSION', job.id) }}>
          <ExternalLink size={10} className="mr-1" /> OPEN SESSION
        </Button>
      </div>
    </div>
  );
  
  const renderFailedState = () => (
    <div className="flex flex-col items-center justify-center gap-3 h-full p-2">
      <div className="flex items-center gap-2 text-red-400">
        <XCircle size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">{job.status.replace('_', ' ')}</span>
      </div>
      <div className="flex gap-2 w-full mt-2">
        <Button variant="secondary" size="sm" className="flex-1 text-[9px] h-7" onClick={(e) => { e.stopPropagation(); onAction('RETRY', job.id) }}>
          <RefreshCcw size={10} className="mr-1" /> RETRY NOW
        </Button>
      </div>
    </div>
  );

  const renderPausedState = () => (
    <div className="flex flex-col items-center justify-center gap-3 h-full p-2">
      <div className="flex items-center gap-2 text-smash-text-secondary">
        <Clock size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Paused</span>
      </div>
      <div className="flex gap-2 w-full mt-2">
        <Button variant="secondary" size="sm" className="flex-1 text-[9px] h-7" onClick={(e) => { e.stopPropagation(); onAction('RESUME', job.id) }}>
          <RefreshCcw size={10} className="mr-1" /> RESUME
        </Button>
      </div>
    </div>
  );

  const isError = ['FAILED', 'STOPPED', 'SESSION_EXPIRED', 'OFFLINE', 'CONNECTION_LOST', 'BROWSER_ISSUE'].includes(job.status);
  const isWarning = ['WAITING_FOR_LIMIT', 'PAUSED'].includes(job.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(job.id)}
      className={cn(
        "glass-2 rounded-[24px] p-5 flex flex-col gap-4 border transition-all cursor-pointer hover:bg-white/[0.03]",
        isError ? "border-red-500/20" : isWarning ? "border-rose-500/20" : "border-white/5"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm text-white flex items-center gap-2">
            {job.connection.name}
            {job.attempts.length > 1 && (
              <Badge variant="warning" className="text-[8px] px-1.5 py-0 h-4">Attempt {job.attempts.length}</Badge>
            )}
          </span>
          <span className="text-[10px] text-smash-text-secondary flex items-center gap-1">
            <Badge variant="connection">{job.connection.type}</Badge>
            {job.connection.provider}
          </span>
        </div>
        <StatusIndicator state={job.status as any} label={job.status === 'WAITING_FOR_LIMIT' ? 'LIMITED' : undefined} />
      </div>

      <div className="flex-1 min-h-[80px] md:min-h-[120px] relative">
        {isActive && renderActiveState()}
        {job.status === 'WAITING_FOR_LIMIT' && renderLimitState()}
        {job.status === 'PAUSED' && renderPausedState()}
        {job.status === 'SESSION_EXPIRED' && renderExpiredState()}
        {(job.status === 'FAILED' || job.status === 'STOPPED' || job.status === 'CONNECTION_LOST' || job.status === 'BROWSER_ISSUE') && renderFailedState()}
      </div>
    </motion.div>
  );
};
