import { bg } from '@/i18n/bg';
import { en } from '@/i18n/en';

type Node = string | ((...args: never[]) => string) | Node[] | { [key: string]: Node };

// Every leaf of a table with its path, e.g. ["settings.title", "Settings"].
function leaves(node: Node, path = ''): [string, Node][] {
  if (typeof node === 'string' || typeof node === 'function') return [[path, node]];
  return Object.entries(node).flatMap(([key, child]) =>
    leaves(child as Node, path ? `${path}.${key}` : key),
  );
}

describe.each([
  ['English', en],
  ['Bulgarian', bg],
])('%s texts', (_name, table) => {
  const entries = leaves(table as unknown as Node);

  test('have the same keys as the English table', () => {
    expect(entries.map(([path]) => path)).toEqual(leaves(en as unknown as Node).map(([p]) => p));
  });

  test('are never empty', () => {
    for (const [path, value] of entries) {
      if (typeof value === 'string') expect([path, value.trim()]).not.toEqual([path, '']);
    }
  });

  test('build text for 0, 1, and 5', () => {
    for (const [path, value] of entries) {
      if (typeof value !== 'function') continue;
      for (const n of [0, 1, 5]) {
        const text = (value as (...args: unknown[]) => string)(n, n, n);
        expect([path, typeof text, text.length > 0]).toEqual([path, 'string', true]);
      }
    }
  });
});

describe('Bulgarian counts', () => {
  test('use the singular for 1 and the plural otherwise', () => {
    expect(bg.common.words(1)).toBe('1 дума');
    expect(bg.common.words(19171)).toMatch(/^19\s171 думи$/);
    expect(bg.progress.wordsKnown(1)).toBe('позната дума');
    expect(bg.progress.wordsKnown(5)).toBe('познати думи');
    expect(bg.summary.known(1, 1)).toBe('Знаеш 1 от 1 дума в тази серия.');
  });
});
