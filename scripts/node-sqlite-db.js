// Test helpers for code that uses expo-sqlite. openTestDb is a stand-in for expo-sqlite's
// SQLiteDatabase backed by Node's built-in SQLite, so the app's real SQL runs under Jest
// (expo-sqlite's native module doesn't exist there). It covers only the methods the app uses.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const BUNDLED_VOCABULARY = path.join(__dirname, '..', 'assets', 'vocabulary', 'vocabulary.db');

function openTestDb(filename = ':memory:') {
  const db = new DatabaseSync(filename);

  return {
    databasePath: filename,
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params = []) {
      const result = db.prepare(source).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async getFirstAsync(source, params = []) {
      return db.prepare(source).get(...params) ?? null;
    },
    async getAllAsync(source, params = []) {
      return db.prepare(source).all(...params);
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close() {
      db.close();
    },
  };
}

// A fresh empty directory for database files.
function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'spanish-game-test-'));
}

// Copies the real bundled dictionary to `target`, optionally stamping another dataset version.
function copyBundledVocabulary(target, version) {
  fs.copyFileSync(BUNDLED_VOCABULARY, target);
  if (version !== undefined) {
    const db = new DatabaseSync(target);
    db.prepare("UPDATE metadata SET value = ? WHERE key = 'dataset_version'").run(version);
    db.close();
  }
}

// The dataset version of the dictionary file at `file`.
function vocabularyVersion(file) {
  const db = new DatabaseSync(file, { readOnly: true });
  const row = db.prepare("SELECT value FROM metadata WHERE key = 'dataset_version'").get();
  db.close();
  return row.value;
}

module.exports = {
  BUNDLED_VOCABULARY,
  openTestDb,
  makeTempDir,
  copyBundledVocabulary,
  vocabularyVersion,
};
