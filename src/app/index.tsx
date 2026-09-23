import { Redirect } from 'expo-router';

// Launch routing lands here; until onboarding is stored, every launch starts at Welcome.
export default function StartRoute() {
  return <Redirect href="/onboarding" />;
}
