// A test stand-in for expo-sqlite's SQLiteDatabase, backed by Node's built-in SQLite, so the app's
// real SQL runs under Jest (expo-sqlite's native module doesn't exist there). It covers only the
// methods the app uses; add more as the app needs them.
const { DatabaseSync } = require('node:sqlite');

function openTestDb() {
  const db = new DatabaseSync(':memory:');

  return {
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

module.exports = { openTestDb };
