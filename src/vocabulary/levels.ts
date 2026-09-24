import stats from '../../assets/vocabulary/vocabulary-stats.json';
import type { Strings } from '@/i18n';
import type { Level, Settings, WordType } from '@/storage/progress-db';

// The CEFR bands with words in the dictionary, easiest first.
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

type LevelDefinition = {
  id: Level;
  // The CEFR bands this level deals; null means every word, with or without a band.
  cefr: CefrLevel[] | null;
  // The easier bands "Include lower levels" adds.
  below: CefrLevel[];
  // Words in the level, from the generated vocabulary stats (never hardcoded, so a dictionary
  // rebuild updates them).
  count: number;
};

// A level or word type as the pickers show it, in the interface language.
type Option<Id> = { id: Id; label: string; detail: string };

const countOf = (levels: CefrLevel[]) =>
  levels.reduce((sum, level) => sum + stats.byLevel[level], 0);

// The level choices, easiest first. Their names live in the string tables.
const LEVELS: LevelDefinition[] = [
  { id: 'beginner', cefr: ['A1', 'A2'], below: [], count: countOf(['A1', 'A2']) },
  { id: 'intermediate', cefr: ['B1'], below: ['A1', 'A2'], count: countOf(['B1']) },
  { id: 'advanced', cefr: ['B2'], below: ['A1', 'A2', 'B1'], count: countOf(['B2']) },
  { id: 'full', cefr: null, below: [], count: stats.totalWords },
];

// The word types the deck can be limited to: all words, or one of the three big parts of speech
// (the small ones are only in All words), with their word counts.
const WORD_TYPES: { id: WordType; count: number }[] = [
  { id: 'all', count: stats.totalWords },
  { id: 'noun', count: stats.byPartOfSpeech.noun },
  { id: 'verb', count: stats.byPartOfSpeech.verb },
  { id: 'adjective', count: stats.byPartOfSpeech.adjective },
];

// "Beginner" / "A1 + A2 · 1,142 words", and so on.
export function levelOptions(t: Strings): Option<Level>[] {
  return LEVELS.map(({ id, cefr, count }) => ({
    id,
    label: t.levels[id],
    detail: `${cefr ? cefr.join(' + ') : t.common.everything} · ${t.common.words(count)}`,
  }));
}

// "Verbs" / "2,940 words", and so on.
export function wordTypeOptions(t: Strings): Option<WordType>[] {
  return WORD_TYPES.map(({ id, count }) => ({
    id,
    label: t.wordTypes[id],
    detail: t.common.words(count),
  }));
}

const definition = (level: Level) => LEVELS.find(({ id }) => id === level) ?? LEVELS[0];

// The CEFR bands a deck draws from, easiest first; null means every word.
export function deckBands({
  level,
  includeLower,
}: Pick<Settings, 'level' | 'includeLower'>): CefrLevel[] | null {
  const { cefr, below } = definition(level);
  if (!cefr) return null;
  return includeLower ? [...below, ...cefr] : cefr;
}

// The Swipe header's level line, e.g. "Beginner · A1, A2", "Full", or "Beginner · A1, A2 · Verbs".
export function levelLine(
  settings: Pick<Settings, 'level' | 'includeLower'> & Partial<Pick<Settings, 'wordType'>>,
  t: Strings,
): string {
  const bands = deckBands(settings);
  const { wordType } = settings;
  return [
    t.levels[settings.level],
    ...(bands ? [bands.join(', ')] : []),
    ...(wordType && wordType !== 'all' ? [t.wordTypes[wordType]] : []),
  ].join(' · ');
}
