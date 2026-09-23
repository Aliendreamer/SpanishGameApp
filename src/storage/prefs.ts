import AsyncStorage from '@react-native-async-storage/async-storage';

// Lightweight user preferences kept on the phone (the design puts these in AsyncStorage;
// progress and game settings go to SQLite).
const KEYS = {
  username: 'username',
} as const;

export async function saveUsername(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.username, name.trim());
}

export async function getUsername(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.username);
}
