import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { type LevelChoice, LevelPicker } from '@/screens/level';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '@/storage/progress-db';

export default function LevelRoute() {
  const db = useSQLiteContext();
  const [initial, setInitial] = useState<LevelChoice | null>(null);

  // Syncs with progress.db: open on the saved choice (defaults on a fresh install).
  useEffect(() => {
    let active = true;
    getSettings(db)
      .then(({ level, includeLower }) => {
        if (active) setInitial({ level, includeLower });
      })
      .catch(() => {
        if (active) setInitial(DEFAULT_SETTINGS);
      });
    return () => {
      active = false;
    };
  }, [db]);

  if (!initial) return null;

  return (
    <LevelPicker
      initial={initial}
      onContinue={async (choice) => {
        // A failed save must not trap the user in onboarding; Settings can change it later.
        await saveSettings(db, choice).catch(() => {});
        // Push, not replace: How it works has Back to Level.
        router.push('/onboarding/how-it-works');
      }}
    />
  );
}
