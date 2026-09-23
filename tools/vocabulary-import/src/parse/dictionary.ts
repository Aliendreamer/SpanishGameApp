import { count } from '../format.ts';
import type { Dictionary, DictionaryBlock, Progress } from '../types.ts';

const SEPARATOR = '_____';
// Wiktionary marks inflection and misspelling entries with `{{head|es|noun form}}` etc.
const FORM_ENTRY = /\{\{head\|es\|[^|}]*(form|misspelling)\b/;
const PROGRESS_EVERY = 20_000;

/**
 * Parses Doozan's es-en.data (Wiktionary). Each entry is a `_____` line, the word, then
 * `pos:` blocks whose two-space-indented fields hold `g:` gender and `gloss:` lines; a gloss's
 * four-space-indented `q:` is its qualifier; `meta:` tells lemma entries from form entries.
 * Sub-glosses (`_gloss:`) and other fields are ignored.
 */
export function parseDictionary(data: string, progress: Progress = () => {}): Dictionary {
  const dictionary: Dictionary = new Map();
  const lines = data.split('\n');
  let word: string | null = null;
  let block: DictionaryBlock | null = null;
  let lastLine = '';
  let words = 0;

  for (const line of lines) {
    if (line === SEPARATOR) {
      word = null;
      block = null;
    } else if (word === null) {
      word = line;
      words += 1;
      if (words % PROGRESS_EVERY === 0) progress(`${count(words)} words`);
    } else if (line.startsWith('pos: ')) {
      block = { pos: line.slice(5).trim(), isForm: false, gender: null, glosses: [] };
      const blocks = dictionary.get(word);
      if (blocks) blocks.push(block);
      else dictionary.set(word, [block]);
    } else if (block && line.startsWith('  meta: ')) {
      block.isForm = FORM_ENTRY.test(line);
    } else if (block && line.startsWith('  g: ')) {
      block.gender = line.slice(5).trim();
    } else if (block && line.startsWith('  gloss: ')) {
      block.glosses.push({ text: line.slice(9).trim(), qualifier: null });
    } else if (block && line.startsWith('    q: ') && lastLine.startsWith('  gloss: ')) {
      block.glosses[block.glosses.length - 1].qualifier = line.slice(7).trim();
    }
    if (!line.startsWith('    q: ')) lastLine = line;
  }

  progress(`${count(words)} words`);
  return dictionary;
}
