import { router } from 'expo-router';

import { Username } from '@/screens/username';
import { saveUsername } from '@/storage/prefs';

export default function UsernameRoute() {
  return (
    <Username
      onSubmit={async (name) => {
        // A failed save must not trap the user in onboarding; the name can be set again later.
        await saveUsername(name).catch(() => {});
        router.push('/onboarding/level', { dangerouslySingular: true });
      }}
    />
  );
}
