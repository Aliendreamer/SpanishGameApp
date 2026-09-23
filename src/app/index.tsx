import { Redirect } from 'expo-router';
import { use } from 'react';

import { LaunchContext, launchTarget } from '@/launch';

// The first screen: Welcome until onboarding is done, then the Tutorial or Swipe.
export default function StartRoute() {
  return <Redirect href={launchTarget(use(LaunchContext))} />;
}
