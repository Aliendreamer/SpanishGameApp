import type { SQLiteDatabase } from 'expo-sqlite';

// The subset of SQLiteDatabase that openTestDb implements, plus close().
export type TestDb = Pick<
  SQLiteDatabase,
  | 'databasePath'
  | 'execAsync'
  | 'runAsync'
  | 'getFirstAsync'
  | 'getAllAsync'
  | 'withTransactionAsync'
> & { close(): void };

export const BUNDLED_VOCABULARY: string;
export function openTestDb(filename?: string): TestDb;
export function makeTempDir(): string;
export function copyBundledVocabulary(target: string, version?: string): void;
export function vocabularyVersion(file: string): string;
