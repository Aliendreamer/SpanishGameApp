import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import type { Entry } from '../types.ts';

// Tables are keyed by `key` and WITHOUT ROWID: a rowid table would store every primary key twice
// (table + automatic index), which roughly doubled the file for word_forms.
const SCHEMA = `
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL) WITHOUT ROWID;
CREATE TABLE vocabulary (
  key TEXT PRIMARY KEY,
  spanish TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  gender TEXT,
  frequency REAL NOT NULL,
  frequency_rank INTEGER NOT NULL,
  cefr TEXT
) WITHOUT ROWID;
CREATE TABLE translations (
  key TEXT NOT NULL REFERENCES vocabulary(key),
  english TEXT NOT NULL,
  qualifier TEXT,
  priority INTEGER NOT NULL,
  PRIMARY KEY (key, priority)
) WITHOUT ROWID;
CREATE TABLE word_forms (
  key TEXT NOT NULL REFERENCES vocabulary(key),
  form TEXT NOT NULL,
  PRIMARY KEY (key, form)
) WITHOUT ROWID;
CREATE TABLE examples (
  key TEXT NOT NULL REFERENCES vocabulary(key),
  spanish TEXT NOT NULL,
  english TEXT NOT NULL,
  attribution TEXT NOT NULL,
  priority INTEGER NOT NULL,
  PRIMARY KEY (key, priority)
) WITHOUT ROWID;
CREATE INDEX vocabulary_level_rank ON vocabulary (cefr, frequency_rank);
`;

/**
 * Content hash of the entries. It changes only when the data changes, so the app replaces its
 * installed copy only when there is something new.
 */
export const datasetVersion = (entries: Entry[]): string =>
  createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 16);

/** Writes the app's vocabulary database in one transaction. `path` must not exist yet. */
export function writeDatabase(path: string, entries: Entry[], metadata: Record<string, string>) {
  const db = new DatabaseSync(path);
  try {
    db.exec(SCHEMA);
    db.exec('BEGIN');
    const insertWord = db.prepare('INSERT INTO vocabulary VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertMeaning = db.prepare('INSERT INTO translations VALUES (?, ?, ?, ?)');
    const insertForm = db.prepare('INSERT INTO word_forms VALUES (?, ?)');
    const insertExample = db.prepare('INSERT INTO examples VALUES (?, ?, ?, ?, ?)');
    const insertMetadata = db.prepare('INSERT INTO metadata VALUES (?, ?)');

    for (const entry of entries) {
      const { key } = entry;
      insertWord.run(
        key,
        entry.spanish,
        entry.partOfSpeech,
        entry.gender,
        entry.frequency,
        entry.frequencyRank,
        entry.cefr,
      );
      entry.meanings.forEach((meaning, index) =>
        insertMeaning.run(key, meaning.english, meaning.qualifier, index + 1),
      );
      for (const form of entry.forms) insertForm.run(key, form);
      entry.examples.forEach((example, index) =>
        insertExample.run(key, example.spanish, example.english, example.attribution, index + 1),
      );
    }
    const allMetadata = {
      ...metadata,
      dataset_version: metadata.dataset_version ?? datasetVersion(entries),
      entries: String(entries.length),
    };
    for (const [name, value] of Object.entries(allMetadata)) insertMetadata.run(name, value);
    db.exec('COMMIT');
    // Not redundant on a fresh file: inserts into WITHOUT ROWID B-trees leave half-full pages;
    // repacking shrinks the shipped database from 14.5 MB to 12.6 MB.
    db.exec('VACUUM');
  } finally {
    db.close();
  }
}
