import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ExecutionSession, Job } from '../types/execution';
import { useAccounts, SmashConnection, Capability } from './AccountsContext';
import { useToast } from './ToastContext';
import { get, list, post } from '../lib/api';
import {
  AgentTarget,
  ApiResult,
  CreateSessionBody,
  GenerationContext,
  GenerationOptions,
  Session as ApiSession,
  isSessionTerminal,
} from '../types/api';

export interface StartSessionInput {
  mode: Capability;
  prompt: string;
  connectionIds: string[];
  personaId?: string | null;
  styleId?: string | null;
  referenceIds?: string[];
  options?: GenerationOptions;
  agentTargets?: Record<string, AgentTarget>;
  /** Brand to file the run under; a persona's own brand still wins server-side. */
  projectId?: string | null;
}

interface ExecutionContextState {
  currentSession: ExecutionSession | null;
  /** Compiled persona/style/prompt for the running session, once the server reports it. */
  context: GenerationContext | null;
  isStarting: boolean;
  startSession: (input: StartSessionInput) => Promise<void>;
  handleJobAction: (action: string, jobId: string) => void;
  stopSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  clearSession: () => void;
}

const ExecutionContext = createContext<ExecutionContextState | undefined>(undefined);

const POLL_INTERVAL_MS = 2000;

const toMillis = (value?: string | number) => {
  if (value === undefined || value === null) return Date.now();
  return typeof value === 'number' ? value : new Date(value).getTime();
};

/**
 * Map a server session onto the shape the execution UI already renders.
 * Connection details are enriched from the accounts list where possible; the
 * job's own denormalised snapshot is the fallback, so history still reads
 * correctly after a connection is renamed or deleted.
 */
function toExecutionSession(
  session: ApiSession,
  connections: SmashConnection[],
  results: Map<string, ApiResult> = new Map()
): ExecutionSession {
  const byId = new Map(connections.map((c) => [c.id, c]));

  const jobs: Job[] = session.jobs.map((job) => {
    const snapshot = job.connection;
    const known = byId.get(String(job.connectionId));
    const connection: SmashConnection =
      known ??
      ({
        id: String(job.connectionId),
        name: snapshot?.name ?? 'Connection',
        provider: snapshot?.provider ?? '',
        model: snapshot?.model ?? '',
        type: (snapshot?.type as SmashConnection['type']) ?? 'API',
        capabilities: [job.mode],
        status: 'ACTIVE',
        health: 100,
        priority: 1,
        enabled: true,
      } as SmashConnection);

    return {
      id: job.id,
      connection,
      status: job.status as Job['status'],
      progress: job.progress,
      duration: job.duration,
      resultUrl: results.get(job.id)?.contentUrl ?? job.resultUrl,
      resultId: results.get(job.id)?.id ?? job.result,
      contentText: results.get(job.id)?.contentText,
      mimeType: results.get(job.id)?.mimeType,
      personaName: job.context?.personaName,
      styleName: job.context?.styleName,
      target: job.target,
      error: job.error,
      log: (job.log ?? []).map((line) => ({ time: toMillis(line.time), text: line.text })),
      attempts: (job.attempts ?? []).map((attempt: any) => ({
        number: attempt.number,
        kind: attempt.kind,
        error: attempt.error,
        startTime: toMillis(attempt.startTime),
        prompt: attempt.prompt ?? session.prompt,
        status: attempt.status,
        duration: attempt.duration,
      })),
    };
  });

  return {
    id: session.id,
    mode: session.mode as Capability,
    prompt: session.prompt,
    startTime: toMillis(session.startTime),
    status: session.status,
    jobs,
    events: (session.events ?? []).map((event, index) => ({
      id: event.id ?? `${session.id}-${index}`,
      time: toMillis(event.time),
      message: event.message,
      type: event.type,
      jobId: event.jobId,
    })),
  };
}

