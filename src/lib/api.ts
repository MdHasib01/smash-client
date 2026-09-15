/**
 * Thin client for the SMASH API.
 *
 * The server always answers with `{ success, data, meta?, message? }`, so every
 * helper here unwraps that envelope and throws `ApiError` on failure - callers
 * deal in plain data, never in response shapes.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'smash.token';

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** The session is gone or expired and the user has to sign in again. */
  get isAuthError() {
    return this.status === 401;
  }
}

// --- Token storage ---------------------------------------------------------
// localStorage can throw in private windows, so every access is guarded.

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable - the session just won't survive a reload */
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  /** Pass a FormData body straight through without JSON encoding. */
  form?: FormData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; meta?: ApiMeta }> {
  const { method = 'GET', body, query, signal, form } = options;
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Let the browser set the multipart boundary itself.
        ...(body !== undefined && !form ? { 'Content-Type': 'application/json' } : {}),
      },
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiError(0, 'Cannot reach the SMASH server. Is it running on port 5000?');
  }

  const text = await response.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(response.status, `Unexpected response from the server (${response.status})`);
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(response.status, payload?.message ?? `Request failed (${response.status})`, payload);
  }

  return { data: payload.data as T, meta: payload.meta };
}

/** Returns just the data; use `list` when you also need pagination meta. */
export async function api<T>(path: string, options?: RequestOptions): Promise<T> {
  return (await request<T>(path, options)).data;
}

export async function list<T>(path: string, query?: Query): Promise<{ items: T[]; meta?: ApiMeta }> {
  const { data, meta } = await request<T[]>(path, { query });
  return { items: data ?? [], meta };
}

export const get = <T,>(path: string, query?: Query) => api<T>(path, { query });
export const post = <T,>(path: string, body?: unknown) => api<T>(path, { method: 'POST', body });
export const patch = <T,>(path: string, body?: unknown) => api<T>(path, { method: 'PATCH', body });
export const del = <T,>(path: string) => api<T>(path, { method: 'DELETE' });

/** Multipart upload, e.g. a persona reference image. */
export const upload = <T,>(path: string, form: FormData) => api<T>(path, { method: 'POST', form });
