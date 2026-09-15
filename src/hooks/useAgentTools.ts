import { useCallback, useEffect, useState } from 'react';
import { get } from '../lib/api';
import { AgentTools } from '../types/api';

/**
 * Shared, memoised view of GET /api/agent-tools. The Accounts panel and the
 * Generate model picker both read it; one in-flight request serves both, and
 * the server caches the node-agent fan-out for a minute anyway.
 */
let cached: AgentTools | null = null;
let inflight: Promise<AgentTools> | null = null;

function fetchAgentTools(refresh = false) {
  if (!refresh && inflight) return inflight;
  inflight = get<AgentTools>('/agent-tools', refresh ? { refresh: true } : undefined)
    .then((data) => {
      cached = data;
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useAgentTools() {
  const [tools, setTools] = useState<AgentTools | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      setTools(await fetchAgentTools(refresh));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cached) load();
  }, [load]);

  return { tools, isLoading, error, reload: load };
}
