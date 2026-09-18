import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Job, SessionEvent } from '../../types/execution';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { ExternalLink, RefreshCcw, XCircle, AlertTriangle, Clock, StopCircle, Cpu } from 'lucide-react';
import { AgentTerminal, TerminalLine } from './AgentTerminal';
import { GenerationStage } from './GenerationStage';

interface JobCardProps {
  job: Job;
  mode: string;
  /** Session events: this job's own plus session-wide ones feed the terminal. */
  events?: SessionEvent[];
  onAction: (action: string, jobId: string) => void;
  onClick: (jobId: string) => void;
}

const MAX_TERMINAL_LINES = 200;

/** Session events and the provider transcript, merged in time order. */
function terminalLines(job: Job, events: SessionEvent[]): TerminalLine[] {
  const system: TerminalLine[] = events
    .filter((e) => !e.jobId || e.jobId === job.id)
    .map((e) => ({ key: `e-${e.id}`, time: e.time, text: e.message, source: 'system', tone: e.type }));

  // The server trims the oldest lines, so keys come from content, not position.
  const seen = new Map<string, number>();
  const agent: TerminalLine[] = (job.log ?? []).map((line) => {
    const base = `${line.time}|${line.text}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { key: `l-${base}-${n}`, time: line.time, text: line.text, source: 'agent' };
  });

  return [...system, ...agent].sort((a, b) => a.time - b.time).slice(-MAX_TERMINAL_LINES);
}

/** Which pipeline step the job is on, read from its status and transcript. */
function currentPhase(job: Job, lines: TerminalLine[]): { step: number; label: string } {
  if (job.status === 'RETRYING') return { step: 2, label: `Retrying · attempt ${job.attempts.length}` };

  if (job.status === 'QUEUED' || job.status === 'STARTING') {
    const refining = [...lines].reverse().find((l) => l.source === 'system' && /refin|assembled prompt/i.test(l.text));
    if (refining && /^Refining/i.test(refining.text)) return { step: 1, label: 'Refining prompt' };
    return { step: 0, label: 'In queue' };
  }

  // Only lines from the current attempt count.
  let marker = 0;
  lines.forEach((l, i) => {
    if (l.text.startsWith('── attempt')) marker = i;
  });
  const recent = lines.slice(marker).filter((l) => l.source === 'agent');
  if (recent.some((l) => /fetching|stored in the Smash gallery/i.test(l.text))) return { step: 4, label: 'Saving image' };
  const cliSpoke = recent.some((l) => !/^(\$|▸ connecting|──|…)/.test(l.text.trim()));
  if (cliSpoke) return { step: 3, label: job.connection.type === 'API' ? 'Generating' : 'Agent at work' };
  return { step: 2, label: 'Handing to agent' };
}

export const JobCard: React.FC<JobCardProps> = ({ job, mode, events = [], onAction, onClick }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
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

  const isActive = ['QUEUED', 'STARTING', 'GENERATING', 'PROCESSING', 'RETRYING'].includes(job.status);
  const lines = useMemo(() => terminalLines(job, events), [job, events]);
  const phase = currentPhase(job, lines);
  const attempt = job.attempts[job.attempts.length - 1];
  const previous = job.attempts[job.attempts.length - 2];

  const renderActiveState = () => (
    <div className="flex flex-col gap-3">
      <GenerationStage
        step={phase.step}
        label={phase.label}
        startTime={attempt?.startTime ?? Date.now()}
        mode={mode}
        retrying={job.status === 'RETRYING'}
      />

      {job.status === 'RETRYING' && previous?.error && (
        <div className="text-[10px] text-rose-200/90 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 leading-relaxed">
          <span className="font-bold uppercase tracking-widest text-rose-400 mr-1.5">
            {previous.status === 'VIOLATION' ? 'Policy block' : 'Previous attempt failed'}
          </span>
          {previous.error}
        </div>
      )}

      <AgentTerminal lines={lines} live />

      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary">
        <span className="flex items-center gap-1.5">
          <Cpu size={10} />
          {job.target?.cli ? `${job.target.cli} · ${job.target.model ?? 'default'}` : job.connection.model || job.connection.provider}
        </span>
        <button
          className="flex items-center gap-1 text-smash-text-secondary hover:text-red-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onAction(job.status === 'RETRYING' ? 'STOP_RETRY' : 'STOP', job.id);
          }}
        >
          <StopCircle size={11} /> {job.status === 'RETRYING' ? 'Stop retry' : 'Stop'}
        </button>
      </div>
    </div>
  );

  const renderLimitState = () => (
    <div className="flex flex-col items-center justify-center gap-3 h-full p-2">
      <div className="flex items-center gap-2 text-rose-400">
        <Clock size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Limit Reached</span>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white">{timeLeft || 'Checking...'}</div>
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
          <ExternalLink size={10} /> OPEN SESSION
        </Button>
      </div>
    </div>
  );
  
  const renderFailedState = () => (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 text-red-400">
        <XCircle size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">{job.status.replace('_', ' ')}</span>
      </div>
      {job.error && (
        <p className="text-[11px] text-red-200/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 break-words">{job.error}</p>
      )}
      {lines.length > 0 && <AgentTerminal lines={lines} live={false} />}
      <div className="flex gap-2 w-full">
        <Button variant="secondary" size="sm" className="flex-1 text-[9px] h-7" onClick={(e) => { e.stopPropagation(); onAction('RETRY', job.id) }}>
          <RefreshCcw size={10} /> RETRY NOW
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
          <RefreshCcw size={10} /> RESUME
        </Button>
      </div>
    </div>
  );

  const isError = ['FAILED', 'STOPPED', 'SESSION_EXPIRED', 'OFFLINE', 'CONNECTION_LOST', 'BROWSER_ISSUE'].includes(job.status);
  const isWarning = ['WAITING_FOR_LIMIT', 'PAUSED'].includes(job.status);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(job.id)}
      className={cn(
        "glass-2 rounded-2xl p-5 flex flex-col gap-4 border transition-all cursor-pointer hover:bg-white/[0.03]",
        isError
          ? "border-red-500/20"
          : isWarning
            ? "border-rose-500/20"
            : isActive
              ? "border-white/10"
              : "border-white/5"
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
