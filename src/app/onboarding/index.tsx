import { router } from 'expo-router';

import { Welcome } from '@/screens/welcome';

export default function WelcomeRoute() {
  // Singular: a double tap keeps one Username step in the stack.
  return (
    <Welcome
      onGetStarted={() => router.push('/onboarding/username', { dangerouslySingular: true })}
    />
  );
}
