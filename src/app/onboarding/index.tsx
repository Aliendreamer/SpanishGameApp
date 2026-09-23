import { router } from 'expo-router';

import { Welcome } from '@/screens/welcome';
import { getUsername } from '@/storage/prefs';

export default function WelcomeRoute() {
  // Replace, not push: onboarding never returns to Welcome, and a double tap can't stack a step.
  // Someone who already picked a username skips that step.
  return (
    <Welcome
      onGetStarted={async () => {
        const username = await getUsername().catch(() => null);
        router.replace(username ? '/onboarding/level' : '/onboarding/username');
      }}
    />
  );
}
