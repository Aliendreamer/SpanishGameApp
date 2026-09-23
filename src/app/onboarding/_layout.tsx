import { type Href, router, Stack, useSegments } from 'expo-router';

import { colors } from '@/theme';
import { OnboardingShell } from '@/screens/onboarding-shell';

// Onboarding steps in order. The current route segment picks the active dot (`onboarding` is the
// group's index, Welcome); steps not built yet still count toward the dots. Onboarding only moves
// forward through Welcome, Username, and Level, so Back starts at How it works.
const STEPS: { segment: string; href: Href; back: boolean }[] = [
  { segment: 'onboarding', href: '/onboarding', back: false },
  { segment: 'username', href: '/onboarding/username', back: false },
  { segment: 'level', href: '/onboarding/level', back: false },
  { segment: 'how-it-works', href: '/onboarding/how-it-works', back: true },
];

export default function OnboardingLayout() {
  const segments = useSegments();
  const current = segments.at(-1);
  const step = Math.max(
    0,
    STEPS.findIndex(({ segment }) => segment === current),
  );

  // A step opened directly (deep link, dev reload) has no history: go to the previous step instead.
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(STEPS[step - 1].href);
  };

  return (
    <OnboardingShell step={step} count={STEPS.length} showBack={STEPS[step].back} onBack={goBack}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </OnboardingShell>
  );
}
