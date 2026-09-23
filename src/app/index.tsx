import { router } from 'expo-router';

import { Welcome } from '@/screens/welcome';

export default function WelcomeRoute() {
  return <Welcome onGetStarted={() => router.push('/onboarding/username')} />;
}
