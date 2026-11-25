import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { use, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { StartupError } from '@/screens/startup-error';
import { Swipe } from '@/screens/swipe';
import { DeckRefreshContext } from '@/state/deck-refresh';
import { getUsername } from '@/storage/prefs';
import { getSettings, type Settings } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';
import {
  dealNextBatch,
  EMPTY_ROUND,
  nextRound,
  type OpenBatch,
  openBatch,
} from '@/vocabulary/batch';
import { levelLine } from '@/vocabulary/levels';
import { isMatch } from '@/vocabulary/queue';

// `version` is the refresh version this batch was opened for; the screen is keyed by it.
type Loaded = { settings: Settings; username: string | null; version: number } & OpenBatch;

export default function SwipeRoute() {
  const db = useSQLiteContext();
  const t = useT();
  // Bumped by Settings when the level, batch options, or progress change: open the batch for them.
  const { version } = use(DeckRefreshContext);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  // Syncs with progress.db and AsyncStorage: the saved settings, the username (read here, not from
  // the launch context, which predates onboarding), and the batch for those settings —
  // again whenever Settings reports a change.
  useEffect(() => {
    let active = true;
    (async () => {
      const [settings, username] = await Promise.all([getSettings(db), getUsername()]);
      const batch = await openBatch(db, settings);
      if (active) setLoaded({ settings, username, version, ...batch });
    })().catch(() => {
      // Bad data gets the full-screen error (roadmap), never a blank tab.
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [db, version]);

  if (failed) return <StartupError />;
  if (!loaded) return <SafeAreaView edges={['top']} style={styles.screen} />;

  const { settings, username, round, dealtAt, version: loadedVersion } = loaded;

  // Opens another round or batch; the screen takes the round it resolves to.
  const open = async (load: typeof openBatch) => {
    try {
      const batch = await load(db, settings);
      // Not if a settings change has loaded another batch meanwhile.
      setLoaded((now) => (now?.version === loadedVersion ? { ...now, ...batch } : now));
      return batch.round;
    } catch {
      setFailed(true);
      return EMPTY_ROUND;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {/* Keyed by the loaded version: the screen starts over with the new batch once it is here
          (keying by the live version would restart it with the old one). */}
      <Swipe
        key={loaded.version}
        levelLine={levelLine(settings, t)}
        username={username}
        initialRound={round}
        // A match: a word missed before this batch is now known (see isMatch).
        onAnswer={async (word, knowIt) => {
          const previous = await logSwipe(db, word.key, knowIt);
          return isMatch(knowIt, previous, dealtAt);
        }}
        onNextRound={() => open(nextRound)}
        onNextBatch={() => open(dealNextBatch)}
        onOpenSettings={() => router.navigate('/settings')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
