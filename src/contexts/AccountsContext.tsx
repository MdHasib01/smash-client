import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ConnectionType = 'API' | 'BROWSER' | 'LOCAL' | 'CUSTOM';
export type Capability = 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO';
export type AccountStatus = 'ACTIVE' | 'IN_USE' | 'LIMIT_REACHED' | 'SESSION_EXPIRED' | 'LOGIN_REQUIRED' | 'OFFLINE' | 'DISABLED' | 'API_ERROR';

export interface SmashConnection {
  id: string;
  provider: string;
  name: string;
  model: string;
  type: ConnectionType;
  capabilities: Capability[];
  status: AccountStatus;
  health: number;
  limitState?: string;
  priority: number;
  fallbackId?: string;
  enabled: boolean;
}

interface AccountsContextType {
  connections: SmashConnection[];
  setConnections: React.Dispatch<React.SetStateAction<SmashConnection[]>>;
  updateConnection: (id: string, updates: Partial<SmashConnection>) => void;
  toggleConnection: (id: string) => void;
  getConnectionsByMode: (mode: string) => SmashConnection[];
}

const defaultConnections: SmashConnection[] = [
  { id: 'c1', provider: 'Google', name: 'Gemini Web #1', model: 'Gemini 1.5 Pro', type: 'BROWSER', capabilities: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'], status: 'ACTIVE', health: 100, priority: 1, enabled: true },
  { id: 'c2', provider: 'Google', name: 'Gemini API #1', model: 'Gemini 1.5 Flash', type: 'API', capabilities: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'], status: 'ACTIVE', health: 100, limitState: '$45/$100', priority: 2, enabled: true },
  { id: 'c3', provider: 'Anthropic', name: 'Claude API', model: 'Claude 3.5 Sonnet', type: 'API', capabilities: ['TEXT'], status: 'LIMIT_REACHED', health: 20, limitState: 'Resets 2h', priority: 1, enabled: true },
  { id: 'c4', provider: 'Midjourney', name: 'Midjourney Bot #1', model: 'v6.0', type: 'BROWSER', capabilities: ['IMAGE'], status: 'IN_USE', health: 90, priority: 1, enabled: true },
  { id: 'c5', provider: 'OpenAI', name: 'Sora API', model: 'Sora 1.0', type: 'API', capabilities: ['VIDEO'], status: 'ACTIVE', health: 100, priority: 1, enabled: true },
  { id: 'c6', provider: 'Runway', name: 'Runway Gen-3', model: 'Gen-3 Alpha', type: 'API', capabilities: ['VIDEO'], status: 'API_ERROR', health: 0, priority: 2, enabled: false },
  { id: 'c7', provider: 'Suno', name: 'Suno Web #1', model: 'v3.5', type: 'BROWSER', capabilities: ['AUDIO'], status: 'SESSION_EXPIRED', health: 0, priority: 1, enabled: true },
  { id: 'c8', provider: 'Local', name: 'Flux Local', model: 'Flux.1 Schnell', type: 'LOCAL', capabilities: ['IMAGE'], status: 'OFFLINE', health: 0, priority: 2, enabled: false },
];

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<SmashConnection[]>(defaultConnections);

  const updateConnection = (id: string, updates: Partial<SmashConnection>) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleConnection = (id: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const getConnectionsByMode = (mode: string) => {
    const capMap: Record<string, Capability> = {
      text: 'TEXT',
      image: 'IMAGE',
      video: 'VIDEO',
      audio: 'AUDIO'
    };
    const requiredCap = capMap[mode.toLowerCase()];
    if (!requiredCap) return [];
    
    return connections.filter(c => c.capabilities.includes(requiredCap));
  };

  return (
    <AccountsContext.Provider value={{ connections, setConnections, updateConnection, toggleConnection, getConnectionsByMode }}>
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
