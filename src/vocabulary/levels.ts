import stats from '../../assets/vocabulary/vocabulary-stats.json';
import type { Level } from '@/storage/progress-db';

type CefrLevel = keyof typeof stats.byLevel;

const formatCount = (count: number) => `${count.toLocaleString('en-US')} words`;
const countOf = (levels: CefrLevel[]) =>
  levels.reduce((sum, level) => sum + stats.byLevel[level], 0);

// The level choices, with word counts from the generated vocabulary stats (never hardcoded, so a
// dictionary rebuild updates them).
export const LEVELS: { id: Level; label: string; detail: string }[] = [
  { id: 'beginner', label: 'Beginner', detail: `A1 + A2 · ${formatCount(countOf(['A1', 'A2']))}` },
  { id: 'intermediate', label: 'Intermediate', detail: `B1 · ${formatCount(countOf(['B1']))}` },
  { id: 'advanced', label: 'Advanced', detail: `B2 · ${formatCount(countOf(['B2']))}` },
  { id: 'full', label: 'Full', detail: `Everything · ${formatCount(stats.totalWords)}` },
];
