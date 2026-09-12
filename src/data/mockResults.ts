import { Job, ExecutionSession } from '../types/execution';
import { MOCK_CONNECTIONS } from './mockAccounts';

export interface AIJudgeScore {
  overall: number;
  criteria: Record<string, number>;
  explanation: string;
  issues: string[];
}

export interface ResultMetadata {
  id: string;
  jobId: string;
  sessionId: string;
  mode: 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO';
  connection: any;
  prompt: string;
  duration: number;
  timestamp: number;
  tags: string[];
  status: 'APPROVED' | 'SHORTLISTED' | 'REJECTED' | 'NONE';
  isFavorite: boolean;
  score?: AIJudgeScore;
  contentUrl?: string; // For image, video, audio
  contentText?: string; // For text
  lineage?: string[];
}

export const MOCK_RESULTS: ResultMetadata[] = [
  {
    id: 'res_1',
    jobId: 'job_1',
    sessionId: 'SM-IMG-101',
    mode: 'IMAGE',
    connection: MOCK_CONNECTIONS[0], // Gemini API
    prompt: 'A futuristic smart home AI control hub, dark glassmorphism interface, glowing magenta accents.',
    duration: 3.2,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    tags: ['CONCEPT'],
    status: 'APPROVED',
    isFavorite: true,
    contentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    score: {
      overall: 94,
      criteria: {
        'Prompt Adherence': 95,
        'Visual Quality': 92,
        'Composition': 96
      },
      explanation: 'Excellent adherence to the prompt with strong composition and perfect glassmorphism rendering.',
      issues: []
    }
  },
  {
    id: 'res_2',
    jobId: 'job_2',
    sessionId: 'SM-IMG-101',
    mode: 'IMAGE',
    connection: MOCK_CONNECTIONS[1], // Gemini Web
    prompt: 'A futuristic smart home AI control hub, dark glassmorphism interface, glowing magenta accents.',
    duration: 5.1,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    tags: [],
    status: 'NONE',
    isFavorite: false,
    contentUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    score: {
      overall: 82,
      criteria: {
        'Prompt Adherence': 85,
        'Visual Quality': 80,
        'Composition': 81
      },
      explanation: 'Good attempt, but the lighting is slightly too bright for a dark glassmorphism theme.',
      issues: ['Lighting imbalance']
    }
  },
  {
    id: 'res_3',
    jobId: 'job_3',
    sessionId: 'SM-TXT-202',
    mode: 'TEXT',
    connection: MOCK_CONNECTIONS[3], // Claude API
    prompt: 'Write a landing page copy for SMASH, emphasizing multi-model orchestration.',
    duration: 4.8,
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    tags: ['COPYWRITING', 'WEBSITE'],
    status: 'SHORTLISTED',
    isFavorite: true,
    contentText: '# SMASH\n\n**The Ultimate Multi-AI Orchestration Hub.**\n\nRun Gemini, OpenAI, Claude, and local open-source models simultaneously from a single, unified interface. Compare results instantly. Automate fallbacks. Defeat limitations.\n\n*Why choose one when you can orchestrate them all?*',
    score: {
      overall: 96,
      criteria: {
        'Instruction Adherence': 98,
        'Tone': 95,
        'Clarity': 95
      },
      explanation: 'Punchy, highly persuasive, and perfectly captures the product value proposition without fluff.',
      issues: []
    }
  },
  {
    id: 'res_4',
    jobId: 'job_4',
    sessionId: 'SM-TXT-202',
    mode: 'TEXT',
    connection: MOCK_CONNECTIONS[2], // ChatGPT Web
    prompt: 'Write a landing page copy for SMASH, emphasizing multi-model orchestration.',
    duration: 6.2,
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    tags: [],
    status: 'NONE',
    isFavorite: false,
    contentText: '# Welcome to SMASH\n\nSupercharge your workflow with the Smart Multi-AI System Hub. By empowering users to synergize various AI paradigms into a cohesive technological tapestry, SMASH revolutionizes productivity paradigms.\n\nKey Features:\n- Multi-model connectivity\n- Real-time comparisons',
    score: {
      overall: 71,
      criteria: {
        'Instruction Adherence': 80,
        'Tone': 65,
        'Clarity': 70
      },
      explanation: 'Uses overly generic SaaS marketing jargon ("Supercharge", "empowering", "synergize"). Fails the Anti-Slop guidelines.',
      issues: ['Generic SaaS verbs', 'Fluffy tone']
    }
  }
];
