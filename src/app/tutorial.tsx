import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { ScreenFrame } from '@/components/screen-frame';
import { HowItWorks } from '@/screens/how-it-works';
import { FIRST_LAUNCH, getLaunchPrefs, type LaunchPrefs, saveShowTutorial } from '@/storage/prefs';

// How it works on later launches and from Settings: no step dots, no Back, a greeting.
export default function TutorialRoute() {
  const [prefs, setPrefs] = useState<LaunchPrefs | null>(null);

  // Syncs with AsyncStorage: read fresh (not the launch-time context), so a name or tutorial
  // choice changed in Settings shows here.
  useEffect(() => {
    let active = true;
    getLaunchPrefs()
      .catch(() => FIRST_LAUNCH)
      .then((loaded) => {
        if (active) setPrefs(loaded);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ScreenFrame>
      {prefs && (
        <HowItWorks
          greeting={prefs.username ? `Hola, ${prefs.username}` : undefined}
          initialShowTutorial={prefs.showTutorial}
          onStart={async (show) => {
            await saveShowTutorial(show).catch(() => {});
            router.replace('/swipe');
          }}
        />
      )}
    </ScreenFrame>
  );
}
