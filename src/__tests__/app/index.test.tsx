import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen } from '@testing-library/react-native';
import { router as appRouter } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import StartRoute from '@/app/index';
import OnboardingLayout from '@/app/onboarding/_layout';
import WelcomeRoute from '@/app/onboarding/index';
import LevelRoute from '@/app/onboarding/level';
import UsernameRoute from '@/app/onboarding/username';

const routes = {
  index: StartRoute,
  'onboarding/_layout': OnboardingLayout,
  'onboarding/index': WelcomeRoute,
  'onboarding/username': UsernameRoute,
  'onboarding/level': LevelRoute,
  // Stand-in for step 4, the first step with Back, until How it works is built.
  'onboarding/how-it-works': () => <Text>How it works</Text>,
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
  beforeEach(() => AsyncStorage.clear());

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
    expect(screen.getByText('Level — coming next')).toBeOnTheScreen();
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
});
