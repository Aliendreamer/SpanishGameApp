import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen } from '@testing-library/react-native';
import { router as appRouter } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import { openTestDb, type TestDb } from '../../../scripts/node-sqlite-db';

import StartRoute from '@/app/index';
import OnboardingLayout from '@/app/onboarding/_layout';
import WelcomeRoute from '@/app/onboarding/index';
import HowItWorksRoute from '@/app/onboarding/how-it-works';
import LevelRoute from '@/app/onboarding/level';
import UsernameRoute from '@/app/onboarding/username';
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
};

// renderRouter adds getPathname to the promise that Testing Library 14's render returns, so keep
// that object and await it separately; awaiting it (or returning it from an async function)
// drops the helper.
async function renderApp(initialUrl = '/') {
  const router = renderRouter(routes, { initialUrl });
  await router;
  return { router };
}

const backLink = () => screen.queryByRole('button', { name: 'Back' });

describe('onboarding routes', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockDb = openTestDb();
    await migrate(mockDb);
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
