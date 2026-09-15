import { Capability } from '../contexts/AccountsContext';
import { SmashConnection } from '../contexts/AccountsContext';

export type SessionStatus = 'RUNNING' | 'PARTIALLY_COMPLETE' | 'WAITING' | 'PAUSED' | 'COMPLETE' | 'FAILED' | 'STOPPED';
export type JobStatus = 'READY' | 'QUEUED' | 'STARTING' | 'GENERATING' | 'PROCESSING' | 'RETRYING' | 'WAITING_FOR_LIMIT' | 'PAUSED' | 'COMPLETE' | 'FAILED' | 'STOPPED' | 'SESSION_EXPIRED' | 'OFFLINE' | 'CONNECTION_LOST' | 'BROWSER_ISSUE';
export type EventType = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface Attempt {
  number: number;
  startTime: number;
  prompt: string;
  status: 'RUNNING' | 'VIOLATION' | 'ERROR' | 'COMPLETE';
  duration?: number;
}

export interface SessionEvent {
  id: string;
  time: number;
  message: string;
  type: EventType;
  jobId?: string;
}

export interface Job {
  id: string;
  connection: SmashConnection;
  status: JobStatus;
  progress?: number;
  attempts: Attempt[];
  duration?: number;
  resultUrl?: string;
  /** Output of a finished job, filled in from its Result. */
  resultId?: string;
  contentText?: string;
  mimeType?: string;
  personaName?: string;
  styleName?: string;
  /** The node-agent CLI/model this job ran on, if any. */
  target?: { cli?: string; model?: string };
  error?: string;
  limitResetTime?: number;
  autoResume?: boolean;
}

export interface ExecutionSession {
  id: string;
  mode: Capability;
  prompt: string;
  startTime: number;
  status: SessionStatus;
  jobs: Job[];
  events: SessionEvent[];
}
