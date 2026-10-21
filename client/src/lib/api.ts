import { getAuthSession } from './auth';
export interface TranscriptionRecord {
  id: string;
  userId: string | null;
  title: string;
  originalText: string;
  translatedText: string | null;
  language: string;
  provider: string;
  durationSeconds: number | null;
  targetLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionListResponse {
  data: TranscriptionRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const ownerKey = 'voxora-owner-id';

function getOwnerId(): string {
  const existing = sessionStorage.getItem(ownerKey);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(ownerKey, id);
  return id;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getAuthSession();
  const authorization = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('x-voxora-owner', getOwnerId());
  if (authorization.Authorization) headers.set('Authorization', authorization.Authorization);
  const response = await fetch(path, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function listTranscriptions(params: { page?: number; limit?: number; search?: string; language?: string } = {}) {
  const query = new URLSearchParams();
  query.set('page', String(params.page || 1));
  query.set('limit', String(params.limit || 10));
  if (params.search) query.set('search', params.search);
  if (params.language) query.set('language', params.language);
  return request<TranscriptionListResponse>(`/api/transcriptions?${query}`);
}

export function getTranscription(id: string) {
  return request<{ data: TranscriptionRecord }>(`/api/transcriptions/${id}`);
}

export function createTranscription(input: { title?: string; transcriptText: string; translatedText?: string; language: string; targetLanguage: string; provider: string; durationSeconds?: number }) {
  return request<{ data: TranscriptionRecord }>('/api/transcriptions', { method: 'POST', body: JSON.stringify(input) });
}

export function updateTranscription(id: string, input: { title?: string; transcriptText?: string; translatedText?: string }) {
  return request<{ data: TranscriptionRecord }>(`/api/transcriptions/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteTranscription(id: string) {
  return request<void>(`/api/transcriptions/${id}`, { method: 'DELETE' });
}