export const ExecutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ExecutionSession | null>(null);
  const [context, setContext] = useState<GenerationContext | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const { connections, reload: reloadConnections } = useAccounts();
  const { addToast } = useToast();

  const sessionIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Read inside the poll without making it a dependency.
  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;
  // Output per job id, fetched once each job completes.
  const resultsRef = useRef<Map<string, ApiResult>>(new Map());

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applySession = useCallback((session: ApiSession) => {
    setCurrentSession(toExecutionSession(session, connectionsRef.current, resultsRef.current));
    if (session.context) setContext(session.context as GenerationContext);
    return session;
  }, []);

  const loadResults = useCallback(async (sessionId: string) => {
    try {
      const { items } = await list<ApiResult>('/results', { session: sessionId, limit: 100 });
      const next = new Map(resultsRef.current);
      for (const result of items) if (result.job) next.set(String(result.job), result);
      resultsRef.current = next;
    } catch (err) {
      console.error('[execution] could not load results:', (err as Error).message);
    }
  }, []);

  const poll = useCallback(async () => {
    const id = sessionIdRef.current;
    if (!id) return;
    try {
      const session = await get<ApiSession>(`/sessions/${id}`);
      // Pull output for newly finished jobs before rendering, so a card never
      // shows "complete" with nothing in it.
      if (session.jobs.some((j) => j.status === 'COMPLETE' && !resultsRef.current.has(j.id))) {
        await loadResults(id);
      }
      applySession(session);

      if (isSessionTerminal(session.status)) {
        stopPolling();
        // Costs and limit states move during a run.
        reloadConnections();
      }
    } catch (err) {
      // A transient blip should not kill the view; the next tick retries.
      console.error('[execution] poll failed:', (err as Error).message);
    }
  }, [applySession, stopPolling, reloadConnections, loadResults]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [poll, stopPolling]);

  useEffect(() => stopPolling, [stopPolling]);

  const startSession = useCallback(
    async (input: StartSessionInput) => {
      setIsStarting(true);
      try {
        const body: CreateSessionBody = {
          mode: input.mode as CreateSessionBody['mode'],
          prompt: input.prompt,
          connectionIds: input.connectionIds,
          ...(input.projectId ? { project: input.projectId } : {}),
          ...(input.personaId ? { persona: input.personaId } : {}),
          ...(input.styleId ? { style: input.styleId } : {}),
          ...(input.referenceIds?.length ? { referenceIds: input.referenceIds } : {}),
          ...(input.options ? { options: input.options } : {}),
          ...(input.agentTargets && Object.keys(input.agentTargets).length ? { agentTargets: input.agentTargets } : {}),
        };

        resultsRef.current = new Map();
        const session = await post<ApiSession>('/sessions', body);
        sessionIdRef.current = session.id;
        applySession(session);
        startPolling();
      } catch (err) {
        addToast((err as Error).message, 'ERROR');
        throw err;
      } finally {
        setIsStarting(false);
      }
    },
    [applySession, startPolling, addToast]
  );

  /** All seven server-side job actions go through one endpoint. */
  const handleJobAction = useCallback(
    async (action: string, jobId: string) => {
      const id = sessionIdRef.current;
      if (!id) return;
      try {
        await post(`/sessions/${id}/jobs/${jobId}/actions`, { action });
        await poll();
        startPolling();
      } catch (err) {
        addToast((err as Error).message, 'ERROR');
      }
    },
    [poll, startPolling, addToast]
  );

  const sessionCommand = useCallback(
    async (command: 'stop' | 'pause' | 'resume') => {
      const id = sessionIdRef.current;
      if (!id) return;
      try {
        const session = await post<ApiSession>(`/sessions/${id}/${command}`);
        applySession(session);
        if (command === 'resume') startPolling();
        else if (isSessionTerminal(session.status)) stopPolling();
      } catch (err) {
        addToast((err as Error).message, 'ERROR');
      }
    },
    [applySession, startPolling, stopPolling, addToast]
  );

  const clearSession = useCallback(() => {
    stopPolling();
    sessionIdRef.current = null;
    resultsRef.current = new Map();
    setCurrentSession(null);
    setContext(null);
  }, [stopPolling]);

  return (
    <ExecutionContext.Provider
      value={{
        currentSession,
        context,
        isStarting,
        startSession,
        handleJobAction,
        stopSession: () => sessionCommand('stop'),
        pauseSession: () => sessionCommand('pause'),
        resumeSession: () => sessionCommand('resume'),
        clearSession,
      }}
    >
      {children}
    </ExecutionContext.Provider>
  );
};

export const useExecution = () => {
  const context = useContext(ExecutionContext);
  if (context === undefined) {
    throw new Error('useExecution must be used within an ExecutionProvider');
  }
  return context;
};
