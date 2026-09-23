import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import WelcomeRoute from '@/app/index';
import UsernameRoute from '@/app/onboarding/username';

describe('start route', () => {
  test('opens on Welcome, and "Get started" goes to the username step', async () => {
    // renderRouter adds getPathname to the promise that Testing Library 14's render returns, so keep
    // that object and await it separately; awaiting the call directly drops the helper.
    const router = renderRouter({ index: WelcomeRoute, 'onboarding/username': UsernameRoute });
    await router;

    expect(router.getPathname()).toBe('/');
    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(router.getPathname()).toBe('/onboarding/username');
    expect(screen.getByText('Username — coming next')).toBeOnTheScreen();
  });
});
