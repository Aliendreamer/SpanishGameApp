import { useFonts } from '@expo-google-fonts/bricolage-grotesque';
import { render, screen } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '@/app/_layout';
import { migrate } from '@/storage/progress-db';

jest.mock('@expo-google-fonts/bricolage-grotesque', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { Stack: () => <MockText>stack</MockText> };
});

// Records the provider's props and renders its children, as the real one does once onInit is
// done; with mockInitError set it reports that error through onError instead, like a failed init.
const mockProviderProps: Record<string, unknown>[] = [];
let mockInitError: Error | null = null;
jest.mock('expo-sqlite', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    SQLiteProvider: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      onError?: (error: Error) => void;
    }) => {
      mockProviderProps.push(props);
      useEffect(() => {
        if (mockInitError) props.onError?.(mockInitError);
      }, [props]);
      return mockInitError ? null : children;
    },
  };
});

const mockUseFonts = jest.mocked(useFonts);

describe('<RootLayout />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProviderProps.length = 0;
    mockInitError = null;
  });

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

  test('opens progress.db and migrates it before showing the app', async () => {
    mockUseFonts.mockReturnValue([true, null]);

    await render(<RootLayout />);

    expect(mockProviderProps.at(-1)).toEqual(
      expect.objectContaining({ databaseName: 'progress.db', onInit: migrate }),
    );
    expect(screen.getByText('stack')).toBeOnTheScreen();
  });

  test('shows a full-screen error and hides the splash if progress.db cannot be opened', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    mockInitError = new Error('disk full');

    await render(<RootLayout />);

    expect(await screen.findByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.queryByText('stack')).toBeNull();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
