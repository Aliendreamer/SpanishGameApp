import type { SQLiteDatabase } from 'expo-sqlite';

// The subset of SQLiteDatabase that openTestDb implements, plus close().
export type TestDb = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getFirstAsync' | 'withTransactionAsync'
> & { close(): void };

export function openTestDb(): TestDb;
