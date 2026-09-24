import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { use, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '@/i18n';
import { Settings } from '@/screens/settings';
import { StartupError } from '@/screens/startup-error';
import { DeckRefreshContext } from '@/state/deck-refresh';
import { getLaunchPrefs, saveShowTutorial, saveUsername } from '@/storage/prefs';
import { getSettings, saveSettings, type Settings as GameSettings } from '@/storage/progress-db';
import { clearSwipes } from '@/storage/swipes';

type Loaded = { username: string; showTutorial: boolean; settings: GameSettings };

export default function SettingsRoute() {
  const db = useSQLiteContext();
  const { invalidate } = use(DeckRefreshContext);
  // The language lives above the tabs; changing it re-renders every screen but deals nothing.
  const { language, setLanguage } = useLanguage();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  // Syncs with AsyncStorage and progress.db: the values the screen starts from.
  useEffect(() => {
    let active = true;
    Promise.all([getLaunchPrefs(), getSettings(db)])
      .then(([prefs, settings]) => {
        if (active) {
          setLoaded({ username: prefs.username ?? '', showTutorial: prefs.showTutorial, settings });
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [db]);

  if (failed) return <StartupError />;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {loaded && (
        <Settings
          {...loaded}
          language={language}
          onLanguageChange={setLanguage}
          onSaveUsername={(name) => saveUsername(name).catch(() => {})}
          onShowTutorialChange={(show) => saveShowTutorial(show).catch(() => {})}
          onViewTutorial={() => router.push('/tutorial')}
          onSettingsChange={(changes) => saveSettings(db, changes).then(invalidate, () => {})}
          onResetProgress={async () => {
            await clearSwipes(db);
            invalidate();
          }}
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
