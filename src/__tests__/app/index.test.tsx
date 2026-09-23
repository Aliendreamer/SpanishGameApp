import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { router as appRouter } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../../scripts/node-sqlite-db';

import StartRoute from '@/app/index';
import OnboardingLayout from '@/app/onboarding/_layout';
import WelcomeRoute from '@/app/onboarding/index';
import HowItWorksRoute from '@/app/onboarding/how-it-works';
import LevelRoute from '@/app/onboarding/level';
import UsernameRoute from '@/app/onboarding/username';
import TabsLayout from '@/app/(tabs)/_layout';
import ProgressRoute from '@/app/(tabs)/progress';
import SettingsRoute from '@/app/(tabs)/settings';
import SwipeRoute from '@/app/(tabs)/swipe';
import WordsRoute from '@/app/(tabs)/words';
import TutorialRoute from '@/app/tutorial';
import { LaunchContext } from '@/launch';
import type { LaunchPrefs } from '@/storage/prefs';
import { getSettings, migrate, saveSettings } from '@/storage/progress-db';

// Routes read progress.db through useSQLiteContext(); give them a real, migrated in-memory one.
let mockDb: TestDb;
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => mockDb }));

const routes = {
  index: StartRoute,
  'onboarding/_layout': OnboardingLayout,
  'onboarding/index': WelcomeRoute,
  'onboarding/username': UsernameRoute,
  'onboarding/level': LevelRoute,
  'onboarding/how-it-works': HowItWorksRoute,
  tutorial: TutorialRoute,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/swipe': SwipeRoute,
  '(tabs)/words': WordsRoute,
  '(tabs)/progress': ProgressRoute,
  '(tabs)/settings': SettingsRoute,
};

const firstLaunch: LaunchPrefs = { username: null, onboardingDone: false, showTutorial: true };

// renderRouter adds getPathname to the promise that Testing Library 14's render returns, so keep
// that object and await it separately; awaiting it (or returning it from an async function)
// drops the helper.
// The root layout reads the launch prefs; here they come straight from `launch`.
async function renderApp(initialUrl = '/', launch = firstLaunch) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LaunchContext value={launch}>{children}</LaunchContext>
  );
  const router = renderRouter(routes, { initialUrl, wrapper });
  await router;
  return { router };
}

const backLink = () => screen.queryByRole('button', { name: 'Back' });

