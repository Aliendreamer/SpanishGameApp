import AsyncStorage from '@react-native-async-storage/async-storage';

// Lightweight user preferences kept on the phone (the design puts these in AsyncStorage; game
// settings and progress live in progress.db).
const KEYS = {
  username: 'username',
  onboardingDone: 'onboardingDone',
  showTutorial: 'showTutorial',
} as const;

// What the app needs to decide its first screen.
export type LaunchPrefs = {
  username: string | null;
  onboardingDone: boolean;
  showTutorial: boolean;
};

// A launch with nothing stored yet; also the fallback when the prefs can't be read.
export const FIRST_LAUNCH: LaunchPrefs = {
  username: null,
  onboardingDone: false,
  showTutorial: true,
};

export async function saveUsername(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.username, name.trim());
}

export async function getUsername(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.username);
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboardingDone, 'true');
}

export async function saveShowTutorial(show: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.showTutorial, String(show));
}

export async function getLaunchPrefs(): Promise<LaunchPrefs> {
  const [[, username], [, onboardingDone], [, showTutorial]] = await AsyncStorage.multiGet([
    KEYS.username,
    KEYS.onboardingDone,
    KEYS.showTutorial,
  ]);
  return {
    username,
    onboardingDone: onboardingDone === 'true',
    // On until the user turns it off.
    showTutorial: showTutorial !== 'false',
  };
}
