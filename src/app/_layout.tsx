import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { type ReactNode, useEffect, useState } from 'react';

import { StartupError } from '@/screens/startup-error';
import { migrate } from '@/storage/progress-db';
import { colors } from '@/theme';

// Keep the native splash up until the fonts and progress.db are ready, so no screen flashes in the
// system font or renders before its data. Rejects if the splash is already gone (e.g. after a
// fast refresh); nothing to do then.
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

  // A font that fails to load falls back to the system font rather than blocking the app.
  if (!loaded && error === null) return null;

  // Without its data the app can't work, but it must not crash on every launch either.
  if (dbError) {
    return (
      <HideSplash>
        <StartupError />
      </HideSplash>
    );
  }

  // The provider renders its children only after migrate() has finished.
  return (
    <SQLiteProvider databaseName="progress.db" onInit={migrate} onError={setDbError}>
      <HideSplash>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </HideSplash>
    </SQLiteProvider>
  );
}

// Hides the native splash once whatever it wraps is on screen.
function HideSplash({ children }: { children: ReactNode }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return children;
}
