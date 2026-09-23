import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getLaunchPrefs,
  getUsername,
  saveShowTutorial,
  saveUsername,
  setOnboardingDone,
} from '@/storage/prefs';

describe('prefs', () => {
  beforeEach(() => AsyncStorage.clear());

  test('saveUsername stores the trimmed name under "username"', async () => {
    await saveUsername('  Ana  ');

    expect(await AsyncStorage.getItem('username')).toBe('Ana');
  });

  test('getUsername returns the saved name, or null when there is none', async () => {
    expect(await getUsername()).toBeNull();

    await saveUsername('Ana');

    expect(await getUsername()).toBe('Ana');
  });

  test('launch prefs default to a first launch: no username, onboarding not done, tutorial on', async () => {
    expect(await getLaunchPrefs()).toEqual({
      username: null,
      onboardingDone: false,
      showTutorial: true,
    });
  });

  test('launch prefs return what was saved', async () => {
    await saveUsername('Ana');
    await setOnboardingDone();
    await saveShowTutorial(false);

    expect(await getLaunchPrefs()).toEqual({
      username: 'Ana',
      onboardingDone: true,
      showTutorial: false,
    });
  });
});
