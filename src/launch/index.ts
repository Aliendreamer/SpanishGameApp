import { createContext } from 'react';

import { FIRST_LAUNCH, type LaunchPrefs } from '@/storage/prefs';

// Where the app opens (docs/design/swipe-game-ui/README.md, "Launch routing").
export function launchTarget({
  onboardingDone,
  showTutorial,
}: Pick<LaunchPrefs, 'onboardingDone' | 'showTutorial'>) {
  if (!onboardingDone) return '/onboarding';
  return showTutorial ? '/tutorial' : '/swipe';
}

// The launch prefs as read once at startup, before the splash hides. Only the start route and the
// tutorial greeting read them; flows that change the flags navigate explicitly.
export const LaunchContext = createContext<LaunchPrefs>(FIRST_LAUNCH);
