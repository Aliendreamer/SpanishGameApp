import { useFonts } from '@expo-google-fonts/bricolage-grotesque';
import { render, screen } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '@/app/_layout';

jest.mock('@expo-google-fonts/bricolage-grotesque', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { Stack: () => <MockText>stack</MockText> };
});

const mockUseFonts = jest.mocked(useFonts);

describe('<RootLayout />', () => {
  beforeEach(() => jest.clearAllMocks());

  test('keeps the splash screen up while the fonts load', async () => {
    mockUseFonts.mockReturnValue([false, null]);

    await render(<RootLayout />);

    expect(screen.queryByText('stack')).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  test('shows the app and hides the splash screen once the fonts are loaded', async () => {
    mockUseFonts.mockReturnValue([true, null]);

    await render(<RootLayout />);

    expect(screen.getByText('stack')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  test('still shows the app if the fonts fail to load', async () => {
    mockUseFonts.mockReturnValue([false, new Error('font failed')]);

    await render(<RootLayout />);

    expect(screen.getByText('stack')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });
});
