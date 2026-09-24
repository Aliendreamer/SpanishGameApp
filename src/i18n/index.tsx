import { createContext, type ReactNode, use, useMemo, useState } from 'react';

import { bg } from '@/i18n/bg';
import { en, type Strings } from '@/i18n/en';
import { DEFAULT_LANGUAGE, type Language } from '@/i18n/language';
import { saveLanguage } from '@/storage/prefs';

export type { Strings } from '@/i18n/en';
export { LANGUAGE_NAMES, LANGUAGES, type Language } from '@/i18n/language';

const TABLES: Record<Language, Strings> = { en, bg };

type LanguageState = { language: Language; setLanguage: (language: Language) => void };

// English with nothing to change it: what a screen rendered on its own (tests) sees.
const LanguageContext = createContext<LanguageState>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

// Holds the interface language for the whole app. A change shows at once; saving it is best
// effort, so a storage failure only means the next launch opens in the old language.
export function LanguageProvider({
  initial,
  children,
}: {
  initial: Language;
  children: ReactNode;
}) {
  const [language, setState] = useState(initial);
  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => {
        setState(next);
        saveLanguage(next).catch(() => {});
      },
    }),
    [language],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage(): LanguageState {
  return use(LanguageContext);
}

// A part of speech as the tables name it; one they don't know shows as the data has it.
export function partOfSpeechName(t: Strings, partOfSpeech: string): string {
  return Object.hasOwn(t.partOfSpeech, partOfSpeech)
    ? t.partOfSpeech[partOfSpeech as keyof Strings['partOfSpeech']]
    : partOfSpeech;
}

// The texts in the current interface language.
export function useT(): Strings {
  return TABLES[useLanguage().language];
}
