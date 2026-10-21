import {
  correctAndTranslateWithGemini,
  correctTranscriptWithGemini,
  retroactiveCorrectionWithGemini,
  isConfiguredGeminiKey,
} from './gemini';

export function isConfiguredAnthropicKey(key?: string): boolean {
  return isConfiguredGeminiKey(key);
}

export const correctAndTranslateWithClaude = correctAndTranslateWithGemini;
export const correctTranscriptWithClaude = correctTranscriptWithGemini;
export const retroactiveCorrectionWithClaude = retroactiveCorrectionWithGemini;
