import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StartupError } from '@/screens/startup-error';
import { Swipe } from '@/screens/swipe';
import { getUsername } from '@/storage/prefs';
import { getSettings, type Settings } from '@/storage/progress-db';
import { logSwipe } from '@/storage/swipes';
import { dealBatch, type DeckWord, getDeck } from '@/vocabulary/deck';
import { levelLine } from '@/vocabulary/levels';

type Loaded = { settings: Settings; username: string | null; words: DeckWord[] };

export default function SwipeRoute() {
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  // The session's current batch number (see dealBatch).
  const [batch, setBatch] = useState(0);

  // Syncs with progress.db and AsyncStorage: the saved settings, the username (read here, not from
  // the launch context, which predates onboarding), and the first batch for those settings.
  useEffect(() => {
    let active = true;
    (async () => {
      const [settings, username] = await Promise.all([getSettings(db), getUsername()]);
      const words = await getDeck(db, settings);
      if (active) setLoaded({ settings, username, words });
    })().catch(() => {
      // Bad data gets the full-screen error (roadmap), never a blank tab.
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [db]);

  if (failed) return <StartupError />;
  if (!loaded) return <SafeAreaView edges={['top']} style={styles.screen} />;

  const { settings, username, words } = loaded;

  const nextBatch = async () => {
    try {
      const deal = await dealBatch(db, settings, batch + 1);
      setBatch(deal.batch);
      return deal.words;
    } catch {
      setFailed(true);
      return [];
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Swipe
        levelLine={levelLine(settings)}
        username={username}
        initialWords={words}
        onAnswer={(word, knowIt) => logSwipe(db, word.key, knowIt)}
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
