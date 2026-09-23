import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StartupError } from '@/screens/startup-error';
import { Swipe } from '@/screens/swipe';
import { getUsername } from '@/storage/prefs';
import { getSettings } from '@/storage/progress-db';
import { type DeckWord, getDeck } from '@/vocabulary/deck';
import { levelLine } from '@/vocabulary/levels';

type Loaded = { levelLine: string; username: string | null; words: DeckWord[] };

export default function SwipeRoute() {
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  // Syncs with progress.db and AsyncStorage: the saved level, the username (read here, not from
  // the launch context, which predates onboarding), and a batch of words for that level.
  useEffect(() => {
    let active = true;
    (async () => {
      const [settings, username] = await Promise.all([getSettings(db), getUsername()]);
      const words = await getDeck(db, settings);
      if (active) setLoaded({ levelLine: levelLine(settings), username, words });
    })().catch(() => {
      // Bad data gets the full-screen error (roadmap), never a blank tab.
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [db]);

  if (failed) return <StartupError />;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {loaded && <Swipe {...loaded} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