describe('onboarding routes', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockDb = openTestDb();
    await migrate(mockDb);
    // The real dictionary, attached as the app does at startup (read only here).
    await mockDb.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
  });
  afterEach(() => mockDb.close());

  test('the start route opens Welcome as step 1, with no Back', async () => {
    const { router } = await renderApp();

    expect(router.getPathname()).toBe('/onboarding');
    expect(screen.getByLabelText('Step 1 of 4')).toBeOnTheScreen();
    expect(screen.getByText('Learn Spanish one swipe at a time')).toBeOnTheScreen();
    expect(backLink()).toBeNull();
  });

  test('Welcome → Username → saved → Level, with no way back', async () => {
    const { router } = await renderApp();

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(router.getPathname()).toBe('/onboarding/username');
    expect(screen.getByLabelText('Step 2 of 4')).toBeOnTheScreen();
    expect(backLink()).toBeNull();
    expect(appRouter.canGoBack()).toBe(false);

    await fireEvent.changeText(screen.getByPlaceholderText('Username'), '  Ana  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(router.getPathname()).toBe('/onboarding/level');
    expect(screen.getByLabelText('Step 3 of 4')).toBeOnTheScreen();
    expect(await screen.findByText('Pick your level')).toBeOnTheScreen();
    expect(backLink()).toBeNull();
    expect(appRouter.canGoBack()).toBe(false);
    expect(await AsyncStorage.getItem('username')).toBe('Ana');
  });

  test('Get started skips Username when a username is already saved', async () => {
    await AsyncStorage.setItem('username', 'Ana');
    const { router } = await renderApp();

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(router.getPathname()).toBe('/onboarding/level');
  });

  test('a double tap on Get started still leaves no history', async () => {
    const { router } = await renderApp();

    const getStarted = screen.getByRole('button', { name: 'Get started' });
    await fireEvent.press(getStarted);
    await fireEvent.press(getStarted);

    expect(router.getPathname()).toBe('/onboarding/username');
    expect(appRouter.canGoBack()).toBe(false);
  });

  test('Back on a step opened directly goes to the previous step', async () => {
    const { router } = await renderApp('/onboarding/how-it-works');

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(router.getPathname()).toBe('/onboarding/level');
  });

  test('Level opens on the saved settings', async () => {
    await saveSettings(mockDb, { level: 'advanced', includeLower: false });
    await renderApp('/onboarding/level');

    expect(await screen.findByRole('radio', { name: /^Advanced/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Include lower levels' })).not.toBeChecked();
  });

  test('Level saves the choice, opens How it works, and Back returns to Level', async () => {
    const { router } = await renderApp('/onboarding/level');

    await fireEvent.press(await screen.findByRole('radio', { name: /^Intermediate/ }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Include lower levels' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(router.getPathname()).toBe('/onboarding/how-it-works');
    expect(screen.getByLabelText('Step 4 of 4')).toBeOnTheScreen();
    expect(await getSettings(mockDb)).toEqual({
      level: 'intermediate',
      includeLower: false,
      includeKnown: false,
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(router.getPathname()).toBe('/onboarding/level');
  });
});

describe('launch routing', () => {
  const done: LaunchPrefs = { username: 'Ana', onboardingDone: true, showTutorial: true };

  beforeEach(async () => {
    await AsyncStorage.clear();
    mockDb = openTestDb();
    await migrate(mockDb);
    // The real dictionary, attached as the app does at startup (read only here).
    await mockDb.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
  });
  afterEach(() => mockDb.close());

  test('after onboarding, with the tutorial on, the app opens the Tutorial', async () => {
    const { router } = await renderApp('/', done);

    expect(router.getPathname()).toBe('/tutorial');
    expect(screen.getByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'How it works' })).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Step /)).toBeNull();
    expect(backLink()).toBeNull();
  });

  test('after onboarding, with the tutorial off, the app opens Swipe', async () => {
    const { router } = await renderApp('/', { ...done, showTutorial: false });

    expect(router.getPathname()).toBe('/swipe');
    expect(await screen.findByText('Tap to see the meaning')).toBeOnTheScreen();
  });

  test('the Tutorial saves its checkbox and opens Swipe', async () => {
    const { router } = await renderApp('/tutorial', done);

    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Start swiping' }));

    expect(router.getPathname()).toBe('/swipe');
    expect(await AsyncStorage.getItem('showTutorial')).toBe('false');
  });

  test('finishing onboarding saves the flags and lands on Swipe with no way back', async () => {
    const { router } = await renderApp('/onboarding/level');

    await fireEvent.press(await screen.findByRole('button', { name: 'Continue' }));
    expect(router.getPathname()).toBe('/onboarding/how-it-works');
    expect(
      screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
    ).toBeChecked();

    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Start swiping' }));

    expect(router.getPathname()).toBe('/swipe');
    expect(appRouter.canGoBack()).toBe(false);
    expect(await AsyncStorage.getItem('onboardingDone')).toBe('true');
    expect(await AsyncStorage.getItem('showTutorial')).toBe('false');
  });

  test('the Swipe tab deals the first word of the saved level, and tabs switch', async () => {
    await AsyncStorage.setItem('username', 'Ana');
    const { router } = await renderApp('/swipe', { ...done, showTutorial: false });

    expect(await screen.findByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByText('Beginner · A1, A2')).toBeOnTheScreen();
    expect(screen.getByText('0 / 100')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Swipe' })).toBeSelected();

    await fireEvent.press(screen.getByRole('tab', { name: 'Words' }));

    expect(router.getPathname()).toBe('/words');
    expect(screen.getByText('Words — coming next')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Words' })).toBeSelected();
  });

  test('the Swipe tab shows the full-screen error when its words cannot be loaded', async () => {
    await mockDb.execAsync('DETACH DATABASE vocab');
    await renderApp('/swipe', { ...done, showTutorial: false });

    expect(await screen.findByText('Something went wrong')).toBeOnTheScreen();
  });
});
