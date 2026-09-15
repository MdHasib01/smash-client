import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { list, patch, post } from '../lib/api';
import { ConnectionAdapter } from '../types/api';
import { useAuth } from './AuthContext';

export type ConnectionType = 'API' | 'BROWSER' | 'LOCAL' | 'OPEN_SOURCE' | 'CUSTOM';
export type Capability = 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO';
export type AccountStatus =
  | 'ACTIVE'
  | 'IN_USE'
  | 'LIMIT_REACHED'
  | 'SESSION_EXPIRED'
  | 'LOGIN_REQUIRED'
  | 'OFFLINE'
  | 'DISABLED'
  | 'API_ERROR'
  | 'ERROR';

export interface SmashConnection {
  id: string;
  provider: string;
  name: string;
  model: string;
  type: ConnectionType;
  /** Which provider adapter actually runs this connection. */
  adapter?: ConnectionAdapter;
  capabilities: Capability[];
  status: AccountStatus;
  health: number;
  limitState?: string;
  priority: number;
  fallbackId?: string;
  enabled: boolean;
  hasApiKey?: boolean;
  apiKeyLast4?: string;
  tags?: string[];
  usageToday?: number;
  costToday?: number;
}

interface AccountsContextType {
  connections: SmashConnection[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateConnection: (id: string, updates: Partial<SmashConnection>) => Promise<void>;
  toggleConnection: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<{ reachable: boolean | null; message: string; latencyMs?: number }>;
  createConnection: (input: Partial<SmashConnection> & { apiKey?: string }) => Promise<SmashConnection>;
  getConnectionsByMode: (mode: string) => SmashConnection[];
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

const CAP_BY_MODE: Record<string, Capability> = {
  text: 'TEXT',
  image: 'IMAGE',
  video: 'VIDEO',
  audio: 'AUDIO',
};

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<SmashConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const { items } = await list<SmashConnection>('/connections', { limit: 100 });
      setConnections(items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) reload();
    else setConnections([]);
  }, [user, reload]);

  const updateConnection = useCallback(async (id: string, updates: Partial<SmashConnection>) => {
    const updated = await patch<SmashConnection>(`/connections/${id}`, updates);
    setConnections((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const toggleConnection = useCallback(async (id: string) => {
    const updated = await post<SmashConnection>(`/connections/${id}/toggle`);
    setConnections((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const testConnection = useCallback(async (id: string) => {
    const result = await post<{ connection: SmashConnection; check: any }>(`/connections/${id}/test`);
    setConnections((prev) => prev.map((c) => (c.id === id ? result.connection : c)));
    return result.check;
  }, []);

  const createConnection = useCallback(async (input: Partial<SmashConnection> & { apiKey?: string }) => {
    const created = await post<SmashConnection>('/connections', input);
    setConnections((prev) => [...prev, created]);
    return created;
  }, []);

  const getConnectionsByMode = useCallback(
    (mode: string) => {
      const required = CAP_BY_MODE[mode.toLowerCase()];
      if (!required) return [];
      return connections.filter((c) => c.capabilities.includes(required));
    },
    [connections]
  );

  return (
    <AccountsContext.Provider
      value={{
        connections,
        isLoading,
        error,
        reload,
        updateConnection,
        toggleConnection,
        testConnection,
        createConnection,
        getConnectionsByMode,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};
