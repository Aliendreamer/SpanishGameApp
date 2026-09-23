import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveUsername } from '@/storage/prefs';

describe('prefs', () => {
  beforeEach(() => AsyncStorage.clear());

  test('saveUsername stores the trimmed name under "username"', async () => {
    await saveUsername('  Ana  ');

    expect(await AsyncStorage.getItem('username')).toBe('Ana');
  });
});
