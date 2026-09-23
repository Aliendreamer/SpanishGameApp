import type { ProgressDb } from '@/storage/progress-db';

type Options = {
  // Where the installed dictionary lives (next to progress.db).
  file: string;
  // The dataset version of the dictionary bundled with this app build.
  bundledVersion: string;
  // Copies the bundled dictionary to `file`, replacing whatever is there.
  importAsset: () => Promise<void>;
};

// Attaches the read-only dictionary to the progress.db connection as `vocab`, first installing the
// bundled copy when none is installed, it can't be read, or it is from another dataset version.
// Progress lives in progress.db, so replacing the dictionary never touches it (roadmap).
export async function attachVocabulary(db: ProgressDb, options: Options): Promise<void> {
  await db.runAsync('ATTACH DATABASE ? AS vocab', [options.file]);
  if ((await installedVersion(db)) === options.bundledVersion) return;

  await db.execAsync('DETACH DATABASE vocab');
  await options.importAsset();
  await db.runAsync('ATTACH DATABASE ? AS vocab', [options.file]);
}

async function installedVersion(db: ProgressDb): Promise<string | null> {
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM vocab.metadata WHERE key = 'dataset_version'",
    );
    return row?.value ?? null;
  } catch {
    // Missing (ATTACH created an empty file) or unreadable: install it again.
    return null;
  }
}
