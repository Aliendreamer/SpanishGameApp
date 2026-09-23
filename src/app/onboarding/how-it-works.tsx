import { router } from 'expo-router';
import { use } from 'react';

import { LaunchContext } from '@/launch';
import { HowItWorks } from '@/screens/how-it-works';
import { saveShowTutorial, setOnboardingDone } from '@/storage/prefs';

export default function HowItWorksRoute() {
  return (
    <HowItWorks
      initialShowTutorial={use(LaunchContext).showTutorial}
      onStart={async (showTutorial) => {
        // A failed save must not trap the user in onboarding; worst case it runs again next launch.
        await Promise.all([saveShowTutorial(showTutorial), setOnboardingDone()]).catch(() => {});
        // Replace the whole onboarding group: Back never returns into onboarding.
        router.replace('/swipe');
      }}
    />
  );
}
