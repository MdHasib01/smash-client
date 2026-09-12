export type ConnectionType = 'API' | 'BROWSER' | 'LOCAL' | 'OPEN_SOURCE' | 'CUSTOM';
export type ConnectionProvider = 'OPENAI' | 'GOOGLE' | 'ANTHROPIC' | 'OLLAMA' | 'VLLM' | 'CUSTOM';
export type ConnectionStatus = 'ACTIVE' | 'LIMIT_REACHED' | 'SESSION_EXPIRED' | 'OFFLINE' | 'ERROR' | 'DISABLED';
export type Capability = 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO';
export type ConnectionPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface ConnectionModel {
  id: string;
  name: string;
  provider: ConnectionProvider;
  type: ConnectionType;
  status: ConnectionStatus;
  capabilities: Capability[];
  priority: ConnectionPriority;
  enabled: boolean;
  
  // Browser Specific
  profileId?: string;
  loginEmail?: string;
  
  // API / Remote Specific
  endpoint?: string;
  
  // Limits & Health
  limitResetTime?: string; // ISO String or null
  healthLastChecked?: string; // ISO String
  usageToday?: number; // requests or cost
  costToday?: number;
  
  tags: string[];
  fallbackId?: string;
}
