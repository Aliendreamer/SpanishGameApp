// Gender → article; also the source for the SQL version of this rule (word-lists.ts).
export const ARTICLES: Record<string, string> = { m: 'el', f: 'la', 'm/f': 'el/la' };

// The article shown before a noun, from its gender. Known gap: feminine nouns with a stressed
// initial "a" take "el" ("el agua"); the data doesn't mark stress, so they show "la".
export function articleFor(partOfSpeech: string, gender: string | null): string | null {
  if (partOfSpeech !== 'noun' || !gender) return null;
  return ARTICLES[gender] ?? null;
}
