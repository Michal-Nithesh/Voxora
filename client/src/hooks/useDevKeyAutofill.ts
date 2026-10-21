import { useEffect } from 'react';
import type { AppSettings } from './useSettings';

/**
 * In development, fills API keys that are still empty from the server's .env
 * (GET /api/dev-config — 403 in production and for non-loopback callers), so
 * you don't have to retype them every session. Never overwrites a key you set.
 * Used by every page that owns a settings instance, since either can be the
 * first one opened (Sermon mode is "/", Live mode is "/live").
 */
export function useDevKeyAutofill(
  settings: AppSettings,
  updateSettings: (updates: Partial<AppSettings>) => void,
) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    fetch('/api/dev-config')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        const updates: Partial<AppSettings> = {};
        const isRealKey = (k?: string) => Boolean(k && !k.includes('...') && k.trim().length > 15);

        // Clear stale invalid keys in state/storage
        if (settings.openaiApiKey && !isRealKey(settings.openaiApiKey)) {
          updates.openaiApiKey = '';
        }
        if (settings.anthropicApiKey && !isRealKey(settings.anthropicApiKey)) {
          updates.anthropicApiKey = '';
        }
        if (settings.esvApiKey && settings.esvApiKey.includes('...')) {
          updates.esvApiKey = '';
        }

        // Fill valid keys from server dev-config if current is missing or was placeholder
        if (isRealKey(data.openaiApiKey) && (!settings.openaiApiKey || !isRealKey(settings.openaiApiKey))) {
          updates.openaiApiKey = data.openaiApiKey;
        }
        if (isRealKey(data.anthropicApiKey) && (!settings.anthropicApiKey || !isRealKey(settings.anthropicApiKey))) {
          updates.anthropicApiKey = data.anthropicApiKey;
        }
        if (data.esvApiKey && !data.esvApiKey.includes('...') && (!settings.esvApiKey || settings.esvApiKey.includes('...'))) {
          updates.esvApiKey = data.esvApiKey;
        }

        if (Object.keys(updates).length) updateSettings(updates);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
