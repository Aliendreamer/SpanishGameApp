import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUsername, saveUsername } from '@/storage/prefs';

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
});
