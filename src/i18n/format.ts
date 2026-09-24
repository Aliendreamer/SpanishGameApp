import type { Language } from '@/i18n/language';

// One formatter per language, built once: toLocaleString with a locale sets one up per call.
const FORMATTERS: Record<Language, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US'),
  bg: new Intl.NumberFormat('bg-BG'),
};

// English and Bulgarian both use the singular for exactly 1 and the plural for every other
// whole number ("1 дума", "0 думи", "21 думи").
export function plural(count: number, one: string, other: string): string {
  return count === 1 ? one : other;
}

// "1,142" in English, "1 142" in Bulgarian.
export function formatNumber(count: number, language: Language): string {
  return FORMATTERS[language].format(count);
}
