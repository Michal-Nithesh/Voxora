import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Transcription } from '@shared/schema';
import { getServerConfig, hasDatabaseConfig } from './config';

export interface ListTranscriptionsOptions {
  ownerId: string;
  page: number;
  limit: number;
  search?: string;
  language?: string;
}

export interface CreateTranscriptionInput {
  ownerId: string;
  title: string;
  transcriptText: string;
  translatedText?: string;
  language: string;
  targetLanguage: string;
  provider: string;
  durationSeconds?: number;
}

export interface UpdateTranscriptionInput {
  title?: string;
  transcriptText?: string;
  translatedText?: string;
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('Transcript database is not configured');
    this.name = 'DatabaseUnavailableError';
  }
}

function toRecord(row: Record<string, unknown>): Transcription {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    title: String(row.title),
    originalText: String(row.original_text),
    translatedText: row.translated_text == null ? null : String(row.translated_text),
    language: String(row.language),
    provider: String(row.provider),
    durationSeconds: row.duration_seconds == null ? null : Number(row.duration_seconds),
    targetLanguage: String(row.target_language),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  } as Transcription;
}

export class TranscriptionStore {
  private readonly client: SupabaseClient | null;

  constructor() {
    const config = getServerConfig();
    this.client = hasDatabaseConfig(config)
      ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  }

  private requireClient(): SupabaseClient {
    if (!this.client) throw new DatabaseUnavailableError();
    return this.client;
  }

  async create(input: CreateTranscriptionInput): Promise<Transcription> {
    const { data, error } = await this.requireClient().from('transcriptions').insert({
      user_id: input.ownerId,
      title: input.title,
      original_text: input.transcriptText,
      translated_text: input.translatedText || null,
      language: input.language,
      target_language: input.targetLanguage,
      provider: input.provider,
      duration_seconds: input.durationSeconds ?? null,
    }).select('*').single();
    if (error) throw error;
    return toRecord(data);
  }

  async list(options: ListTranscriptionsOptions): Promise<{ records: Transcription[]; total: number }> {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    let query = this.requireClient().from('transcriptions').select('*', { count: 'exact' })
      .eq('user_id', options.ownerId).order('created_at', { ascending: false }).range(from, to);
    if (options.language) query = query.eq('language', options.language);
    if (options.search) query = query.or(`title.ilike.%${options.search}%,original_text.ilike.%${options.search}%`);
    const { data, error, count } = await query;
    if (error) throw error;
    return { records: (data ?? []).map(toRecord), total: count ?? 0 };
  }

  async get(id: string, ownerId: string): Promise<Transcription | null> {
    const { data, error } = await this.requireClient().from('transcriptions').select('*').eq('id', id).eq('user_id', ownerId).maybeSingle();
    if (error) throw error;
    return data ? toRecord(data) : null;
  }

  async update(id: string, ownerId: string, input: UpdateTranscriptionInput): Promise<Transcription | null> {
    const patch: Record<string, string> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.transcriptText !== undefined) patch.original_text = input.transcriptText;
    if (input.translatedText !== undefined) patch.translated_text = input.translatedText;
    const { data, error } = await this.requireClient().from('transcriptions').update(patch).eq('id', id).eq('user_id', ownerId).select('*').maybeSingle();
    if (error) throw error;
    return data ? toRecord(data) : null;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const { data, error } = await this.requireClient().from('transcriptions').delete().eq('id', id).eq('user_id', ownerId).select('id');
    if (error) throw error;
    return Boolean(data?.length);
  }
}

export const transcriptionStore = new TranscriptionStore();