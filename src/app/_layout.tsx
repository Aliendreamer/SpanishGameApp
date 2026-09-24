import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { type ReactNode, useEffect, useState } from 'react';

import { LanguageProvider } from '@/i18n';
import { LaunchContext } from '@/launch';
import { StartupError } from '@/screens/startup-error';
import { FIRST_LAUNCH, getLaunchPrefs, type LaunchPrefs } from '@/storage/prefs';
import { initDatabase } from '@/storage/database';
import { colors } from '@/theme';

// Keep the native splash up until the fonts, the launch prefs, and progress.db are ready, so no
// screen flashes in the system font, opens the wrong first screen, or renders before its data.
// Rejects if the splash is already gone (e.g. after a fast refresh); nothing to do then.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });
  const [dbError, setDbError] = useState<Error | null>(null);
  const [launch, setLaunch] = useState<LaunchPrefs | null>(null);

  // Syncs with AsyncStorage once: which screen to open. A read failure means a first launch
  // (Welcome) rather than a splash that never goes away.
  useEffect(() => {
    getLaunchPrefs()
      .catch(() => FIRST_LAUNCH)
      .then(setLaunch);
  }, []);

  // A font that fails to load falls back to the system font rather than blocking the app.
  if ((!loaded && error === null) || !launch) return null;

  return (
    <LanguageProvider initial={launch.language}>
      {dbError ? (
        // Without its data the app can't work, but it must not crash on every launch either.
        <HideSplash>
          <StartupError />
        </HideSplash>
      ) : (
        // Gestures (the swipe card) need their root view around the whole app. The SQLite provider
        // renders its children only after migrate() has finished.
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SQLiteProvider databaseName="progress.db" onInit={initDatabase} onError={setDbError}>
            <LaunchContext value={launch}>
              <HideSplash>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                  }}
                />
              </HideSplash>
            </LaunchContext>
          </SQLiteProvider>
        </GestureHandlerRootView>
      )}
    </LanguageProvider>
  );
}

// Hides the native splash once whatever it wraps is on screen.
function HideSplash({ children }: { children: ReactNode }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return children;
}
