import { router } from 'expo-router';
import { use } from 'react';

import { ScreenFrame } from '@/components/screen-frame';
import { LaunchContext } from '@/launch';
import { HowItWorks } from '@/screens/how-it-works';
import { saveShowTutorial } from '@/storage/prefs';

// How it works on later launches: no step dots, no Back, a greeting.
export default function TutorialRoute() {
  const { username, showTutorial } = use(LaunchContext);

  return (
    <ScreenFrame>
      <HowItWorks
        greeting={username ? `Hola, ${username}` : undefined}
        initialShowTutorial={showTutorial}
        onStart={async (show) => {
          await saveShowTutorial(show).catch(() => {});
          router.replace('/swipe');
        }}
      />
    </ScreenFrame>
  );
}
