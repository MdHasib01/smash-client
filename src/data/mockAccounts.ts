import { ConnectionModel } from '../types/accounts';

export const MOCK_CONNECTIONS: ConnectionModel[] = [
  {
    id: 'conn_1',
    name: 'Gemini API #1',
    provider: 'GOOGLE',
    type: 'API',
    status: 'ACTIVE',
    capabilities: ['TEXT', 'IMAGE', 'VIDEO'],
    priority: 'HIGH',
    enabled: true,
    healthLastChecked: new Date().toISOString(),
    usageToday: 1450,
    costToday: 4.82,
    tags: ['PRIMARY', 'FAST'],
    fallbackId: 'conn_2'
  },
  {
    id: 'conn_2',
    name: 'Gemini Web #3',
    provider: 'GOOGLE',
    type: 'BROWSER',
    status: 'LIMIT_REACHED',
    capabilities: ['TEXT', 'IMAGE', 'VIDEO'],
    priority: 'NORMAL',
    enabled: true,
    profileId: 'browser-profile-003',
    loginEmail: 'milkimominfo@gmail.com',
    limitResetTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString(), // 2h 18m from now
    healthLastChecked: new Date().toISOString(),
    usageToday: 50,
    tags: ['FREE', 'BROWSER']
  },
  {
    id: 'conn_3',
    name: 'ChatGPT Web #1',
    provider: 'OPENAI',
    type: 'BROWSER',
    status: 'SESSION_EXPIRED',
    capabilities: ['TEXT', 'IMAGE'],
    priority: 'HIGH',
    enabled: true,
    profileId: 'browser-profile-001',
    loginEmail: 'admin@smash.ai',
    healthLastChecked: new Date().toISOString(),
    usageToday: 0,
    tags: ['PLUS', 'BROWSER']
  },
  {
    id: 'conn_4',
    name: 'Claude API #1',
    provider: 'ANTHROPIC',
    type: 'API',
    status: 'ACTIVE',
    capabilities: ['TEXT'],
    priority: 'HIGH',
    enabled: true,
    healthLastChecked: new Date().toISOString(),
    usageToday: 820,
    costToday: 12.40,
    tags: ['RESEARCH', 'EXPENSIVE']
  },
  {
    id: 'conn_5',
    name: 'Flux Dev Local',
    provider: 'OLLAMA',
    type: 'LOCAL',
    status: 'OFFLINE',
    capabilities: ['IMAGE'],
    priority: 'NORMAL',
    enabled: true,
    endpoint: 'http://localhost:11434',
    healthLastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    usageToday: 0,
    tags: ['LOCAL', 'GPU']
  },
  {
    id: 'conn_6',
    name: 'Custom REST Inference',
    provider: 'CUSTOM',
    type: 'CUSTOM',
    status: 'ERROR',
    capabilities: ['TEXT', 'AUDIO'],
    priority: 'LOW',
    enabled: false,
    endpoint: 'https://api.custom-ai.net/v1/generate',
    healthLastChecked: new Date().toISOString(),
    usageToday: 12,
    tags: ['EXPERIMENTAL']
  }
];
