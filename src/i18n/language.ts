// The interface languages. English is the default and the source of every text.
export const LANGUAGES = ['en', 'bg'] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

// Each language's name in itself, so a user in the wrong one finds the way back.
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', bg: 'Български' };

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}
