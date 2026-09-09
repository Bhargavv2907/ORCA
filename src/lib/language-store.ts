// ============================================================
// ORCA Language Store — Shared language state for all pages & voice audio
// Persisted in localStorage so every component uses the selected language
// ============================================================

import { COASTAL_LANGUAGES, LanguageVoiceConfig } from '@/lib/i18n-engine';

const STORAGE_KEY = 'orca_selected_language';

export const DEFAULT_LANGUAGE = COASTAL_LANGUAGES[0]; // English

/** Reads the currently selected language from localStorage (defaults to English) */
export function getSelectedLanguage(): LanguageVoiceConfig {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_LANGUAGE;
    const found = COASTAL_LANGUAGES.find(
      l => l.code === stored || l.name.toLowerCase() === stored.toLowerCase()
    );
    if (found) return found;
  } catch {
    // ignore parse errors
  }
  return DEFAULT_LANGUAGE;
}

/** Persists selected language to localStorage and dispatches a window event */
export function setSelectedLanguage(lang: LanguageVoiceConfig | string): void {
  if (typeof window === 'undefined') return;
  const targetName = typeof lang === 'string' ? lang : lang.name;
  const found = COASTAL_LANGUAGES.find(
    l => l.name.toLowerCase() === targetName.toLowerCase() || l.code === targetName.toLowerCase()
  );
  const target = found || DEFAULT_LANGUAGE;
  localStorage.setItem(STORAGE_KEY, target.name);
  window.dispatchEvent(new CustomEvent('orca-language-changed', { detail: target }));
}
