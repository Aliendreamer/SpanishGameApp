export type KeyDiff = { hadPrevious: boolean; added: number; removed: string[] };

/**
 * Compares the new dataset's keys with the previous one. Removed keys are the words whose user
 * progress an update would orphan, so they are listed in full.
 */
export function diffKeys(previous: string[] | null, next: string[]): KeyDiff {
  const before = new Set(previous ?? []);
  const after = new Set(next);
  return {
    hadPrevious: previous !== null,
    added: [...after].filter((key) => !before.has(key)).length,
    removed: [...before].filter((key) => !after.has(key)).sort(),
  };
}
