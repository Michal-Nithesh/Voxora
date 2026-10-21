import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const transcriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  title: z.string().default("Untitled transcription"),
  originalText: z.string(),
  translatedText: z.string().nullable().optional(),
  language: z.string().default("en"),
  provider: z.string().default("unknown"),
  durationSeconds: z.number().int().nullable().optional(),
  targetLanguage: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const insertTranscriptionSchema = transcriptionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Transcription = {
  id: string;
  userId: string | null;
  title: string;
  originalText: string;
  translatedText: string | null;
  language: string;
  provider: string;
  durationSeconds: number | null;
  targetLanguage: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
