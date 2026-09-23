import { importDatabaseFromAssetAsync, type SQLiteDatabase } from 'expo-sqlite';

import stats from '../../assets/vocabulary/vocabulary-stats.json';
import vocabularyAsset from '../../assets/vocabulary/vocabulary.db';

import { migrate } from '@/storage/progress-db';
import { attachVocabulary } from '@/storage/vocabulary-db';

const VOCABULARY = 'vocabulary.db';

// Runs once at startup, before any screen renders (SQLiteProvider's onInit): bring progress.db up
// to date, then attach the bundled dictionary to the same connection as `vocab`.
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await migrate(db);

  // importDatabaseFromAssetAsync writes to the default database directory, next to progress.db.
  const directory = db.databasePath.slice(0, db.databasePath.lastIndexOf('/'));
  await attachVocabulary(db, {
    file: `${directory}/${VOCABULARY}`,
    // Generated together with vocabulary.db, so it names the bundled dataset.
    bundledVersion: stats.datasetVersion,
    importAsset: () =>
      importDatabaseFromAssetAsync(VOCABULARY, { assetId: vocabularyAsset, forceOverwrite: true }),
  });
}
