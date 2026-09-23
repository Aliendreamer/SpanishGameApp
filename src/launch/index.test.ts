import { launchTarget } from '@/launch';

const prefs = { username: 'Ana', onboardingDone: true, showTutorial: true };

describe('launchTarget', () => {
  test('opens Welcome until onboarding is done', () => {
    expect(launchTarget({ ...prefs, onboardingDone: false })).toBe('/onboarding');
  });

  test('opens the Tutorial after onboarding while it is switched on', () => {
    expect(launchTarget(prefs)).toBe('/tutorial');
  });

  test('opens Swipe after onboarding once the tutorial is switched off', () => {
    expect(launchTarget({ ...prefs, showTutorial: false })).toBe('/swipe');
  });
});
