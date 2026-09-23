/** @jest-environment node */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { ENTRIES } from '../fixtures.ts';
import { datasetVersion, writeDatabase } from './sqlite.ts';

describe('writeDatabase', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vocab-sqlite-'));
  const path = join(dir, 'vocabulary.db');
  writeDatabase(path, ENTRIES, { doozan_commit: 'abc', cefr_commit: 'off' });
  const db = new DatabaseSync(path, { readOnly: true });
  afterAll(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  test('creates the five tables', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => row.name);
    expect(tables).toEqual(['examples', 'metadata', 'translations', 'vocabulary', 'word_forms']);
  });

  test('writes vocabulary rows', () => {
    expect(db.prepare('SELECT * FROM vocabulary ORDER BY frequency_rank').all()).toEqual([
      {
        key: 'comer|verb',
        spanish: 'comer',
        part_of_speech: 'verb',
        gender: null,
        frequency: 0.002,
        frequency_rank: 184,
        cefr: 'A1',
      },
      {
        key: 'casa|noun',
        spanish: 'casa',
        part_of_speech: 'noun',
        gender: 'f',
        frequency: 0.001,
        frequency_rank: 210,
        cefr: null,
      },
    ]);
  });

  test('writes meanings with qualifier and priority, forms, and examples', () => {
    expect(
      db
        .prepare(
          "SELECT english, qualifier, priority FROM translations WHERE key = 'comer|verb' ORDER BY priority",
        )
        .all(),
    ).toEqual([
      { english: 'to eat', qualifier: null, priority: 1 },
      { english: 'to have lunch', qualifier: 'Spain', priority: 2 },
    ]);
    expect(
      db.prepare("SELECT form FROM word_forms WHERE key = 'comer|verb' ORDER BY form").all(),
    ).toEqual([{ form: 'come' }, { form: 'como' }]);
    expect(
      db.prepare('SELECT key, spanish, english, attribution, priority FROM examples').all(),
    ).toEqual([
      {
        key: 'comer|verb',
        spanish: 'Vamos a comer.',
        english: "Let's eat.",
        attribution: 'CC-BY 2.0 (France) #1',
        priority: 1,
      },
    ]);
  });

  test('stores metadata including the dataset version', () => {
    const metadata = Object.fromEntries(
      db
        .prepare('SELECT key, value FROM metadata')
        .all()
        .map((row) => [row.key, row.value]),
    );
    expect(metadata).toEqual(
      expect.objectContaining({
        dataset_version: datasetVersion(ENTRIES),
        doozan_commit: 'abc',
        cefr_commit: 'off',
        entries: '2',
      }),
    );
  });
});

describe('datasetVersion', () => {
  test('is stable for identical entries', () => {
    expect(datasetVersion(structuredClone(ENTRIES))).toBe(datasetVersion(ENTRIES));
  });

  test('changes when an entry changes', () => {
    const changed = structuredClone(ENTRIES);
    changed[1].meanings.push({ english: 'home', qualifier: null });
    expect(datasetVersion(changed)).not.toBe(datasetVersion(ENTRIES));
  });
});

describe('table layout', () => {
  test('keyed tables are WITHOUT ROWID, so no duplicate primary-key index is stored', () => {
    const dir = mkdtempSync(join(tmpdir(), 'vocab-layout-'));
    const path = join(dir, 'vocabulary.db');
    writeDatabase(path, ENTRIES, {});
    const db = new DatabaseSync(path, { readOnly: true });
    const autoIndexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'sqlite_autoindex%'",
      )
      .all();
    db.close();
    rmSync(dir, { recursive: true, force: true });
    expect(autoIndexes).toEqual([]);
  });
});
