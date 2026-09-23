import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import stats from '../../../assets/vocabulary/vocabulary-stats.json';

import { dayNumber, streakLength, utcOffsetMs, weekMarks } from '@/progress/stats';
import { Progress } from '@/screens/progress';
import { StartupError } from '@/screens/startup-error';
import { getProgressStats, type ProgressStats } from '@/storage/progress-stats';
import { CEFR_LEVELS } from '@/vocabulary/levels';

type Loaded = { stats: ProgressStats; today: number };

export default function ProgressRoute() {
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  // Bumped each time the tab is shown, so today's swipes are counted.
  const [shown, setShown] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setShown((count) => count + 1);
    }, []),
  );

  // Syncs with progress.db: the statistics for today, in the phone's time zone.
  useEffect(() => {
    let active = true;
    const now = Date.now();
    const offset = utcOffsetMs(now);
    const today = dayNumber(now, offset);
    getProgressStats(db, { today, utcOffsetMs: offset })
      .then((result) => {
        if (active) setLoaded({ stats: result, today });
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [db, shown]);

  if (failed) return <StartupError />;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {loaded && (
        <Progress
          streak={streakLength(loaded.stats.days, loaded.today)}
          week={weekMarks(loaded.stats.days, loaded.today)}
          doneToday={loaded.stats.days.has(loaded.today)}
          swipesToday={loaded.stats.swipesToday}
          wordsKnown={loaded.stats.wordsKnown}
          byLevel={CEFR_LEVELS.map((level) => ({
            level,
            known: loaded.stats.knownByLevel[level],
            total: stats.byLevel[level],
          }))}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
