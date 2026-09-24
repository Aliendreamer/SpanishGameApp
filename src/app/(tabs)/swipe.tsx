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
import { dealBatch, type DeckWord, getDeck } from '@/vocabulary/deck';
import { levelLine } from '@/vocabulary/levels';
import { isMatch } from '@/vocabulary/queue';

// `version` is the refresh version this deck was dealt for; the screen is keyed by it.
type Loaded = { settings: Settings; username: string | null; words: DeckWord[]; version: number };

export default function SwipeRoute() {
  const db = useSQLiteContext();
  const t = useT();
  // Bumped by Settings when the level, batch options, or progress change: deal again.
  const { version } = use(DeckRefreshContext);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  // The session's current batch number (see dealBatch).
  const [batch, setBatch] = useState(0);
  // When the current batch was dealt (practise rounds keep it): misses before it can make a match.
  const [dealtAt, setDealtAt] = useState(0);

  // Syncs with progress.db and AsyncStorage: the saved settings, the username (read here, not from
  // the launch context, which predates onboarding), and the first batch for those settings —
  // again whenever Settings reports a change.
  useEffect(() => {
    let active = true;
    (async () => {
      const [settings, username] = await Promise.all([getSettings(db), getUsername()]);
      const words = await getDeck(db, settings);
      if (active) {
        setLoaded({ settings, username, words, version });
        setBatch(0);
        setDealtAt(Date.now());
      }
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

  const { settings, username, words } = loaded;

  const nextBatch = async () => {
    try {
      const deal = await dealBatch(db, settings, batch + 1);
      setBatch(deal.batch);
      setDealtAt(Date.now());
      return deal.words;
    } catch {
      setFailed(true);
      return [];
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {/* Keyed by the dealt version: a re-deal starts a fresh batch in the screen too, once the new
          words are here (keying by the live version would restart it with the old ones). */}
      <Swipe
        key={loaded.version}
        levelLine={levelLine(settings, t)}
        username={username}
        initialWords={words}
        // A match: a word missed before this batch is now known (see isMatch).
        onAnswer={async (word, knowIt) => {
          const previous = await logSwipe(db, word.key, knowIt);
          return isMatch(knowIt, previous, dealtAt);
        }}
        onNextBatch={nextBatch}
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
