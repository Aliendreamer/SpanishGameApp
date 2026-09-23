import stats from '../../assets/vocabulary/vocabulary-stats.json';
import {
  copyBundledVocabulary,
  makeTempDir,
  openTestDb,
  type TestDb,
  vocabularyVersion,
} from '../../scripts/node-sqlite-db';

import { attachVocabulary } from '@/storage/vocabulary-db';

let db: TestDb;
let file: string;
let importAsset: jest.Mock;

beforeEach(() => {
  db = openTestDb();
  file = `${makeTempDir()}/vocabulary.db`;
  // Stands in for expo-sqlite's importDatabaseFromAssetAsync: copies the bundled dictionary.
  importAsset = jest.fn(async () => copyBundledVocabulary(file));
});
afterEach(() => db.close());

const attach = () =>
  attachVocabulary(db, { file, bundledVersion: stats.datasetVersion, importAsset });

async function wordCount() {
  return (await db.getFirstAsync<{ n: number }>('SELECT count(*) AS n FROM vocab.vocabulary'))?.n;
}

describe('attachVocabulary', () => {
  test('copies the bundled dictionary on first launch and attaches it', async () => {
    await attach();

    expect(importAsset).toHaveBeenCalledTimes(1);
    expect(await wordCount()).toBe(stats.totalWords);
  });

  test('attaches an up-to-date dictionary without copying it', async () => {
    copyBundledVocabulary(file);

    await attach();

    expect(importAsset).not.toHaveBeenCalled();
    expect(await wordCount()).toBe(stats.totalWords);
  });

  test('replaces a dictionary from another dataset version', async () => {
    copyBundledVocabulary(file, 'older-version');

    await attach();

    expect(importAsset).toHaveBeenCalledTimes(1);
    expect(vocabularyVersion(file)).toBe(stats.datasetVersion);
    expect(await wordCount()).toBe(stats.totalWords);
  });
});
