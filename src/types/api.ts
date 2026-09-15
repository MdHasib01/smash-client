/**
 * Payload types mirroring the SMASH server models.
 * `toJSON` maps Mongo's `_id` to `id` on every document, including subdocuments.
 */

export type Capability = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export type PersonaKind = 'BRAND' | 'PRODUCT' | 'PROFILE';

export type ReferenceRole =
  | 'LOGO'
  | 'PRODUCT'
  | 'PERSON'
  | 'CHILD'
  | 'PET'
  | 'STYLE_REF'
  | 'BACKGROUND'
  | 'OTHER';

export type ConnectionAdapter = 'SIMULATOR' | 'GEMINI' | 'NODE_AGENT';

export type AspectRatio = '1:1' | '4:5' | '3:4' | '9:16' | '16:9' | '4:3';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SMM' | 'DESIGNER' | 'VIEWER';
  allProjects?: boolean;
  preferences?: { activeProject?: string; lastUsedMode?: string };
}

/** A brand. Called "Project" server-side; surfaced as a Brand in the UI. */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isArchived: boolean;
}

export interface AssetRef {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

export interface PersonaReference {
  id: string;
  /** Populated on read, an id string on write. */
  asset: AssetRef | string;
  role: ReferenceRole;
  /** The human tag: "me", "my son Rayan", "400g tin, front". */
  label: string;
  notes?: string;
  isPrimary: boolean;
  order: number;
}

export interface StylePreset {
  id: string;
  project: string | Brand | null;
  name: string;
  description?: string;
  prompt: string;
  negativePrompt?: string;
  thumbnailUrl?: string;
  tags: string[];
  modes: Capability[];
  isBuiltIn: boolean;
  usageCount: number;
}

export interface Persona {
  id: string;
  project: Brand | string;
  name: string;
  kind: PersonaKind;
  description?: string;
  /** Master art-direction prompt, sent verbatim with every generation. */
  brandBrief?: string;
  promptGuidelines?: string;
  negativePrompt?: string;
  defaultStyle?: StylePreset | string | null;
  refinePrompts: boolean;
  references: PersonaReference[];
  isDefault: boolean;
  isArchived: boolean;
  usageCount: number;
  referenceCount?: number;
}

export interface GenerationOptions {
  aspectRatio?: AspectRatio;
  resolution?: string;
  outputIndex?: number;
  outputsPerModel?: number;
}

/** What the prompt compiler resolved for one generation. */
export interface GenerationContext {
  persona?: string;
  personaName?: string;
  personaKind?: PersonaKind;
  style?: string;
  styleName?: string;
  rawPrompt: string;
  finalPrompt: string;
  negativePrompt?: string;
  references: { asset?: string; url: string; label: string; role: ReferenceRole }[];
  options: GenerationOptions;
  compiledBy: 'DETERMINISTIC' | 'NODE_AGENT';
  compileNote?: string;
}

export interface Connection {
  id: string;
  name: string;
  provider: string;
  model: string;
  type: 'API' | 'BROWSER' | 'LOCAL' | 'OPEN_SOURCE' | 'CUSTOM';
  adapter: ConnectionAdapter;
  capabilities: Capability[];
  status: string;
  health: number;
  limitState?: string;
  priority: number;
  enabled: boolean;
  hasApiKey?: boolean;
  apiKeyLast4?: string;
  tags: string[];
  usageToday?: number;
  costToday?: number;
}

export interface JobSummary {
  id: string;
  mode: Capability;
  connectionId: string;
  connection: { id: string; name: string; provider: string; model: string; type: string };
  status: string;
  progress: number;
  duration?: number;
  cost: number;
  error?: string;
  resultUrl?: string;
  result?: string;
  context?: GenerationContext;
  target?: AgentTarget;
  attempts: { number: number; kind: string; status: string; error?: string; duration?: number }[];
}

export interface SessionEvent {
  id?: string;
  time: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  jobId?: string;
}

export interface Session {
  id: string;
  code: string;
  project?: Brand | string;
  mode: Capability;
  prompt: string;
  status: 'RUNNING' | 'PARTIALLY_COMPLETE' | 'WAITING' | 'PAUSED' | 'COMPLETE' | 'FAILED' | 'STOPPED';
  startTime: string;
  endTime?: string;
  events: SessionEvent[];
  context?: GenerationContext;
  jobs: JobSummary[];
}

export interface CreateSessionBody {
  mode: Capability;
  prompt: string;
  connectionIds: string[];
  project?: string;
  persona?: string;
  style?: string;
  /** Persona reference ids to use for this run; omit to use all of them. */
  referenceIds?: string[];
  extraAssetIds?: string[];
  options?: GenerationOptions;
  refine?: boolean;
  /** Per-run CLI/model for node-agent connections, keyed by connection id. */
  agentTargets?: Record<string, AgentTarget>;
}

export interface AgentTarget {
  cli?: string;
  model?: string;
}

/** One CLI the node-agent token can use, as reported by node-agent's /api/clis. */
export interface AgentCli {
  cli: string;
  label: string;
  vendor?: string;
  available?: boolean;
  auth?: string;
}

export interface AgentTools {
  name: string;
  configured: boolean;
  hasToken?: boolean;
  reachable: boolean;
  latencyMs?: number;
  message?: string;
  clis: string[];
  /** The CLIs the node-agent token may use, with labels and sign-in state. */
  agents?: AgentCli[];
  types?: string[];
  models: Record<string, { id: string; label: string; description?: string }[]>;
  defaults: { cli?: string; model?: string };
  refinePrompts?: boolean;
  adapters: {
    key: ConnectionAdapter;
    label: string;
    supports: Capability[];
    simulated: boolean;
    requiresApiKey: boolean;
    supportsReferenceImages: boolean;
  }[];
  usage?: unknown;
  checkedAt?: string;
  cached?: boolean;
}

/** One generated output, from GET /api/results. */
export interface ApiResult {
  id: string;
  job?: string;
  session?: string;
  project?: Brand | string | null;
  mode: Capability;
  connection?: { id?: string; name: string; provider: string; model?: string; type?: string };
  prompt?: string;
  duration?: number;
  status: 'APPROVED' | 'SHORTLISTED' | 'REJECTED' | 'NONE';
  isFavorite: boolean;
  contentUrl?: string;
  contentText?: string;
  mimeType?: string;
  context?: GenerationContext;
  createdAt: string;
}

export const TERMINAL_SESSION_STATUSES = ['COMPLETE', 'PARTIALLY_COMPLETE', 'FAILED', 'STOPPED'] as const;

export const isSessionTerminal = (status: string) =>
  (TERMINAL_SESSION_STATUSES as readonly string[]).includes(status);
