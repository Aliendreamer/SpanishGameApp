import stats from '../../assets/vocabulary/vocabulary-stats.json';
import type { Level, Settings, WordType } from '@/storage/progress-db';

// The CEFR bands with words in the dictionary, easiest first.
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

type LevelDefinition = {
  id: Level;
  label: string;
  detail: string;
  // The CEFR bands this level deals; null means every word, with or without a band.
  cefr: CefrLevel[] | null;
  // The easier bands "Include lower levels" adds.
  below: CefrLevel[];
};

const formatCount = (count: number) => `${count.toLocaleString('en-US')} words`;
const countOf = (levels: CefrLevel[]) =>
  levels.reduce((sum, level) => sum + stats.byLevel[level], 0);

// The level choices, with word counts from the generated vocabulary stats (never hardcoded, so a
// dictionary rebuild updates them).
export const LEVELS: LevelDefinition[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    detail: `A1 + A2 · ${formatCount(countOf(['A1', 'A2']))}`,
    cefr: ['A1', 'A2'],
    below: [],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    detail: `B1 · ${formatCount(countOf(['B1']))}`,
    cefr: ['B1'],
    below: ['A1', 'A2'],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    detail: `B2 · ${formatCount(countOf(['B2']))}`,
    cefr: ['B2'],
    below: ['A1', 'A2', 'B1'],
  },
  {
    id: 'full',
    label: 'Full',
    detail: `Everything · ${formatCount(stats.totalWords)}`,
    cefr: null,
    below: [],
  },
];

// The word types the deck can be limited to: all words, or one of the three big parts of speech
// (the small ones are only in All words). Counts from the generated vocabulary stats.
export const WORD_TYPES: { id: WordType; label: string; detail: string }[] = [
  { id: 'all', label: 'All words', detail: formatCount(stats.totalWords) },
  { id: 'noun', label: 'Nouns', detail: formatCount(stats.byPartOfSpeech.noun) },
  { id: 'verb', label: 'Verbs', detail: formatCount(stats.byPartOfSpeech.verb) },
  { id: 'adjective', label: 'Adjectives', detail: formatCount(stats.byPartOfSpeech.adjective) },
];

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
): string {
  const bands = deckBands(settings);
  const { label } = definition(settings.level);
  const type = WORD_TYPES.find(({ id }) => id === settings.wordType && id !== 'all');
  return [label, ...(bands ? [bands.join(', ')] : []), ...(type ? [type.label] : [])].join(' · ');
}
